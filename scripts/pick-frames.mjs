/**
 * Scrub a screen recording and capture chosen frames into a module library.
 *
 *   node scripts/pick-frames.mjs <recording> <module> [--target 1920x1080] [--port 4322]
 *
 * Serves the video over HTTP so the browser can seek it, then extracts each
 * chosen frame server-side with ffmpeg at full resolution, padded to one target
 * canvas so frames from differently sized recordings stay consistent.
 */
import { createServer } from "http";
import { createReadStream, statSync, existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync, copyFileSync } from "fs";
import { extname, basename } from "path";
import { runFfprobe, grabFrame } from "./lib/ffmpeg.mjs";

const [video, mod, ...rest] = process.argv.slice(2);
if (!video || !mod) {
  console.error("Usage: node scripts/pick-frames.mjs <recording> <module> [--target 1920x1080] [--port 4322]");
  process.exit(1);
}
if (!existsSync(video)) { console.error(`No such file: ${video}`); process.exit(1); }

const arg = (n, d) => { const i = rest.indexOf(`--${n}`); return i === -1 ? d : rest[i + 1]; };
const [TW, TH] = arg("target", "1920x1080").split("x").map(Number);
const PORT = Number(arg("port", 4322));
const PAD = arg("pad", "white");
const PRODUCT = arg("product", null);

const DIR = `library/${mod}`;
const MANIFEST = `${DIR}/manifest.json`;
mkdirSync(DIR, { recursive: true });

console.log(`resolving media tools...`);
const probe = JSON.parse(
  runFfprobe(["-v", "error", "-select_streams", "v:0", "-show_streams", "-show_format", "-of", "json", video])
);
const vs = probe.streams[0];
const DURATION = Number(probe.format.duration);

/** Tab is the token before an explicit "--", or before the first hyphen. */
function tabOf(file) {
  const base = file.replace(/\.[a-z0-9]+$/i, "");
  if (base.includes("--")) return base.split("--")[0] || null;
  const i = base.indexOf("-");
  return i > 0 ? base.slice(0, i) : null;
}

function loadManifest() {
  if (existsSync(MANIFEST)) {
    const m = JSON.parse(readFileSync(MANIFEST, "utf8"));
    // backfill tab on entries written before it was derived correctly
    let fixed = 0;
    for (const f of m.flow ?? []) {
      if (!f.tab) { const t = tabOf(f.file); if (t) { f.tab = t; fixed++; } }
    }
    if (fixed) { writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n"); console.log(`  backfilled tab on ${fixed} frame(s)`); }
    return m;
  }
  return { module: mod, resolution: `${TW}x${TH}`, sources: [], flow: [] };
}
function saveManifest(m) {
  if (existsSync(MANIFEST)) copyFileSync(MANIFEST, `${DIR}/manifest.backup.json`);
  writeFileSync(MANIFEST, JSON.stringify(m, null, 2) + "\n");
}

const json = (res, code, body) => {
  const s = JSON.stringify(body);
  res.writeHead(code, { "content-type": "application/json", "content-length": Buffer.byteLength(s) });
  res.end(s);
};
const readBody = (req) => new Promise((r) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => r(b)); });

