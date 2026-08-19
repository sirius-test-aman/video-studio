/**
 * Turn a screen recording into numbered walkthrough screenshots.
 *
 *   Pass 1 (propose):  node scripts/extract-frames.mjs rec.mp4 brd-chat-tutorial
 *   Pass 2 (extract):  node scripts/extract-frames.mjs rec.mp4 brd-chat-tutorial --at 0.4,3.2,7.8,...
 *
 * Pass 1 finds every point where the screen settles after a change, extracts a
 * low-res candidate for each, and builds a picker page. Pass 2 writes full
 * resolution PNGs named step-01.png upward into the asset folder.
 */

import { runFfmpeg, runFfprobe, runFfmpegCapture, grabFrame } from "./lib/ffmpeg.mjs";
import { writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from "fs";

const [video, slug, ...rest] = process.argv.slice(2);
if (!video || !slug) {
  console.error("Usage: node scripts/extract-frames.mjs <recording> <slug> [--at t1,t2,...] [--threshold 0.05] [--settle 0.35]");
  process.exit(1);
}
if (!existsSync(video)) {
  console.error(`No such file: ${video}`);
  process.exit(1);
}

const arg = (name, dflt) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? dflt : rest[i + 1];
};
const mode = arg("mode", "scene"); // "scene" for app navigation, "diff" for IDE / text
const threshold = Number(arg("threshold", 0.05));
const settle = Number(arg("settle", 0.35));
const sampleFps = Number(arg("fps", 2));   // diff mode: how often to look
const diffPct = Number(arg("diff", 2.5));  // diff mode: % of pixels that must change
const minGap = Number(arg("gap", 1.2));    // diff mode: seconds between kept frames
const atList = arg("at", null);

const probe = JSON.parse(
  runFfprobe(["-v", "error", "-select_streams", "v:0", "-show_streams", "-show_format", "-of", "json", video])
);
const vs = probe.streams[0];
const duration = Number(probe.format.duration);
console.log(`recording : ${vs.width}x${vs.height}, ${duration.toFixed(1)}s, ${eval(vs.r_frame_rate).toFixed(0)}fps`);

/* ------------------------------------------------------------ pass 2 */
if (atList) {
  const times = atList.split(",").map((t) => Number(t.trim())).filter((t) => !Number.isNaN(t));
  if (!times.length) {
    console.error("--at needs a comma separated list of seconds");
    process.exit(1);
  }
  const dir = `public/assets/${slug}`;
  mkdirSync(dir, { recursive: true });

  const existing = readdirSync(dir).filter((f) => /^step-\d+\.png$/.test(f));
  if (existing.length) {
    console.error(`${dir} already has ${existing.length} step-NN.png files.`);
    console.error(`Move or delete them first so numbering does not collide.`);
    process.exit(1);
  }

  times.forEach((t, i) => {
    const name = `step-${String(i + 1).padStart(2, "0")}.png`;
    grabFrame({ video, t, out: `${dir}/${name}`, width: vs.width, height: vs.height });
    console.log(`  ${name}  t=${t}s`);
  });
  console.log(`\n${times.length} frames written to ${dir}/`);
  console.log(`next: node scripts/check-assets.mjs specs/${slug}.spec.json`);
  process.exit(0);
}

/* ------------------------------------------------------------ pass 1 */
let candidates;

if (mode === "diff") {
  // Sample at a fixed rate; keep a frame only when enough of the picture changed
  // since the last KEPT frame. Typing yields hundreds of near-identical frames
  // and few keeps; a panel opening yields one.
  console.log(`diff mode: ${sampleFps}fps sampling, keep at >${diffPct}% change, min ${minGap}s apart...`);
  const { readFileSync } = await import("fs");
  let PNG;
  try { ({ PNG } = await import("pngjs")); }
  catch { console.error("diff mode needs pngjs:  npm install pngjs"); process.exit(1); }

  const raw = ".frames-raw";
  rmSync(raw, { recursive: true, force: true });
  mkdirSync(raw, { recursive: true });
  runFfmpeg(["-hide_banner","-loglevel","error","-i",video,"-vf",`fps=${sampleFps},scale=320:-1`,`${raw}/%05d.png`]);

  const files = readdirSync(raw).filter((f) => f.endsWith(".png")).sort();
  const read = (f) => PNG.sync.read(readFileSync(`${raw}/${f}`));

  let last = read(files[0]);
  candidates = [0.1];
  let lastKeptAt = 0;
  const trace = [];

  for (let i = 1; i < files.length; i++) {
    const cur = read(files[i]);
    let changed = 0;
    const n = Math.min(last.data.length, cur.data.length);
    for (let p = 0; p < n; p += 4) {
      const d = Math.abs(last.data[p] - cur.data[p])
              + Math.abs(last.data[p + 1] - cur.data[p + 1])
              + Math.abs(last.data[p + 2] - cur.data[p + 2]);
      if (d > 45) changed++;
    }
    const pct = (100 * changed) / (n / 4);
    const t = i / sampleFps;
    trace.push([t, pct]);
    if (pct > diffPct && t - lastKeptAt >= minGap) {
      candidates.push(Number(t.toFixed(2)));
      lastKeptAt = t;
      last = cur;
    }
  }
  rmSync(raw, { recursive: true, force: true });
  const pcts = trace.map((x) => x[1]).sort((a, b) => a - b);
  const q = (f) => pcts[Math.floor(f * (pcts.length - 1))].toFixed(2);
  console.log(`  ${files.length} samples -> ${candidates.length} candidates`);
  console.log(`  change distribution: p50 ${q(0.5)}%  p75 ${q(0.75)}%  p90 ${q(0.9)}%  max ${q(1)}%`);
  console.log(`  (raise --diff above the noise floor, lower it if screens are being missed)`);
} else {
console.log(`detecting screen changes (threshold ${threshold}, settle ${settle}s)...`);

let raw = "";
try {
  raw = runFfmpegCapture(["-hide_banner","-i",video,"-filter:v",`select='gt(scene,${threshold})',showinfo`,"-f","null","-"]);
} catch (e) {
  raw = e.stdout || "";
}
const changes = [...raw.matchAll(/pts_time:([0-9.]+)/g)].map((m) => Number(m[1]));

// A screenshot wants the state AFTER a change settles, not the transition itself.
candidates = [0.3];
for (const t of changes) {
  const grab = Math.min(t + settle, duration - 0.1);
  if (grab - candidates[candidates.length - 1] > 0.5) candidates.push(Number(grab.toFixed(2)));
}
console.log(`  ${changes.length} changes -> ${candidates.length} candidate frames`);
}

