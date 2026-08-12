import { readFileSync, readdirSync, existsSync } from "fs";
import { safeParseSpec } from "./lib/spec-schema.mjs";

const specPath = process.argv[2] ?? "specs/brd-tutorial-v2.spec.json";

const parsed = safeParseSpec(JSON.parse(readFileSync(specPath, "utf8")));
if (!parsed.success) {
  console.error("Spec failed validation:\n");
  for (const i of parsed.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
const spec = parsed.data;
const dir = `public/assets/${spec.module}-${spec.videoType}`;

// Every screenshot the spec asks for, and who asks for it
const wanted = new Map();
const note = (file, who) => {
  if (!wanted.has(file)) wanted.set(file, []);
  wanted.get(file).push(who);
};
for (const s of spec.steps) for (const b of s.beats) note(b.screenshot, s.id);
for (const v of spec.variants)
  for (const slot of ["hook", "cta"])
    if (v[slot]) for (const b of v[slot].beats) note(b.screenshot, `${v.id}/${slot}`);

if (!existsSync(dir)) {
  console.error(`Asset folder does not exist: ${dir}`);
  console.error(`\nCreate it and add the screenshots, then re-run.`);
  process.exit(1);
}

const onDisk = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

const missing = [...wanted.keys()].filter((f) => !onDisk.includes(f)).sort();
const unused = onDisk.filter((f) => !wanted.has(f)).sort();

console.log(`Spec:   ${specPath}`);
console.log(`Folder: ${dir}`);
console.log(`\n  referenced by spec : ${wanted.size}`);
console.log(`  present on disk    : ${onDisk.length}`);

if (missing.length) {
  console.log(`\nMISSING (${missing.length}) — spec references these, folder does not have them:`);
  for (const f of missing) console.log(`  ${f.padEnd(16)} needed by ${wanted.get(f).join(", ")}`);
}

if (unused.length) {
  console.log(`\nUNUSED (${unused.length}) — on disk, no step references them.`);
  console.log(`  This is normal: intermediate loading states, agent-thinking frames and`);
  console.log(`  duplicate views are deliberately left out of the spec. Do NOT reassign`);
  console.log(`  screenshot fields to "use them up".`);
  for (const f of unused) console.log(`  ${f}`);
}

// Heavily reused files are usually a sign of a missing capture
const heavy = [...wanted.entries()].filter(([, who]) => who.length >= 4);
if (heavy.length) {
  console.log(`\nHEAVILY REUSED (advisory) — one image carrying several steps:`);
  for (const [f, who] of heavy) console.log(`  ${f.padEnd(16)} ${who.length}x  (${who.join(", ")})`);
  console.log(`  Often intentional at the end of a video. Only worth capturing more`);
  console.log(`  frames if the hold reads as dead air on playback.`);
}

if (missing.length) {
  console.log(`\nFAIL: ${missing.length} referenced screenshot(s) do not exist.`);
  console.log(`Fix the spec's screenshot fields or add the files, then re-run.`);
  process.exitCode = 1;
} else if (unused.length) {
  console.log(`\nPASS: every screenshot the spec references exists.`);
  console.log(`${unused.length} unused file(s) on disk — informational only, no action needed.`);
} else {
  console.log(`\nPASS: every referenced screenshot exists, no unused files.`);
}