const MIME = { ".png": "image/png", ".webm": "video/webm", ".mp4": "video/mp4", ".mov": "video/quicktime" };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // range-served video so the browser can seek
  if (url.pathname === "/video") {
    const stat = statSync(video);
    const type = MIME[extname(video).toLowerCase()] ?? "video/webm";
    const range = req.headers.range;
    if (range) {
      const [s, e] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(s, 10);
      const end = e ? parseInt(e, 10) : stat.size - 1;
      res.writeHead(206, {
        "content-range": `bytes ${start}-${end}/${stat.size}`,
        "accept-ranges": "bytes",
        "content-length": end - start + 1,
        "content-type": type,
      });
      createReadStream(video, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { "content-length": stat.size, "content-type": type, "accept-ranges": "bytes" });
      createReadStream(video).pipe(res);
    }
    return;
  }

  if (url.pathname.startsWith("/frame/")) {
    const f = basename(decodeURIComponent(url.pathname.slice(7)));
    const p = `${DIR}/${f}`;
    if (!existsSync(p)) { res.writeHead(404).end(); return; }
    const buf = readFileSync(p);
    res.writeHead(200, { "content-type": "image/png", "content-length": buf.length, "cache-control": "no-cache" });
    res.end(buf);
    return;
  }

  if (url.pathname === "/api/state") {
    json(res, 200, {
      module: mod, video: basename(video), duration: DURATION,
      source: `${vs.width}x${vs.height}`, target: `${TW}x${TH}`,
      manifest: loadManifest(),
    });
    return;
  }

  if (url.pathname === "/api/capture" && req.method === "POST") {
    const { t, name, shows } = JSON.parse(await readBody(req));
    // Hyphens are allowed through so a typed "--" separator survives. Anything
    // else collapses to a single hyphen.
    const clean = String(name || "").trim().toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-{3,}/g, "--")
      .replace(/^-+|-+$/g, "");
    if (!clean) { json(res, 400, { error: "name required" }); return; }
    const file = `${clean}.png`;
    try {
      grabFrame({ video, t, out: `${DIR}/${file}`, width: TW, height: TH, pad: PAD });
    } catch (e) {
      console.error(`capture failed at ${t}s:\n${e.message}`);
      json(res, 500, { error: e.message });
      return;
    }
    const m = loadManifest();
    if (!m.sources.includes(basename(video))) m.sources.push(basename(video));
    const tab = tabOf(clean);
    const i = m.flow.findIndex((x) => x.file === file);
    const entry = { file, tab, product: PRODUCT, shows: shows || "", source: basename(video), at: Number(Number(t).toFixed(2)) };
    if (i === -1) m.flow.push(entry); else m.flow[i] = entry;
    saveManifest(m);
    json(res, 200, { ok: true, manifest: m });
    return;
  }

  if (url.pathname === "/api/manifest" && req.method === "POST") {
    const { flow } = JSON.parse(await readBody(req));
    const m = loadManifest();
    m.flow = flow;
    saveManifest(m);
    json(res, 200, { ok: true, manifest: m });
    return;
  }

  if (url.pathname === "/api/shows" && req.method === "POST") {
    const { file, shows } = JSON.parse(await readBody(req));
    const m = loadManifest();
    const e = m.flow.find((x) => x.file === file);
    if (!e) { json(res, 404, { error: `no entry for ${file}` }); return; }
    e.shows = shows;
    saveManifest(m);
    json(res, 200, { ok: true });
    return;
  }

  if (url.pathname === "/api/delete" && req.method === "POST") {
    const { file } = JSON.parse(await readBody(req));
    const m = loadManifest();
    m.flow = m.flow.filter((x) => x.file !== file);
    saveManifest(m);
    try { unlinkSync(`${DIR}/${basename(file)}`); } catch {}
    json(res, 200, { ok: true, manifest: m });
    return;
  }

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(PAGE);
}).listen(PORT, () => {
  console.log(`Frame picker: http://localhost:${PORT}`);
  console.log(`  recording : ${basename(video)}  ${vs.width}x${vs.height}  ${(DURATION / 60).toFixed(1)}min`);
  console.log(`  library   : ${DIR}/`);
  console.log(`  product   : ${PRODUCT ?? "shared (use --product velox to tag)"}`);
  console.log(`  target    : ${TW}x${TH}` + (vs.width === TW && vs.height === TH
    ? ` (matches source, no padding)`
    : ` (source ${vs.width}x${vs.height} centred on a ${PAD} canvas)`));
  console.log(`\nName frames <tab>--<action>, e.g. ide--enhanced-prompt. Ctrl+C to stop.`);
});

