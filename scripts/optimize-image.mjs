// Prepares an iPhone/camera photo for the web. Because next.config.mjs sets
// `images: { unoptimized: true }` (static export to GitHub Pages), the file we
// commit is exactly what every visitor downloads — so this script IS the whole
// optimization pipeline. For each input it:
//   1. auto-orients   — bakes the EXIF rotation flag into the pixels
//   2. resizes        — long edge capped at MAX_WIDTH (never upscales)
//   3. converts sRGB  — flattens iPhone's Display-P3 wide gamut so colors are
//                       consistent across browsers
//   4. strips metadata — drops EXIF/GPS, XMP, and the HDR gain map (sharp reads
//                        only the primary image and, by default, writes no
//                        metadata), leaving a plain SDR image
//   5. re-encodes     — progressive mozjpeg, 4:2:0 chroma subsampling
//
// Usage:
//   npm run image -- <input> [output] [--width 1600] [--quality 82]
//
// If `output` is omitted the optimized image takes the original's name (so the
// `<Image src>` path doesn't change) and the raw file is moved aside to
// "<name>-unoptimized<ext>" as a backup. When done it prints the final
// dimensions and a ready-to-paste <Image> tag (width/height matter — <Image>
// needs the real aspect ratio to avoid layout shift).

import sharp from "sharp";
import { existsSync, renameSync, statSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";

const MAX_WIDTH = 1600; // matches the 680px content column at 2x (see Layout.tsx)
const QUALITY = 82;

const kb = (n) => `${Math.round(n / 1024)} KB`;
const rel = (p) => p.replace(`${process.cwd()}/`, "");

// --- parse args: positional input [output], plus --width / --quality flags ---
const args = process.argv.slice(2);
const positional = [];
let maxWidth = MAX_WIDTH;
let quality = QUALITY;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--width") maxWidth = Number(args[++i]);
  else if (args[i] === "--quality") quality = Number(args[++i]);
  else positional.push(args[i]);
}

const [input, outputArg] = positional;
if (!input) {
  console.error("Usage: npm run image -- <input> [output] [--width N] [--quality N]");
  process.exit(1);
}

const inputPath = resolve(input);
const ext = extname(inputPath);
const name = basename(inputPath, ext);
const dir = dirname(inputPath);

// Resolve the source we read from and the path we write to. By default we keep
// the original filename for the optimized output and back the raw file up to
// "<name>-unoptimized<ext>"; an explicit `output` writes there and leaves the
// input untouched.
let sourcePath = inputPath;
let output;
let backup;
if (outputArg) {
  output = resolve(outputArg);
  if (output === inputPath) {
    console.error(`Refusing to overwrite the source in place: ${input}`);
    console.error("Pass a different output path, or omit it to back the original up.");
    process.exit(1);
  }
} else {
  backup = join(dir, `${name}-unoptimized${ext}`);
  if (existsSync(backup)) {
    console.error(`Backup already exists: ${rel(backup)}`);
    console.error("Move or delete it first so an earlier original isn't lost.");
    process.exit(1);
  }
  renameSync(inputPath, backup);
  sourcePath = backup;
  output = join(dir, `${name}.jpg`);
}

const before = statSync(sourcePath).size;

const info = await sharp(sourcePath, { failOn: "none" })
  .rotate() // auto-orient from EXIF, then metadata gets stripped below
  .resize(maxWidth, maxWidth, { fit: "inside", withoutEnlargement: true })
  .withIccProfile("srgb") // transform Display-P3 -> sRGB and attach sRGB profile
  .jpeg({ quality, progressive: true, chromaSubsampling: "4:2:0", mozjpeg: true })
  .toFile(output);

const after = statSync(output).size;

console.log(`${rel(sourcePath)} (${kb(before)})  ->  ${rel(output)} (${kb(after)})`);
if (backup) console.log(`kept original as ${rel(backup)}`);
console.log(`${info.width}x${info.height}, sRGB, metadata stripped`);
console.log(
  `\n<Image src="./${basename(output)}" width={${info.width}} height={${info.height}} alt="" />`,
);
