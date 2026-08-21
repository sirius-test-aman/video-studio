/**
 * Materialise a video's asset folder from the module library.
 *
 *   node scripts/stage.mjs <module> <videoType> --tabs setup,enhance [--part enhance]
 *
 * The library is the master: descriptive names, one manifest, frames captured
 * once and reused. A staged folder is derived from it — step-01.png upward in
 * manifest order, which is what the render pipeline expects.
 *
 * Also writes frames.json alongside, mapping each step back to what it shows.
 * That is the file an author reads to pick frames without opening images.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from "fs";
import { padPngInPlace } from "./lib/ffmpeg.mjs";

const [mod, videoType, ...rest] = process.argv.slice(2);
if (!mod || !videoType) {
  console.error("Usage: node scripts/stage.mjs <module> <videoType> --tabs a,b [--product velox] [--part name] [--target 1920x1080] [--force]");
  process.exit(1);
}
const arg = (n, d) => { const i = rest.indexOf(`--${n}`); return i === -1 ? d : rest[i + 1]; };
const tabs = (arg("tabs", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
const part = arg("part", null);
const product = arg("product", null);
const [TW, TH] = arg("target", "1920x1080").split("x").map(Number);
const force = rest.includes("--force");

const LIB = `library/${mod}`;
const MANIFEST = `${LIB}/manifest.json`;
if (!existsSync(MANIFEST)) { console.error(`No manifest at ${MANIFEST}`); process.exit(1); }
const m = JSON.parse(readFileSync(MANIFEST, "utf8"));

const slug = [mod, part, videoType].filter(Boolean).join("-");
const DEST = `public/assets/${slug}`;

let picked = m.flow.filter((e) => (tabs.length ? tabs.includes(e.tab) : true));

// A frame with no product is shared and always included. A tagged frame is
// included only for its own product.
if (product) {
  const before = picked.length;
  picked = picked.filter((e) => !e.product || e.product === product);
  const dropped = before - picked.length;
  if (dropped) console.log(`excluded ${dropped} frame(s) belonging to another product\n`);
}
if (!picked.length) {
  const seen = [...new Set(m.flow.map((e) => e.tab))];
  console.error(`No frames matched tabs [${tabs.join(", ")}]. Library has: ${seen.join(", ")}`);
  process.exit(1);
}

const missing = picked.filter((e) => !existsSync(`${LIB}/${e.file}`));
if (missing.length) {
  console.error(`${missing.length} frame(s) in the manifest have no file:`);
  for (const e of missing) console.error(`  ${e.file}`);
  console.error(`Run: node scripts/library.mjs ${mod} --sync`);
  process.exit(1);
}

if (existsSync(DEST)) {
  const existing = readdirSync(DEST).filter((f) => /^step-\d+\./.test(f));
  if (existing.length && !force) {
    console.error(`${DEST} already holds ${existing.length} step-NN file(s).`);
    console.error(`Re-stage with --force to replace them.`);
    process.exit(1);
  }
  for (const f of existing) rmSync(`${DEST}/${f}`);
}
mkdirSync(DEST, { recursive: true });

const frames = [];
let padded = 0;
picked.forEach((e, i) => {
  const name = `step-${String(i + 1).padStart(2, "0")}.png`;
  copyFileSync(`${LIB}/${e.file}`, `${DEST}/${name}`);
  const r = padPngInPlace(`${DEST}/${name}`, TW, TH);
  if (r.padded) padded++;
  frames.push({ step: name, from: e.file, tab: e.tab, shows: e.shows || "", padded: !!r.padded, scaled: !!r.scaled });
  const note = r.padded
    ? r.scaled ? `  (${r.from} scaled to ${r.fitted}, centred)` : `  (padded from ${r.from})`
    : "";
  console.log(`  ${name}  <-  ${e.file}${note}`);
});

writeFileSync(`${DEST}/frames.json`, JSON.stringify({ slug, module: mod, part, product, videoType, tabs, frames }, null, 2) + "\n");

console.log(`\n${frames.length} frame(s) staged to ${DEST}/`);
if (padded) console.log(`${padded} fitted onto ${TW}x${TH}`);
console.log(`frames.json written — an author reads this to know what each step shows`);
console.log(`\nspec must use:  "module": "${mod}"${part ? `, "part": "${part}"` : ""}, "videoType": "${videoType}"`);