const PAGE = `<!doctype html>
<meta charset="utf-8"><title>Frame picker</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
 :root{--paper:#FAFAF8;--ink:#16181D;--muted:#6B6E76;--rule:#DCDCD6;--accent:#C8102E;--wash:#F1F1EC;--mono:ui-monospace,Menlo,Consolas,monospace}
 *{box-sizing:border-box}
 body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 ui-sans-serif,-apple-system,"Segoe UI",sans-serif;display:grid;grid-template-columns:1fr 340px;min-height:100vh}
 .stage{padding:16px 20px}
 h1{font-size:16px;margin:0 0 3px}
 .meta{font-size:12px;color:var(--muted);font-family:var(--mono);margin:0 0 12px}
 video{width:100%;background:#000;display:block;border:1px solid var(--rule)}
 .ctrl{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}
 button{font:inherit;font-size:13px;padding:7px 13px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);border-radius:4px;cursor:pointer}
 button.ghost{background:transparent;color:var(--ink)}
 input[type=text]{font:inherit;font-size:13px;padding:7px 10px;border:1px solid var(--rule);border-radius:4px}
 #name{width:250px;font-family:var(--mono)}
 #shows{flex:1 1 260px;min-width:180px}
 .t{font-family:var(--mono);font-size:14px;padding:6px 10px;background:var(--wash);border-radius:4px}
 .keys{font-size:12px;color:var(--muted);margin-top:10px}
 kbd{font-family:var(--mono);background:var(--wash);border:1px solid var(--rule);border-radius:3px;padding:0 4px}
 .side{border-left:1px solid var(--rule);padding:16px;overflow-y:auto;max-height:100vh}
 .side h2{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
 .card{display:flex;gap:9px;padding:7px;border:1px solid var(--rule);background:#fff;margin-bottom:7px;cursor:grab;align-items:flex-start}
 .card.drag{opacity:.4}
 .card img{width:96px;height:54px;object-fit:cover;object-position:top left;border:1px solid var(--rule);flex:0 0 auto}
 .card .n{font-family:var(--mono);font-size:11px;word-break:break-all;line-height:1.35}
 .card .s{font-size:11px;color:var(--muted);margin-top:2px}
 .card .sh{width:100%;font:inherit;font-size:11px;padding:3px 5px;border:1px solid var(--rule);border-radius:3px;margin-top:3px;background:var(--paper)}
 .card .sh:focus{background:#fff;border-color:var(--accent);outline:none}
 .card .sh.saved{border-color:#1B7F4B}
 .card .x{margin-left:auto;border:none;background:transparent;color:var(--accent);cursor:pointer;font-size:15px;padding:0 3px}
 .ord{font-family:var(--mono);font-size:11px;color:var(--accent);flex:0 0 20px}
 .msg{font-family:var(--mono);font-size:12px;margin-top:9px;min-height:18px}
 .msg.bad{color:var(--accent)}
</style>
<div class="stage">
  <h1 id="h">loading…</h1>
  <p class="meta" id="meta"></p>
  <video id="v" src="/video" preload="auto"></video>
  <div class="ctrl">
    <span class="t" id="t">0.000s</span>
    <button class="ghost" id="b1">&laquo; 1s</button>
    <button class="ghost" id="b2">&lsaquo; frame</button>
    <button class="ghost" id="b3">frame &rsaquo;</button>
    <button class="ghost" id="b4">1s &raquo;</button>
    <button class="ghost" id="play">play / pause</button>
  </div>
  <div class="ctrl">
    <input type="text" id="name" placeholder="tab--action  e.g. ide--enhanced-prompt">
    <input type="text" id="shows" placeholder="what this frame shows (optional)">
    <button id="cap">Capture frame</button>
  </div>
  <p class="msg" id="msg"></p>
  <p class="keys"><kbd>space</kbd> play · <kbd>,</kbd> <kbd>.</kbd> step one frame · <kbd>&larr;</kbd> <kbd>&rarr;</kbd> one second · <kbd>Enter</kbd> capture · drag cards to reorder the flow</p>
</div>
<div class="side">
  <h2 id="cnt">Flow</h2>
  <div id="list"></div>
</div>
<script>
const v=document.getElementById('v'), tEl=document.getElementById('t');
let ST=null, FR=1/25;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const say=(m,bad)=>{const e=document.getElementById('msg');e.textContent=m;e.className='msg'+(bad?' bad':'');};

async function boot(){
  ST=await (await fetch('/api/state')).json();
  document.getElementById('h').textContent=ST.module+' library · '+ST.video;
  document.getElementById('meta').textContent=
    'source '+ST.source+' → target '+ST.target+' · '+(ST.duration/60).toFixed(1)+'min';
  if(ST.source!==ST.target) say('source '+ST.source+' differs from target '+ST.target+' — frames will be padded to match',true);
  paint(ST.manifest);
}
function paint(m){
  document.getElementById('cnt').textContent='Flow — '+m.flow.length+' frame(s)';
  document.getElementById('list').innerHTML=m.flow.map((f,i)=>
    '<div class="card" draggable="true" data-i="'+i+'">'
    +'<span class="ord">'+String(i+1).padStart(2,'0')+'</span>'
    +'<img src="/frame/'+encodeURIComponent(f.file)+'?x='+Date.now()+'">'
    +'<div style="min-width:0;flex:1"><div class="n">'+esc(f.file)+'</div>'
    +'<div class="s">'+(f.at!=null?f.at+'s':'no timestamp')+(f.source?' · '+esc(f.source):'')+'</div>'
    +'<input class="sh" data-shows="'+esc(f.file)+'" value="'+esc(f.shows||'')+'" placeholder="what this frame shows">'
    +'</div>'
    +'<button class="x" data-del="'+esc(f.file)+'">&times;</button></div>').join('');
  wire(m);
}
function wire(m){
  document.querySelectorAll('[data-shows]').forEach(i=>{
    i.onclick=e=>e.stopPropagation();
    i.onkeydown=e=>{ if(e.key==='Enter'){e.preventDefault();i.blur();} };
    i.onblur=async()=>{
      const r=await fetch('/api/shows',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({file:i.dataset.shows,shows:i.value})});
      if(r.ok){ i.classList.add('saved'); setTimeout(()=>i.classList.remove('saved'),900);
        const e=m.flow.find(x=>x.file===i.dataset.shows); if(e) e.shows=i.value; }
    };
  });
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=async e=>{
    e.stopPropagation();
    const r=await fetch('/api/delete',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({file:b.dataset.del})});
    paint((await r.json()).manifest); say('removed '+b.dataset.del);
  });
  let from=null;
  document.querySelectorAll('.card').forEach(c=>{
    c.querySelector('.sh')?.addEventListener('mousedown',()=>{ c.draggable=false; });
    c.querySelector('.sh')?.addEventListener('blur',()=>{ c.draggable=true; });
    c.ondragstart=()=>{from=+c.dataset.i;c.classList.add('drag')};
    c.ondragend=()=>c.classList.remove('drag');
    c.ondragover=e=>e.preventDefault();
    c.ondrop=async e=>{
      e.preventDefault();
      const to=+c.dataset.i; if(from===null||from===to) return;
      const flow=[...m.flow]; const [x]=flow.splice(from,1); flow.splice(to,0,x);
      const r=await fetch('/api/manifest',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({flow})});
      paint((await r.json()).manifest); say('reordered');
    };
  });
}
v.addEventListener('timeupdate',()=>tEl.textContent=v.currentTime.toFixed(3)+'s');
v.addEventListener('seeked',()=>tEl.textContent=v.currentTime.toFixed(3)+'s');
const step=d=>{v.pause();v.currentTime=Math.max(0,Math.min(ST.duration-0.05,v.currentTime+d));};
document.getElementById('b1').onclick=()=>step(-1);
document.getElementById('b2').onclick=()=>step(-FR);
document.getElementById('b3').onclick=()=>step(FR);
document.getElementById('b4').onclick=()=>step(1);
document.getElementById('play').onclick=()=>v.paused?v.play():v.pause();

async function capture(){
  const name=document.getElementById('name').value;
  if(!name.trim()){say('name the frame first',true);return;}
  say('capturing at '+v.currentTime.toFixed(3)+'s…');
  const r=await fetch('/api/capture',{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({t:v.currentTime,name,shows:document.getElementById('shows').value})});
  const d=await r.json();
  if(!r.ok){say(d.error,true);return;}
  paint(d.manifest);
  say('captured '+name);
  document.getElementById('name').value=''; document.getElementById('shows').value='';
}
document.getElementById('cap').onclick=capture;
document.addEventListener('keydown',e=>{
  const typing=/input/i.test(e.target.tagName);
  if(e.key==='Enter'&&typing){e.preventDefault();capture();return;}
  if(typing) return;
  if(e.key===' '){e.preventDefault();v.paused?v.play():v.pause();}
  if(e.key===',')step(-FR); if(e.key==='.')step(FR);
  if(e.key==='ArrowLeft')step(-1); if(e.key==='ArrowRight')step(1);
});
boot();
</script>
`;
