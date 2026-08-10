import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { safeParseSpec } from "./lib/spec-schema.mjs";

const specPath = process.argv[2] ?? "specs/brd-tutorial-v2.spec.json";
const outPath = process.argv[3] ?? "out/focus-picker.html";

const parsed = safeParseSpec(JSON.parse(readFileSync(specPath, "utf8")));
if (!parsed.success) {
  console.error("Spec failed validation:\n");
  for (const i of parsed.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
const spec = parsed.data;
const prefix = `../public/assets/${spec.module}-${spec.videoType}`;

const rows = [];
spec.steps.forEach((s, si) =>
  s.beats.forEach((b, bi) =>
    rows.push({ key: `${si}.${bi}`, id: s.id, bi, shot: b.screenshot, caption: b.caption, focus: b.focus ?? null })
  )
);

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const html = `<!doctype html>
<meta charset="utf-8"><title>Focus picker · ${esc(spec.module)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
 :root{--paper:#FAFAF8;--ink:#16181D;--muted:#6B6E76;--rule:#DCDCD6;--accent:#C8102E;--wash:#F1F1EC}
 *{box-sizing:border-box}
 body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 ui-sans-serif,-apple-system,"Segoe UI",sans-serif}
 .top{position:sticky;top:0;z-index:9;background:var(--paper);border-bottom:1px solid var(--rule);padding:16px 24px}
 h1{font-size:19px;margin:0 0 4px}
 .hint{font-size:13px;color:var(--muted);margin:0 0 12px;max-width:80ch}
 .bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
 button{font:inherit;font-size:13px;padding:8px 14px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);border-radius:4px;cursor:pointer}
 button.ghost{background:transparent;color:var(--ink)}
 .count{font-family:ui-monospace,monospace;font-size:13px;color:var(--muted)}
 .row{display:grid;grid-template-columns:150px 1fr;gap:18px;padding:16px 24px;border-bottom:1px solid var(--rule);align-items:start}
 .meta{font-size:13px}
 .sid{font-family:ui-monospace,monospace;font-size:16px;font-weight:600}
 .cap{margin:6px 0 0;color:var(--muted);font-size:12px}
 .shot{font-family:ui-monospace,monospace;font-size:11px;color:var(--muted);margin-top:4px}
 .coord{font-family:ui-monospace,monospace;font-size:12px;color:var(--accent);margin-top:8px;min-height:18px}
 .kinds{display:flex;gap:4px;margin-top:8px;flex-wrap:wrap}
 .kinds label{font-size:11px;border:1px solid var(--rule);padding:2px 6px;border-radius:3px;cursor:pointer}
 .kinds input{margin-right:3px}
 .stage{position:relative;display:inline-block;max-width:100%;cursor:crosshair;border:1px solid var(--rule);background:var(--wash)}
 .stage img{display:block;max-width:100%;height:auto}
 .pin{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px;border:3px solid var(--accent);border-radius:50%;box-shadow:0 0 0 3px rgba(255,255,255,.7);pointer-events:none}
 .pin::after{content:"";position:absolute;inset:13px;background:var(--accent);border-radius:50%}
 .clear{margin-top:6px}
 textarea{width:100%;height:220px;font-family:ui-monospace,monospace;font-size:11px;margin-top:10px}
</style>
<div class="top">
  <h1>Focus picker · ${esc(spec.product)} / ${esc(spec.module)}</h1>
  <p class="hint">Click the spot in each screenshot that the narration refers to — the button being pressed, the field being typed into. Skip any beat where nothing is being interacted with. Then export and save over your spec file.</p>
  <div class="bar">
    <button id="exp">Export updated spec</button>
    <button class="ghost" id="dl">Download .json</button>
    <span class="count" id="cnt"></span>
  </div>
  <textarea id="out" hidden readonly></textarea>
</div>
${rows.map((r) => `
<div class="row" data-key="${r.key}">
  <div class="meta">
    <div class="sid">${esc(r.id)}${r.bi > 0 ? ` &middot;b${r.bi + 1}` : ""}</div>
    <p class="cap">${r.caption ? esc(r.caption) : "<em>no caption</em>"}</p>
    <div class="shot">${esc(r.shot)}</div>
    <div class="coord"></div>
    <button class="ghost clear">clear</button>
  </div>
  <div><div class="stage"><img src="${prefix}/${esc(r.shot)}" alt="${esc(r.shot)}" loading="lazy"></div></div>
</div>`).join("")}
<script>
const SPEC = ${JSON.stringify(spec)};
const picks = {};
${rows.filter((r) => r.focus).map((r) => `picks["${r.key}"] = ${JSON.stringify(r.focus)};`).join("\n")}

function refresh(){
  document.getElementById('cnt').textContent = Object.keys(picks).length + ' of ${rows.length} beats marked';
}
document.querySelectorAll('.row').forEach(row => {
  const key = row.dataset.key;
  const stage = row.querySelector('.stage');
  const coord = row.querySelector('.coord');
  const draw = () => {
    stage.querySelector('.pin')?.remove();
    const p = picks[key];
    if (!p) { coord.textContent = ''; return; }
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.left = (p.x*100)+'%'; pin.style.top = (p.y*100)+'%';
    stage.appendChild(pin);
    coord.textContent = 'x ' + p.x.toFixed(3) + '  y ' + p.y.toFixed(3);
  };
  stage.addEventListener('click', ev => {
    const r = stage.getBoundingClientRect();
    picks[key] = {
      x: +Math.min(Math.max((ev.clientX-r.left)/r.width,0),1).toFixed(4),
      y: +Math.min(Math.max((ev.clientY-r.top)/r.height,0),1).toFixed(4)
    };
    draw(); refresh();
  });
  row.querySelector('.clear').addEventListener('click', () => { delete picks[key]; draw(); refresh(); });
  draw();
});
refresh();

function build(){
  const out = JSON.parse(JSON.stringify(SPEC));
  out.steps.forEach((s,si) => s.beats.forEach((b,bi) => {
    const p = picks[si+'.'+bi];
    if (p) b.focus = p; else delete b.focus;
  }));
  return JSON.stringify(out, null, 2);
}
document.getElementById('exp').addEventListener('click', () => {
  const ta = document.getElementById('out');
  ta.hidden = false; ta.value = build(); ta.select();
});
document.getElementById('dl').addEventListener('click', () => {
  const blob = new Blob([build()], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '${specPath.split("/").pop()}';
  a.click();
});
</script>`;

mkdirSync(outPath.replace(/\/[^/]+$/, ""), { recursive: true });
writeFileSync(outPath, html);
console.log(`Focus picker written: ${outPath}`);
console.log(`  ${rows.length} beats, ${rows.filter((r) => r.focus).length} already marked`);
