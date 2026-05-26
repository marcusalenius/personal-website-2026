// Regenerates public/og/default.png — the "Marcus Alenius" title card.
// Colors are read from app/globals.css :root, so changing a token there and
// re-running (`npm run og`) updates the OG image. Run after editing the SVG/tokens.
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");

// Pull a `--name: #value;` declaration out of globals.css.
function token(name) {
  const m = css.match(new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!m) throw new Error(`token --${name} not found in globals.css`);
  return m[1];
}

const bg = token("color-bg");
const accent = token("color-accent");
const heading = token("color-text-heading");

const bold = readFileSync(join(ROOT, "assets", "fonts", "NunitoSans-Bold.ttf"));
const boldItalic = readFileSync(join(ROOT, "assets", "fonts", "NunitoSans-BoldItalic.ttf"));

// Mirrors the <Title> component: "Marcus" upright accent, "Alenius" italic ink.
const name = (text, style) => ({
  type: "div",
  props: { style: { fontFamily: "Nunito Sans", fontWeight: 700, fontSize: 150, lineHeight: 1.1, ...style }, children: text },
});

const tree = {
  type: "div",
  props: {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      backgroundColor: bg,
      padding: "0 110px",
    },
    children: [
      name("Marcus", { color: accent }),
      name("Alenius", { color: heading, fontStyle: "italic" }),
    ],
  },
};

const svg = await satori(tree, {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Nunito Sans", data: bold, weight: 700, style: "normal" },
    { name: "Nunito Sans", data: boldItalic, weight: 700, style: "italic" },
  ],
});

const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
writeFileSync(join(ROOT, "public", "og", "default.png"), png);

console.log(`Generated public/og/default.png (1200x630) — accent ${accent}, ink ${heading}, bg ${bg}`);