const tmp = ".frames-tmp";
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
candidates.forEach((t, i) => {
  runFfmpeg(["-hide_banner","-loglevel","error","-ss",String(t),"-i",video,"-frames:v","1","-vf","scale=440:-1","-q:v","4",`${tmp}/${String(i).padStart(3,"0")}.jpg`]);
});

const cards = candidates
  .map((t, i) => `
  <label class="card" data-t="${t}">
    <input type="checkbox" checked>
    <img src="../.frames-tmp/${String(i).padStart(3, "0")}.jpg" loading="lazy">
    <span class="t">${t.toFixed(2)}s</span>
  </label>`)
  .join("");

mkdirSync("out", { recursive: true });
writeFileSync("out/frame-picker.html", `<!doctype html>
<meta charset="utf-8"><title>Frame picker · ${slug}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
 :root{--paper:#FAFAF8;--ink:#16181D;--muted:#6B6E76;--rule:#DCDCD6;--accent:#C8102E}
 *{box-sizing:border-box}
 body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 ui-sans-serif,-apple-system,"Segoe UI",sans-serif}
 .top{position:sticky;top:0;z-index:9;background:var(--paper);border-bottom:1px solid var(--rule);padding:16px 22px}
 h1{font-size:18px;margin:0 0 4px}
 p{font-size:13px;color:var(--muted);margin:0 0 12px;max-width:86ch}
 .bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
 button{font:inherit;font-size:13px;padding:8px 14px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);border-radius:4px;cursor:pointer}
 button.ghost{background:transparent;color:var(--ink)}
 .cnt{font-family:ui-monospace,monospace;font-size:13px;color:var(--muted)}
 textarea{width:100%;height:96px;font-family:ui-monospace,monospace;font-size:12px;margin-top:10px}
 .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;padding:20px 22px 80px}
 .card{position:relative;display:block;border:1px solid var(--rule);background:#fff;cursor:pointer}
 .card img{display:block;width:100%;height:auto;opacity:.34;transition:opacity .1s}
 .card:has(input:checked) img{opacity:1}
 .card:has(input:checked){outline:2px solid var(--accent);outline-offset:-2px}
 .card input{position:absolute;top:8px;left:8px;z-index:2;width:18px;height:18px}
 .t{position:absolute;bottom:0;right:0;background:var(--ink);color:var(--paper);font-family:ui-monospace,monospace;font-size:11px;padding:2px 6px}
 .n{position:absolute;top:6px;right:8px;background:var(--accent);color:#fff;font-family:ui-monospace,monospace;font-size:12px;padding:1px 7px;border-radius:3px}
</style>
<div class="top">
  <h1>Frame picker · ${slug}</h1>
  <p>Every frame the recording settled on. Untick anything redundant — intermediate loading states, duplicate views, the agent thinking. Ticked frames become step-01 upward in the order shown.</p>
  <div class="bar">
    <button id="exp">Export command</button>
    <button class="ghost" id="all">Tick all</button>
    <button class="ghost" id="none">Untick all</button>
    <span class="cnt" id="cnt"></span>
  </div>
  <textarea id="out" hidden readonly></textarea>
</div>
<div class="grid">${cards}</div>
<script>
const cards=[...document.querySelectorAll('.card')];
function refresh(){
  let n=0;
  for(const c of cards){
    c.querySelector('.n')?.remove();
    if(c.querySelector('input').checked){
      n++;
      const b=document.createElement('span'); b.className='n'; b.textContent=String(n).padStart(2,'0');
      c.appendChild(b);
    }
  }
  document.getElementById('cnt').textContent=n+' of '+cards.length+' frames selected';
}
cards.forEach(c=>c.querySelector('input').addEventListener('change',refresh));
document.getElementById('all').onclick=()=>{cards.forEach(c=>c.querySelector('input').checked=true);refresh();};
document.getElementById('none').onclick=()=>{cards.forEach(c=>c.querySelector('input').checked=false);refresh();};
document.getElementById('exp').onclick=()=>{
  const ts=cards.filter(c=>c.querySelector('input').checked).map(c=>c.dataset.t);
  const ta=document.getElementById('out');
  ta.hidden=false;
  ta.value='node scripts/extract-frames.mjs "${video}" ${slug} --at '+ts.join(',');
  ta.select();
};
refresh();
</script>
`);

console.log(`\npicker written: out/frame-picker.html`);
console.log(`  untick redundant frames, click Export command, paste it back into the terminal`);
