// Regenerates favicon.ico and apple-icon.png from app/icon.svg.
// Run after editing the SVG: `npm run icons`.
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const APP = join(dirname(fileURLToPath(import.meta.url)), "..", "app");
const svg = readFileSync(join(APP, "icon.svg"), "utf8");

// Rasterize an SVG string to a PNG Buffer at the given square pixel width.
const renderPng = (svgStr, size) =>
  Buffer.from(
    new Resvg(svgStr, { fitTo: { mode: "width", value: size } }).render().asPng()
  );

// Extract the two <path .../> elements (the M and A glyphs).
const paths = svg.match(/<path[^>]*\/>/g);
if (!paths || paths.length < 2) throw new Error("could not find glyph paths in icon.svg");

// Apple touch icon: full-bleed paper square (iOS rounds it itself, so transparent
// corners would show as black). Glyphs scaled 120 -> 180 to keep the same margins.
const appleSvg = `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
<rect width="180" height="180" fill="#F8F7F4"/>
<g transform="scale(1.5)">
${paths.join("\n")}
</g>
</svg>`;

writeFileSync(join(APP, "apple-icon.png"), renderPng(appleSvg, 180));

// favicon.ico: PNG-encoded frames at 16/32/48 (transparent rounded corners).
const sizes = [16, 32, 48];
const frames = sizes.map((size) => ({ size, png: renderPng(svg, size) }));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(frames.length, 4); // image count
const entries = Buffer.alloc(16 * frames.length);
let offset = 6 + 16 * frames.length;
const datas = [];
frames.forEach((f, i) => {
  const e = i * 16;
  entries.writeUInt8(f.size >= 256 ? 0 : f.size, e + 0); // width (0 = 256)
  entries.writeUInt8(f.size >= 256 ? 0 : f.size, e + 1); // height
  entries.writeUInt8(0, e + 2); // palette size
  entries.writeUInt8(0, e + 3); // reserved
  entries.writeUInt16LE(1, e + 4); // color planes
  entries.writeUInt16LE(32, e + 6); // bits per pixel
  entries.writeUInt32LE(f.png.length, e + 8); // image data size
  entries.writeUInt32LE(offset, e + 12); // image data offset
  offset += f.png.length;
  datas.push(f.png);
});
writeFileSync(join(APP, "favicon.ico"), Buffer.concat([header, entries, ...datas]));

console.log("Generated app/apple-icon.png (180x180) and app/favicon.ico (16/32/48)");
