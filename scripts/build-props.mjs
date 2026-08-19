import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { safeParseSpec } from "./lib/spec-schema.mjs";
import { resolveAll } from "./lib/resolve.mjs";
import { audioKey, alignPath, mp3Path, publicAudioRef, resolveVoiceId } from "./lib/audio-cache.mjs";
import { buildTimeline } from "./lib/timeline.mjs";

const FPS = 30;
const specPath = process.argv[2] ?? "specs/brd-tutorial-v2.spec.json";

const parsed = safeParseSpec(JSON.parse(readFileSync(specPath, "utf8")));
if (!parsed.success) {
  console.error("Spec failed validation:\n");
  for (const i of parsed.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
const spec = parsed.data;
const voiceId = resolveVoiceId(spec);
const slug = [spec.module, spec.part, spec.videoType].filter(Boolean).join("-");
const assetPrefix = `assets/${slug}`;

// Alignment lookup, memoised per narration string
const cache = new Map();
function getAudio(narration) {
  if (cache.has(narration)) return cache.get(narration);
  const key = audioKey(narration, voiceId);
  const ap = alignPath(key);
  if (!existsSync(ap) || !existsSync(mp3Path(key))) {
    cache.set(narration, null);
    return null;
  }
  const entry = {
    key,
    ref: publicAudioRef(key),
    alignment: JSON.parse(readFileSync(ap, "utf8")),
  };
  cache.set(narration, entry);
  return entry;
}

const propsDir = `out/props/${slug}`;
mkdirSync(propsDir, { recursive: true });

const manifest = [];
const allWarnings = [];

for (const resolved of resolveAll(spec)) {
  let timeline;
  try {
    timeline = buildTimeline(resolved, { fps: FPS, assetPrefix, getAudio });
  } catch (err) {
    console.error(`\n${resolved.variantId}: ${err.message}`);
    process.exit(1);
  }

  writeFileSync(`${propsDir}/${resolved.variantId}.json`, JSON.stringify(timeline, null, 2));

  const secs = timeline.totalDurationInFrames / FPS;
  manifest.push({
    slug,
    variant: resolved.variantId,
    beats: timeline.stats.beats,
    screens: timeline.stats.screens,
    merged: timeline.stats.screensMergedAway,
    captions: timeline.stats.captions,
    focus: timeline.stats.focusPoints,
    frames: timeline.totalDurationInFrames,
    runtime: `${Math.floor(secs / 60)}m ${Math.round(secs % 60)}s`,
  });
  allWarnings.push(...timeline.warnings.map((w) => `${resolved.variantId}: ${w}`));
}

writeFileSync(`${propsDir}/_manifest.json`, JSON.stringify(manifest, null, 2));

// Studio needs one timeline checked in as the default preview
writeFileSync("public/timeline.json", readFileSync(`${propsDir}/${spec.variants[0].id}.json`));

console.table(manifest);
if (allWarnings.length) {
  console.log("\nWarnings:");
  for (const w of [...new Set(allWarnings)]) console.log(`  ${w}`);
}
console.log(`\n${manifest.length} prop file(s) in ${propsDir}/`);
console.log(`render with: node scripts/render-all.mjs ${slug}`);
