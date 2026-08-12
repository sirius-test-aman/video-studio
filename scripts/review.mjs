import { createServer } from "http";
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { extname, basename } from "path";
import { safeParseSpec } from "./lib/spec-schema.mjs";
import { contentHash, approvalState } from "./lib/content-hash.mjs";

const specPath = process.argv[2];
const PORT = Number(process.env.REVIEW_PORT ?? 4321);

if (!specPath || !existsSync(specPath)) {
  console.error("Usage: node scripts/review.mjs <spec.json>");
  process.exit(1);
}

const CHECKS = {
  captionsMatchScreens: "Every caption sits on the right screen",
  noClientData: "No real client data visible in any frame",
  narrationReadsAloud: "Narration reads aloud cleanly, no stumbles",
  noFixedAgentClaims: "No line claims the agent always asks the same thing",
};

const load = () => JSON.parse(readFileSync(specPath, "utf8"));
const slugOf = (s) => `${s.module}-${s.videoType}`;

const MIME = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".json": "application/json", ".html": "text/html; charset=utf-8",
};

const json = (res, code, body) => {
  const s = JSON.stringify(body);
  res.writeHead(code, { "content-type": "application/json", "content-length": Buffer.byteLength(s) });
  res.end(s);
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ---- screenshots -------------------------------------------------------
  if (url.pathname.startsWith("/assets/")) {
    const spec = load();
    const file = basename(decodeURIComponent(url.pathname.slice("/assets/".length)));
    const path = `public/assets/${slugOf(spec)}/${file}`;
    if (!existsSync(path)) {
      res.writeHead(404).end("missing");
      return;
    }
    const buf = readFileSync(path);
    res.writeHead(200, {
      "content-type": MIME[extname(path).toLowerCase()] ?? "application/octet-stream",
      "content-length": buf.length,
      "cache-control": "no-cache",
    });
    res.end(buf);
    return;
  }

  // ---- current spec ------------------------------------------------------
  if (url.pathname === "/api/spec" && req.method === "GET") {
    const spec = load();
    const parsed = safeParseSpec(spec);
    json(res, 200, {
      spec,
      slug: slugOf(spec),
      checks: CHECKS,
      valid: parsed.success,
      issues: parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`),
      approval: approvalState(spec),
      contentHash: contentHash(spec),
    });
    return;
  }

  // ---- save / approve ----------------------------------------------------
  if (url.pathname === "/api/spec" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let incoming;
      try {
        incoming = JSON.parse(body);
      } catch (e) {
        json(res, 400, { error: `bad JSON: ${e.message}` });
        return;
      }
      const { spec, approve, approvedBy, checks } = incoming;

      const parsed = safeParseSpec(spec);
      if (!parsed.success) {
        json(res, 422, {
          error: "spec failed validation, not saved",
          issues: parsed.error.issues.map((i) => `${i.path.join(".") || "root"}: ${i.message}`),
        });
        return;
      }

      const next = { ...spec };
      if (approve) {
        next.review = {
          approvedAt: new Date().toISOString(),
          approvedBy: approvedBy || "unknown",
          contentHash: contentHash(spec),
          checks,
        };
      } else {
        delete next.review; // any edit invalidates a prior approval
      }

      writeFileSync(specPath, JSON.stringify(next, null, 2) + "\n");
      console.log(`  ${approve ? "APPROVED" : "saved"} ${specPath}${approve ? ` by ${approvedBy}` : ""}`);
      json(res, 200, { ok: true, approval: approvalState(next), contentHash: contentHash(next) });
    });
    return;
  }

  // ---- page --------------------------------------------------------------
  res.writeHead(200, { "content-type": MIME[".html"] });
  res.end(PAGE);
});

const PAGE = `<!doctype html>
<meta charset="utf-8"><title>Review</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
 :root{--paper:#FAFAF8;--ink:#16181D;--muted:#6B6E76;--rule:#DCDCD6;--accent:#C8102E;--wash:#F1F1EC;--ok:#1B7F4B;
       --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace}
 *{box-sizing:border-box}
 body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 ui-sans-serif,-apple-system,"Segoe UI",sans-serif}
 .top{position:sticky;top:0;z-index:20;background:var(--paper);border-bottom:1px solid var(--rule);padding:14px 24px 0}
 .eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 3px}
 h1{font-size:19px;margin:0 0 2px;letter-spacing:-.01em}
 .sub{font-size:12px;color:var(--muted);margin:0 0 12px;font-family:var(--mono)}
 .gate{display:flex;flex-wrap:wrap;gap:14px 22px;padding:11px 14px;background:var(--wash);border-left:3px solid var(--accent);font-size:13px;margin-bottom:12px}
 .gate label{display:flex;gap:7px;align-items:center;cursor:pointer}
 .bar{display:flex;gap:9px;align-items:center;flex-wrap:wrap;padding-bottom:13px}
 button{font:inherit;font-size:13px;padding:8px 15px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);border-radius:4px;cursor:pointer}
 button.ghost{background:transparent;color:var(--ink)}
 button:disabled{opacity:.35;cursor:not-allowed}
 input[type=text].who{font:inherit;font-size:13px;padding:7px 10px;border:1px solid var(--rule);border-radius:4px;width:170px}
 .status{font-family:var(--mono);font-size:12px}
 .status.ok{color:var(--ok)} .status.bad{color:var(--accent)}
 .issues{background:#fff;border:1px solid var(--accent);padding:9px 12px;margin-bottom:12px;font-family:var(--mono);font-size:12px;color:var(--accent);white-space:pre-wrap}
 .row{display:grid;grid-template-columns:88px 1fr;gap:18px;padding:20px 24px;border-bottom:1px solid var(--rule)}
 .rail{display:flex;flex-direction:column;gap:5px}
 .sid{font-family:var(--mono);font-size:17px;font-weight:600}
 .role{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
 .role-hook,.role-cta,.role-outro{color:var(--accent);font-weight:600}
 .est{font-family:var(--mono);font-size:11px;color:var(--muted)}
 .beats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px}
 .beat{flex:1 1 330px;min-width:0}
 .stage{position:relative;display:block;cursor:crosshair;border:1px solid var(--rule);background:var(--wash)}
 .stage img{display:block;width:100%;height:auto}
 .pin{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border:3px solid var(--accent);border-radius:50%;box-shadow:0 0 0 3px rgba(255,255,255,.75);pointer-events:none}
 .pin::after{content:"";position:absolute;inset:11px;background:var(--accent);border-radius:50%}
 .brow{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:5px 0 4px}
 .shot{font-family:var(--mono);font-size:10px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .fx{font-family:var(--mono);font-size:10px;color:var(--accent)}
 .fx button{padding:1px 6px;font-size:10px;margin-left:5px}
 textarea,input.cap{width:100%;font:inherit;border:1px solid var(--rule);border-radius:4px;padding:8px 10px;background:#fff}
 input.cap{font-size:14px;font-weight:550}
 textarea{font-family:var(--mono);font-size:13px;line-height:1.6;min-height:62px;resize:vertical}
 .lbl{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 3px}
 .seg{font-family:var(--mono);font-size:12px;color:#4A4E57;margin-top:6px}
 .cut{color:var(--accent);margin:0 4px}
 .warn{font-size:12px;color:var(--accent);margin-top:7px}
 .dirty{outline:2px solid var(--accent);outline-offset:1px}
</style>
<div class="top">
  <p class="eyebrow">Review and approve · edits save to the spec file</p>
  <h1 id="title">loading…</h1>
  <p class="sub" id="sub"></p>
  <div class="issues" id="issues" hidden></div>
  <div class="gate" id="gate"></div>
  <div class="bar">
    <button id="save" class="ghost">Save edits</button>
    <input type="text" class="who" id="who" placeholder="your name">
    <button id="approve" disabled>Approve</button>
    <span class="status" id="status"></span>
  </div>
</div>
<div id="rows"></div>
<script>
let S=null, CHECKS={}, dirty=false;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CPS=15.1;

async function boot(){
  const r=await fetch('/api/spec'); const d=await r.json();
  S=d.spec; CHECKS=d.checks;
  document.getElementById('title').textContent=d.slug+' · '+S.steps.length+' steps';
  render(d);
}

function estSecs(st){
  if(!st.narration) return st.silentDurationSeconds||0;
  return Math.max(st.narration.length/CPS, st.minHoldSeconds||0);
}

function segments(st){
  if(!st.narration) return null;
  const w=st.narration.split(/\\s+/);
  const cuts=st.beats.map(b=>b.atWord??0);
  return cuts.map((s,i)=>w.slice(s, i+1<cuts.length?cuts[i+1]:w.length).join(' '));
}

function warnings(st){
  const out=[];
  if(st.narration){
    const w=st.narration.split(/\\s+/).length;
    if(w<6 && st.minHoldSeconds===undefined) out.push('under 6 words with no minHoldSeconds');
    if(w>30) out.push(w+' words in one line');
    if(/^(So|Now|And then)\\b/.test(st.narration)) out.push('opens with a conversational connective');
  } else if(st.beats.every(b=>!b.caption)) out.push('silent with no caption — dead air');
  for(const b of st.beats){
    if(b.caption && b.caption.split(/\\s+/).length>9) out.push('caption over 9 words');
  }
  return out;
}

function render(d){
  const total=S.steps.reduce((n,s)=>n+estSecs(s),0);
  document.getElementById('sub').textContent=
    'theme '+S.theme+' · voice '+S.voice+' · est '+Math.floor(total/60)+'m '+Math.round(total%60)+'s · hash '+d.contentHash;

  const iss=document.getElementById('issues');
  iss.hidden=d.valid; iss.textContent=d.valid?'':'SCHEMA INVALID\\n'+d.issues.join('\\n');

  const g=document.getElementById('gate');
  g.innerHTML=Object.entries(CHECKS).map(([k,label])=>
    '<label><input type="checkbox" data-k="'+k+'"> '+esc(label)+'</label>').join('');
  g.querySelectorAll('input').forEach(i=>i.addEventListener('change',gateState));

  document.getElementById('rows').innerHTML=S.steps.map((st,si)=>{
    const segs=segments(st);
    return '<div class="row" data-si="'+si+'">'
      +'<div class="rail"><span class="sid">'+esc(st.id)+'</span>'
      +'<span class="role role-'+esc(st.role)+'">'+esc(st.role)+'</span>'
      +'<span class="est">~'+estSecs(st).toFixed(1)+'s</span>'
      +(st.beats.length>1?'<span class="est">'+st.beats.length+' beats</span>':'')+'</div>'
      +'<div><div class="beats">'
      + st.beats.map((b,bi)=>'<div class="beat">'
          +'<div class="stage" data-si="'+si+'" data-bi="'+bi+'">'
          +'<img src="/assets/'+encodeURIComponent(b.screenshot)+'" alt="'+esc(b.screenshot)+'">'
          +'</div>'
          +'<div class="brow"><span class="shot">'+esc(b.screenshot)
          +(b.atWord!==undefined?' · at word '+b.atWord:'')+'</span>'
          +'<span class="fx" data-fx="'+si+'.'+bi+'"></span></div>'
          +'<p class="lbl">caption</p>'
          +'<input class="cap" data-si="'+si+'" data-bi="'+bi+'" value="'+esc(b.caption||'')+'" placeholder="(no caption)">'
        +'</div>').join('')
      +'</div>'
      +(st.narration!==null
        ? '<p class="lbl">narration</p><textarea data-si="'+si+'">'+esc(st.narration)+'</textarea>'
          +(segs&&segs.length>1?'<div class="seg">'+segs.map((s,i)=>(i?'<span class="cut">&#9646;</span>':'')+esc(s)).join(' ')+'</div>':'')
        : '<p class="lbl">silent hold '+st.silentDurationSeconds+'s</p>')
      +'<div class="warns"></div>'
      +'</div></div>';
  }).join('');

  wire();
  paintWarnings();
  paintPins();
  gateState();
  document.getElementById('status').className='status '+(d.approval.ok?'ok':'bad');
  document.getElementById('status').textContent=d.approval.ok
    ? 'approved '+d.approval.at.slice(0,16).replace('T',' ')+' by '+d.approval.by
    : 'not approved: '+d.approval.reason;
}

function wire(){
  document.querySelectorAll('textarea[data-si]').forEach(t=>t.addEventListener('input',e=>{
    S.steps[+e.target.dataset.si].narration=e.target.value;
    markDirty(e.target);
  }));
  document.querySelectorAll('input.cap').forEach(i=>i.addEventListener('input',e=>{
    const v=e.target.value.trim();
    S.steps[+e.target.dataset.si].beats[+e.target.dataset.bi].caption=v||null;
    markDirty(e.target);
  }));
  document.querySelectorAll('.stage').forEach(st=>st.addEventListener('click',ev=>{
    const r=st.getBoundingClientRect();
    const b=S.steps[+st.dataset.si].beats[+st.dataset.bi];
    b.focus={x:+Math.min(Math.max((ev.clientX-r.left)/r.width,0),1).toFixed(4),
             y:+Math.min(Math.max((ev.clientY-r.top)/r.height,0),1).toFixed(4)};
    paintPins(); markDirty(st);
  }));
}

function markDirty(el){
  dirty=true; el.classList.add('dirty');
  document.getElementById('approve').disabled=true;
  const s=document.getElementById('status');
  s.className='status bad'; s.textContent='unsaved edits — save first';
}

function paintWarnings(){
  document.querySelectorAll('.row').forEach(r=>{
    const st=S.steps[+r.dataset.si];
    r.querySelector('.warns').innerHTML=warnings(st).map(w=>'<p class="warn">'+esc(w)+'</p>').join('');
  });
}

function paintPins(){
  document.querySelectorAll('.stage').forEach(st=>{
    st.querySelector('.pin')?.remove();
    const b=S.steps[+st.dataset.si].beats[+st.dataset.bi];
    const tag=document.querySelector('[data-fx="'+st.dataset.si+'.'+st.dataset.bi+'"]');
    if(!b.focus){ tag.innerHTML=''; return; }
    const p=document.createElement('div'); p.className='pin';
    p.style.left=(b.focus.x*100)+'%'; p.style.top=(b.focus.y*100)+'%';
    st.appendChild(p);
    tag.innerHTML='click '+b.focus.x.toFixed(2)+','+b.focus.y.toFixed(2)+'<button data-clr="'+st.dataset.si+'.'+st.dataset.bi+'">clear</button>';
    tag.querySelector('button').onclick=e=>{
      e.stopPropagation();
      delete b.focus; paintPins(); markDirty(tag);
    };
  });
}

function gateState(){
  const boxes=[...document.querySelectorAll('#gate input')];
  const allChecked=boxes.length && boxes.every(b=>b.checked);
  document.getElementById('approve').disabled = dirty || !allChecked;
}

async function post(approve){
  const checks={};
  document.querySelectorAll('#gate input').forEach(b=>checks[b.dataset.k]=b.checked);
  const r=await fetch('/api/spec',{method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({spec:S,approve,approvedBy:document.getElementById('who').value,checks})});
  const d=await r.json();
  const s=document.getElementById('status');
  if(!r.ok){ s.className='status bad'; s.textContent=d.error; 
    const iss=document.getElementById('issues'); iss.hidden=false;
    iss.textContent=(d.issues||[]).join('\\n'); return; }
  dirty=false;
  document.querySelectorAll('.dirty').forEach(e=>e.classList.remove('dirty'));
  document.getElementById('issues').hidden=true;
  paintWarnings();
  s.className='status '+(d.approval.ok?'ok':'bad');
  s.textContent=d.approval.ok?('approved — hash '+d.contentHash):('saved, not approved: '+d.approval.reason);
  gateState();
}
document.getElementById('save').onclick=()=>post(false);
document.getElementById('approve').onclick=()=>post(true);
boot();
</script>
`;

server.listen(PORT, () => {
  const spec = load();
  console.log(`Review server: http://localhost:${PORT}`);
  console.log(`  spec   : ${specPath}`);
  console.log(`  assets : public/assets/${slugOf(spec)}/`);
  console.log(`  ${approvalState(spec).ok ? "approved" : "NOT approved: " + approvalState(spec).reason}`);
  console.log(`\nEdits save straight to the spec. Approval writes a content hash that`);
  console.log(`generate-audio verifies, so editing after approval revokes it.`);
  console.log(`\nCtrl+C to stop.`);
});
