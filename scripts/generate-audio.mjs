import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import "dotenv/config";
import { safeParseSpec } from "./lib/spec-schema.mjs";
import { planAudio, mp3Path, alignPath, AUDIO_DIR, MODEL_ID, resolveVoiceId } from "./lib/audio-cache.mjs";
import { approvalState } from "./lib/content-hash.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY — check .env");
  process.exit(1);
}

const specPath = process.argv[2] ?? "specs/brd-tutorial-v2.spec.json";
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const parsed = safeParseSpec(JSON.parse(readFileSync(specPath, "utf8")));
if (!parsed.success) {
  console.error("Spec failed validation:\n");
  for (const i of parsed.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
const spec = parsed.data;
const voiceId = resolveVoiceId(spec);

const approval = approvalState(spec);
if (!approval.ok && !dryRun && !process.argv.includes("--skip-approval")) {
  console.error(`REFUSING to spend credits: ${approval.reason}`);
  if (approval.was) {
    console.error(`  approved hash : ${approval.was}`);
    console.error(`  current hash  : ${approval.now}`);
  }
  console.error(`\nRun the review page and approve first:`);
  console.error(`  node scripts/review.mjs ${specPath}`);
  console.error(`\n(--skip-approval overrides this, deliberately inconvenient)`);
  process.exit(1);
}

const plan = planAudio(spec, voiceId);
const todo = [...plan.values()].filter((p) => force || !existsSync(mp3Path(p.key)));
const cachedCount = plan.size - todo.length;
const chars = todo.reduce((n, p) => n + p.narration.length, 0);

console.log(`spec        : ${specPath}`);
console.log(`voice       : ${voiceId}`);
console.log(`narration   : ${plan.size} distinct lines`);
console.log(`cached      : ${cachedCount}`);
console.log(`to generate : ${todo.length}  (${chars.toLocaleString()} characters)`);
console.log(`quota cost  : ${(100 * chars / 30000).toFixed(1)}% of a 30,000-credit month`);
console.log(`approval    : ${approval.ok ? `${approval.at} by ${approval.by}` : approval.reason}`);

if (dryRun) {
  console.log(`\nDry run — nothing generated. Drop --dry-run to spend credits.`);
  process.exit(0);
}
if (!todo.length) {
  console.log(`\nEverything cached. Nothing to do.`);
  process.exit(0);
}

mkdirSync(AUDIO_DIR, { recursive: true });

// Imported lazily so --dry-run works without the SDK present.
const { ElevenLabsClient } = await import("elevenlabs");
const client = new ElevenLabsClient({ apiKey });

let spent = 0;
for (const [i, item] of todo.entries()) {
  const res = await client.textToSpeech.convertWithTimestamps(voiceId, {
    text: item.narration,
    model_id: MODEL_ID,
  });
  writeFileSync(mp3Path(item.key), Buffer.from(res.audio_base64, "base64"));
  writeFileSync(alignPath(item.key), JSON.stringify(res.alignment, null, 2));
  spent += item.narration.length;
  const label = item.narration.length > 46 ? item.narration.slice(0, 43) + "..." : item.narration;
  console.log(`  [${i + 1}/${todo.length}] ${item.key}  ${item.usedBy.join(",")}  "${label}"`);
}
console.log(`\nGenerated ${todo.length} clips, ${spent.toLocaleString()} characters spent.`);
