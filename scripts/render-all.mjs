import { execSync } from "child_process";
import { readFileSync, mkdirSync, existsSync, readdirSync } from "fs";

const slug = process.argv[2];
const onlyVariant = process.argv[3];

if (!slug) {
  const dirs = existsSync("out/props") ? readdirSync("out/props") : [];
  console.error("Usage: node scripts/render-all.mjs <slug> [variantId]");
  console.error(dirs.length ? `\nAvailable: ${dirs.join(", ")}` : "\nNo props built yet — run build-props first.");
  process.exit(1);
}

const manifestPath = `out/props/${slug}/_manifest.json`;
if (!existsSync(manifestPath)) {
  console.error(`No manifest at ${manifestPath} — run build-props for this spec first.`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const targets = onlyVariant ? manifest.filter((m) => m.variant === onlyVariant) : manifest;

if (!targets.length) {
  console.error(`No variant "${onlyVariant}". Known: ${manifest.map((m) => m.variant).join(", ")}`);
  process.exit(1);
}

mkdirSync("out/videos", { recursive: true });
const start = Date.now();

for (const [i, m] of targets.entries()) {
  const out = `out/videos/${slug}-${m.variant}.mp4`;
  console.log(`\n=== [${i + 1}/${targets.length}] ${slug} / ${m.variant}  ${m.runtime} ===`);
  execSync(
    `npx remotion render Walkthrough "${out}" --props="out/props/${slug}/${m.variant}.json"`,
    { stdio: "inherit" }
  );
}
console.log(`\n${targets.length} video(s) in ${((Date.now() - start) / 1000 / 60).toFixed(1)} min`);
