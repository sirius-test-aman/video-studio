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
// Violations of rules that must not ship. These exit non-zero.
const errors = [];
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

// Body frames must run in non-decreasing capture order, and a frame may repeat
// only in consecutive positions. Hooks and CTAs live in variants and are exempt.
const frameNum = (f) => {
  const m = /step-0*(\d+)/.exec(f ?? "");
  return m ? Number(m[1]) : null;
};
const seq = [];
for (const st of spec.steps) for (const b of st.beats) seq.push({ id: st.id, file: b.screenshot, n: frameNum(b.screenshot) });

let high = null;
for (const e of seq) {
  if (e.n === null) continue;
  if (high !== null && e.n < high) {
    errors.push(`${e.id}: ${e.file} goes backwards (already showed step-${String(high).padStart(2, "0")}) — body frames must run in capture order`);
  }
  high = high === null ? e.n : Math.max(high, e.n);
}

const lastAt = new Map();
seq.forEach((e, i) => {
  if (lastAt.has(e.file) && i - lastAt.get(e.file) > 1) {
    errors.push(`${e.file} reappears at ${e.id} after other frames — a frame may repeat only in consecutive steps`);
  }
  lastAt.set(e.file, i);
});

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

if (spec.videoType === "promo") {
  const bodyChars = spec.steps.reduce((n, s) => n + (s.narration?.length ?? 0), 0);
  const est = bodyChars / CPS;
  if (spec.steps.length > 8) notes.push(`promo has ${spec.steps.length} steps — aim for 6-8`);
  if (bodyChars > 450) notes.push(`promo body narration is ${bodyChars} chars (~${est.toFixed(0)}s) — aim under 450 chars / 30s`);
  const nav = spec.steps.filter((s) =>
    /\b(sign in|log in|login|left rail|navigat|select the project|project picker)\b/i.test(s.narration ?? "")
  );
  if (nav.length) notes.push(`promo includes navigation steps (${nav.map((s) => s.id).join(", ")}) — promos open at the moment of value`);
  for (const s of spec.steps) {
    const w = s.narration?.split(/\s+/).length ?? 0;
    if (w > 25) notes.push(`${s.id}: ${w} words — promo lines should run 8-25`);
  }

  if (spec.steps.length > 5)
    notes.push(`promo body has ${spec.steps.length} steps — beats 3 and 4 only, aim for 3-5`);

  // uniform line lengths mean there is no argument shape
  const lens = spec.steps.filter((st) => st.narration).map((st) => st.narration.length);
  if (lens.length >= 3 && Math.max(...lens) - Math.min(...lens) < 25)
    notes.push(`all body lines are ${Math.min(...lens)}-${Math.max(...lens)} chars — uniform length reads as a list of facts, not an argument`);

  // lines that describe the system rather than address the viewer
  for (const st of spec.steps) {
    if (st.narration && /^(A|An|The|Every|They|It|Agent|Velox reads|Velox drafts)\b/.test(st.narration.trim()))
      notes.push(`${st.id}: opens by describing the system ("${st.narration.slice(0, 34)}...") — address the viewer or use an imperative`);
  }

  // assembled monotonicity: hook <= first body frame, cta >= last body frame
  const bodyNums = [];
  for (const st of spec.steps) for (const b of st.beats) {
    const n = frameNum(b.screenshot);
    if (n !== null) bodyNums.push(n);
  }
  if (bodyNums.length) {
    const firstBody = bodyNums[0];
    const lastBody = bodyNums[bodyNums.length - 1];
    for (const v of spec.variants) {
      const hookShots = (v.hook?.beats ?? []).map((b) => b.screenshot);
      const ctaShots = (v.cta?.beats ?? []).map((b) => b.screenshot);
      for (const f of hookShots) {
        const n = frameNum(f);
        if (n !== null && n > firstBody)
          errors.push(`${v.id}: hook uses ${f} but the body starts at step-${String(firstBody).padStart(2, "0")} — the assembled video runs backwards`);
      }
      for (const f of ctaShots) {
        const n = frameNum(f);
        if (n !== null && n < lastBody)
          errors.push(`${v.id}: cta uses ${f} but the body ends at step-${String(lastBody).padStart(2, "0")} — the assembled video runs backwards`);
      }
      const shared = hookShots.filter((f) => ctaShots.includes(f));
      if (shared.length)
        notes.push(`${v.id}: hook and cta both use ${shared[0]} — the video opens and closes on the same screen`);
    }
  }

  // every promo variant must be a complete, viewable video
  for (const v of spec.variants) {
    if (!v.hook) errors.push(`${v.id}: no hook — every promo variant must be a complete video, there is no bare baseline`);
    else if (!v.cta) errors.push(`${v.id}: has a hook but no cta — the video would end without a call to action`);
  }

  // Beat 1 is a question and beat 2 is the turn, both inside the hook line, so
  // the hook contains a question first and does not end with one.
  for (const v of spec.variants) {
    const h = v.hook?.narration;
    if (!h) continue;
    const first = (h.match(/^[^.?!]*[.?!]/) ?? [h])[0].trim();
    if (!first.endsWith("?"))
      notes.push(`${v.id}: hook does not open with a question — beat 1 states the problem as a question, beat 2 is the turn`);
    if (!/\?/.test(h))
      notes.push(`${v.id}: hook contains no question at all`);
  }
}
if (spec.videoType === "tutorial") {
  if (!spec.variants.some((v) => v.id === "v0-control"))
    notes.push(`tutorial has no v0-control variant — a tutorial carries exactly one, with no hook or cta`);
  for (const v of spec.variants) {
    if (v.hook || v.cta) notes.push(`${v.id}: tutorials carry no hook or cta`);
  }
} else if (spec.videoType === "promo") {
  const bare = spec.variants.filter((v) => v.id === "v0-control");
  if (bare.length) errors.push(`promo has a v0-control variant — every promo variant is a complete video named by its angle`);
}

const chars = new Set();
const add = (st) => st?.narration && chars.add(st.narration);
spec.steps.forEach(add);
spec.variants.forEach((v) => { add(v.hook); add(v.cta); });
const totalChars = [...chars].reduce((n, t) => n + t.length, 0);
const shots = new Set();
spec.steps.forEach((s) => s.beats.forEach((b) => shots.add(b.screenshot)));

console.log(errors.length ? `INVALID — ${errors.length} rule violation(s)` : `VALID`);
console.log(`  ${spec.module} / ${spec.videoType}, theme ${spec.theme}`);
console.log(`  ${spec.steps.length} steps, ${spec.steps.reduce((n, s) => n + s.beats.length, 0)} beats, ${spec.variants.length} variant(s)`);
console.log(`  ${shots.size} distinct screenshots referenced`);
console.log(`  ${chars.size} narration lines, ${totalChars.toLocaleString()} chars`);
console.log(`  est. audio cost: ${(100 * totalChars / 30000).toFixed(1)}% of a 30,000-credit month`);
console.log(`  est. runtime: ~${Math.round(totalChars / CPS)}s`);

if (errors.length) {
  console.log(`\n${errors.length} RULE VIOLATION(S) — these must be fixed:`);
  for (const e of errors) console.log(`  ${e}`);
  process.exitCode = 1;
}

if (notes.length) {
  console.log(`\n${notes.length} style note(s) — advisory, judgement calls:`);
  for (const n of notes) console.log(`  ${n}`);
} else if (!errors.length) {
  console.log(`\nNo style notes.`);
}
