import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { safeParseSpec } from "./lib/spec-schema.mjs";
import { resolveAll, screenshotsFor, narrationSet } from "./lib/resolve.mjs";

const CHARS_PER_SEC = 16.8; // measured from BRD_CTA_v2 narration
const specPath = process.argv[2] ?? "spec.json";
const outPath = process.argv[3] ?? "out/storyboard.html";

const parsed = safeParseSpec(JSON.parse(readFileSync(specPath, "utf8")));
if (!parsed.success) {
  console.error("Spec failed validation:\n");
  for (const i of parsed.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
const spec = parsed.data;
const variants = resolveAll(spec);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/** Split narration into segments at beat boundaries so screen changes are visible in the text. */
function narrationSegments(step) {
  if (!step.narration) return null;
  const words = step.narration.split(/\s+/);
  const cuts = step.beats.map((b) => b.atWord ?? 0);
  return cuts.map((start, i) => {
    const end = i + 1 < cuts.length ? cuts[i + 1] : words.length;
    return words.slice(start, end).join(" ");
  });
}

function estSeconds(step) {
  if (!step.narration) return step.silentDurationSeconds ?? 0;
  const raw = step.narration.length / CHARS_PER_SEC;
  return Math.max(raw, step.minHoldSeconds ?? 0);
}

function warnings(step) {
  const w = [];
  const ref = step.referenceSeconds;
  if (step.narration && ref) {
    const window = ref.end - ref.start;
    const rate = step.narration.length / window;
    if (rate > 20) w.push(`authored rate ${rate.toFixed(1)} ch/sec exceeds speakable pace — narration will run past its original window`);
  }
  if (!step.narration && step.beats.every((b) => !b.caption)) {
    w.push("silent step with no caption — this will render as dead air");
  }
  if (step.beats.length > 1 && step.beats.every((b, i, a) => i === 0 || b.screenshot === a[0].screenshot)) {
    w.push("all beats reuse the same screenshot — only the caption changes");
  }
  return w;
}

function stepRow(step, n) {
  const segs = narrationSegments(step);
  const secs = estSeconds(step);
  const warns = warnings(step);

  const beatBlocks = step.beats
    .map((beat, i) => `
      <div class="beat">
        <div class="beat-frame">
          <img src="../public/assets/${esc(spec.module)}-${esc(spec.videoType)}/${esc(beat.screenshot)}" alt="${esc(beat.screenshot)}" loading="lazy">
          <span class="beat-file">${esc(beat.screenshot)}</span>
        </div>
        <div class="beat-meta">
          ${step.beats.length > 1 ? `<span class="beat-tick">beat ${i + 1}${beat.atWord !== undefined ? ` · at word ${beat.atWord}` : ""}</span>` : ""}
          ${beat.caption
            ? `<p class="cap">${esc(beat.caption)}</p>`
            : `<p class="cap cap-none">no caption</p>`}
        </div>
      </div>`)
    .join("");

  const narrationHtml = segs
    ? segs
        .map((seg, i) => `<span class="seg">${i > 0 ? '<span class="cut" title="screen changes here">▮</span>' : ""}${esc(seg)}</span>`)
        .join(" ")
    : `<span class="silent">silent hold · ${step.silentDurationSeconds}s</span>`;

  return `
    <article class="row${warns.length ? " row-warn" : ""}">
      <div class="rail">
        <span class="num">${String(n).padStart(2, "0")}</span>
        <span class="role role-${esc(step.role)}">${esc(step.role)}</span>
        <span class="dur">~${secs.toFixed(1)}s</span>
        ${step.beats.length > 1 ? `<span class="multi">${step.beats.length} beats</span>` : ""}
      </div>
      <div class="body">
        <div class="beats">${beatBlocks}</div>
        <div class="narration">${narrationHtml}</div>
        ${warns.map((t) => `<p class="warn">${esc(t)}</p>`).join("")}
      </div>
      <div class="check"><label><input type="checkbox"> ok</label></div>
    </article>`;
}

const cachePlan = narrationSet(spec);
let cacheChars = 0;
for (const k of cachePlan.keys()) cacheChars += k.length;

const panels = variants
  .map((v, vi) => {
    const total = v.steps.reduce((n, s) => n + estSeconds(s), 0);
    const warnCount = v.steps.reduce((n, s) => n + (warnings(s).length ? 1 : 0), 0);
    return `
    <section class="panel${vi === 0 ? " on" : ""}" id="p-${esc(v.variantId)}">
      <header class="panel-head">
        <div>
          <h2>${esc(v.variantId)}</h2>
          ${v.note ? `<p class="note">${esc(v.note)}</p>` : ""}
        </div>
        <dl class="stats">
          <div><dt>steps</dt><dd>${v.steps.length}</dd></div>
          <div><dt>est. runtime</dt><dd>${Math.floor(total / 60)}m ${Math.round(total % 60)}s</dd></div>
          <div><dt>screenshots</dt><dd>${screenshotsFor(v).length}</dd></div>
          <div><dt>flags</dt><dd class="${warnCount ? "bad" : ""}">${warnCount}</dd></div>
        </dl>
      </header>
      ${v.steps.map((s, i) => stepRow(s, i + 1)).join("")}
    </section>`;
  })
  .join("");

const html = `<!doctype html>
<meta charset="utf-8">
<title>Storyboard · ${esc(spec.product)} / ${esc(spec.module)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{
    --paper:#FAFAF8; --ink:#16181D; --muted:#6B6E76;
    --rule:#DCDCD6; --accent:#C8102E; --wash:#F1F1EC;
    --sans:ui-sans-serif,-apple-system,"Segoe UI",Inter,sans-serif;
    --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);
       font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}

  .top{position:sticky;top:0;z-index:10;background:var(--paper);
       border-bottom:1px solid var(--rule);padding:18px 28px 0}
  .eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;
           color:var(--muted);margin:0 0 4px}
  .title{font-size:22px;font-weight:650;letter-spacing:-.015em;margin:0 0 2px}
  .sub{font-size:13px;color:var(--muted);margin:0 0 14px}
  .sub b{color:var(--ink);font-weight:600}

  .gate{display:flex;gap:20px;flex-wrap:wrap;padding:12px 14px;margin:0 0 16px;
        background:var(--wash);border-left:3px solid var(--accent);font-size:13px}
  .gate label{display:flex;gap:7px;align-items:center;cursor:pointer}

  .tabs{display:flex;gap:2px;overflow-x:auto}
  .tab{appearance:none;border:1px solid var(--rule);border-bottom:none;background:transparent;
       font:inherit;font-size:13px;padding:8px 14px;cursor:pointer;color:var(--muted);
       border-radius:3px 3px 0 0;white-space:nowrap}
  .tab[aria-selected=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}

  .panel{display:none;padding:26px 28px 80px}
  .panel.on{display:block}
  .panel-head{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;
              align-items:flex-start;padding-bottom:16px;margin-bottom:8px;
              border-bottom:2px solid var(--ink)}
  .panel-head h2{font-family:var(--mono);font-size:16px;font-weight:600;margin:0}
  .note{font-size:13px;color:var(--muted);margin:5px 0 0;max-width:56ch}
  .stats{display:flex;gap:22px;margin:0}
  .stats div{margin:0}
  .stats dt{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .stats dd{margin:2px 0 0;font-family:var(--mono);font-size:16px}
  .stats dd.bad{color:var(--accent)}

  .row{display:grid;grid-template-columns:96px 1fr 52px;gap:20px;
       padding:18px 0;border-bottom:1px solid var(--rule);align-items:start}
  .row-warn{background:linear-gradient(90deg,rgba(200,16,46,.05),transparent 60%)}

  .rail{display:flex;flex-direction:column;gap:5px;align-items:flex-start}
  .num{font-family:var(--mono);font-size:20px;font-weight:600;line-height:1}
  .role{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .role-hook,.role-cta{color:var(--accent);font-weight:600}
  .dur,.multi{font-family:var(--mono);font-size:11px;color:var(--muted)}
  .multi{border:1px solid var(--rule);padding:1px 5px;border-radius:2px}

  .beats{display:flex;gap:16px;flex-wrap:wrap}
  .beat{display:flex;gap:11px;align-items:flex-start;flex:1 1 340px;min-width:0}
  .beat-frame{flex:0 0 168px}
  .beat-frame img{width:168px;aspect-ratio:16/9;object-fit:cover;object-position:top left;
                  display:block;border:1px solid var(--rule);background:var(--wash)}
  .beat-file{display:block;font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:3px;
             overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .beat-meta{min-width:0}
  .beat-tick{display:block;font-family:var(--mono);font-size:10px;color:var(--accent);margin-bottom:3px}
  .cap{margin:0;font-size:14px;font-weight:550;line-height:1.35}
  .cap-none{color:var(--muted);font-weight:400;font-style:italic}

  .narration{margin-top:13px;font-family:var(--mono);font-size:13px;line-height:1.65;
             color:#33363D;max-width:82ch}
  .cut{color:var(--accent);margin-right:5px;font-size:11px;vertical-align:1px}
  .silent{color:var(--muted);font-style:italic}

  .warn{margin:9px 0 0;font-size:12px;color:var(--accent);max-width:74ch}
  .check{padding-top:2px}
  .check label{font-size:11px;color:var(--muted);display:flex;gap:5px;align-items:center;cursor:pointer}

  @media (max-width:720px){
    .row{grid-template-columns:64px 1fr;gap:12px}
    .check{display:none}
    .top,.panel{padding-left:16px;padding-right:16px}
  }
</style>

<div class="top">
  <p class="eyebrow">Storyboard review · pre-audio gate</p>
  <h1 class="title">${esc(spec.product)} / ${esc(spec.module)} · ${esc(spec.videoType)}</h1>
  <p class="sub">
    ${variants.length} variants · theme <b>${esc(spec.theme)}</b> · voice <b>${esc(spec.voice)}</b> ·
    <b>${cachePlan.size}</b> distinct narration units · <b>${cacheChars.toLocaleString()}</b> characters to synthesize
    (${(100 * cacheChars / 30000).toFixed(1)}% of a 30,000-credit month)
  </p>
  <div class="gate">
    <label><input type="checkbox"> Every caption sits on the right screen</label>
    <label><input type="checkbox"> No real client data visible in any frame</label>
    <label><input type="checkbox"> Narration reads aloud cleanly</label>
    <label><input type="checkbox"> Hook and CTA land for this audience</label>
  </div>
  <div class="tabs" role="tablist">
    ${variants.map((v, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" data-t="p-${esc(v.variantId)}">${esc(v.variantId)}</button>`).join("")}
  </div>
</div>

${panels}

<script>
  const tabs = [...document.querySelectorAll('.tab')];
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.id === t.dataset.t));
    window.scrollTo({top: 0});
  }));
</script>
`;

mkdirSync(outPath.replace(/\/[^/]+$/, ""), { recursive: true });
writeFileSync(outPath, html);

const flagged = variants.flatMap((v) =>
  v.steps.filter((s) => warnings(s).length).map((s) => `${v.variantId}/${s.id}`)
);
console.log(`Storyboard written: ${outPath}`);
console.log(`  ${variants.length} variants, ${spec.steps.length} authored steps`);
console.log(`  cache plan: ${cachePlan.size} narration units, ${cacheChars.toLocaleString()} chars`);
console.log(flagged.length ? `  flags: ${[...new Set(flagged.map((f) => f.split("/")[1]))].join(", ")}` : "  no flags");
