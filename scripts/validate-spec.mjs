import { readFileSync } from "fs";
import { safeParseSpec } from "./lib/spec-schema.mjs";

const specPath = process.argv[2];
if (!specPath) {
  console.error("Usage: node scripts/validate-spec.mjs <spec.json>");
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(readFileSync(specPath, "utf8"));
} catch (err) {
  console.error(`Not valid JSON: ${err.message}`);
  process.exit(1);
}

const r = safeParseSpec(raw);
if (!r.success) {
  console.error(`INVALID — ${r.error.issues.length} problem(s):\n`);
  for (const i of r.error.issues) {
    const at = i.path.length ? i.path.join(".") : "(root)";
    console.error(`  ${at}\n    ${i.message}`);
  }
  console.error(`\nPaste the above back to Claude and ask it to fix and re-emit the spec.`);
  process.exit(1);
}

const spec = r.data;

// Advisory checks the schema can't express
const notes = [];
const CPS = 15.5;

for (const s of spec.steps) {
  if (!s.narration) continue;
  const words = s.narration.split(/\s+/).length;
  if (words < 6 && s.minHoldSeconds === undefined)
    notes.push(`${s.id}: only ${words} words and no minHoldSeconds — will flash by`);
  if (words > 40) notes.push(`${s.id}: ${words} words in one line — consider splitting into two steps`);
  for (const b of s.beats) {
    if (!b.caption) continue;
    const cw = b.caption.split(/\s+/).length;
    if (cw > 9) notes.push(`${s.id}: caption is ${cw} words — captions are labels, aim for 3-7`);
    if (b.caption.toLowerCase() === s.narration.toLowerCase().replace(/[.?!]$/, ""))
      notes.push(`${s.id}: caption transcribes the narration`);
  }
  if (/\bvlox\b/i.test(s.narration) || s.beats.some((b) => /\bvlox\b/i.test(b.caption ?? "")))
    notes.push(`${s.id}: "VLOX" should be "Velox"`);
  if (/—/.test(s.narration)) notes.push(`${s.id}: contains an em dash`);
}

const last = spec.steps.at(-1);
if (last.role !== "outro") notes.push(`last step ${last.id} has role "${last.role}", expected "outro"`);

const ids = spec.steps.map((s) => s.id);
ids.forEach((id, i) => {
  const want = `s${String(i + 1).padStart(2, "0")}`;
  if (id !== want) notes.push(`step ${i + 1} has id "${id}", expected "${want}"`);
});

if (spec.videoType === "tutorial" && spec.variants.length > 1)
  notes.push(`tutorial has ${spec.variants.length} variants — tutorial bodies should not vary`);
if (spec.videoType === "promo" && spec.variants.length < 4)
  notes.push(`promo has only ${spec.variants.length} variant(s) — aim for 4-6`);
if (!spec.variants.some((v) => v.id === "v0-control"))
  notes.push(`no v0-control baseline variant`);

const chars = new Set();
const add = (st) => st?.narration && chars.add(st.narration);
spec.steps.forEach(add);
spec.variants.forEach((v) => { add(v.hook); add(v.cta); });
const totalChars = [...chars].reduce((n, t) => n + t.length, 0);
const shots = new Set();
spec.steps.forEach((s) => s.beats.forEach((b) => shots.add(b.screenshot)));

console.log(`VALID`);
console.log(`  ${spec.module} / ${spec.videoType}, theme ${spec.theme}`);
console.log(`  ${spec.steps.length} steps, ${spec.steps.reduce((n, s) => n + s.beats.length, 0)} beats, ${spec.variants.length} variant(s)`);
console.log(`  ${shots.size} distinct screenshots referenced`);
console.log(`  ${chars.size} narration lines, ${totalChars.toLocaleString()} chars`);
console.log(`  est. audio cost: ${(100 * totalChars / 30000).toFixed(1)}% of a 30,000-credit month`);
console.log(`  est. runtime: ~${Math.round(totalChars / CPS)}s`);

if (notes.length) {
  console.log(`\n${notes.length} style note(s) — advisory, not blocking:`);
  for (const n of notes) console.log(`  ${n}`);
} else {
  console.log(`\nNo style notes.`);
}
