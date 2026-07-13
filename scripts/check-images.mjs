// Build guard: fails if any photo under content/ was committed without going
// through `npm run image` (scripts/optimize-image.mjs). The reliable tell-tale
// is EXIF — the optimizer strips it, so a JPEG that still carries EXIF is a raw
// camera export (and probably still has GPS coords + full resolution). As a
// secondary net it also flags anything at raw-camera resolution, while leaving
// legitimate HD diagram/figure exports (~1920px) alone. Runs first in
// `npm run build`, so it blocks both local builds and the GitHub Pages CI deploy.

import sharp from "sharp";
import { readdirSync } from "node:fs";
import { extname, join } from "node:path";

const CONTENT_DIR = "content";
// The optimizer targets 1600px, but the guard only errors above 2048 so that
// intentionally-larger renders (e.g. 1920px diagrams) aren't false-flagged.
// Raw iPhone photos are 3024–4032px, so this still catches an un-resized one.
const MAX_DIMENSION = 2048;

const files = readdirSync(CONTENT_DIR, { recursive: true })
  .map((f) => join(CONTENT_DIR, f))
  .filter((f) => [".jpg", ".jpeg"].includes(extname(f).toLowerCase()));

const problems = [];
for (const file of files) {
  const meta = await sharp(file).metadata();
  const longEdge = Math.max(meta.width, meta.height);
  if (meta.exif) {
    problems.push(`${file}\n  has EXIF metadata (raw photo?) — run: npm run image -- ${file} <output>`);
  } else if (longEdge > MAX_DIMENSION) {
    problems.push(`${file}\n  ${meta.width}x${meta.height} is raw-camera-sized (>${MAX_DIMENSION}px) — run: npm run image`);
  }
}

if (problems.length) {
  console.error("✗ check-images: un-optimized photos found\n");
  for (const p of problems) console.error("✗ " + p);
  console.error("\n✗ build aborted.");
  process.exit(1);
}

console.log(`check-images: ${files.length} photo(s) OK`);
