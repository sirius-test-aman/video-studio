/**
 * Inspect and repair a screenshot library.
 *
 *   node scripts/library.mjs <module>                    report only
 *   node scripts/library.mjs <module> --relabel ide=enhance
 *   node scripts/library.mjs <module> --sync             reconcile manifest with disk
 *
 * Safe to run repeatedly. Reports before it changes anything.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, renameSync, copyFileSync } from "fs";

const [mod, ...rest] = process.argv.slice(2);
if (!mod) {
  console.error("Usage: node scripts/library.mjs <module> [options]");
  console.error("  --normalize            fix --- and repeated tab names, keeps the tab");
  console.error("  --relabel old=new      change the tab");
  console.error("  --sync                 reconcile manifest with disk");
  console.error("  --dry-run              with --normalize, show the plan only");
  process.exit(1);
}

const DIR = `library/${mod}`;
const MANIFEST = `${DIR}/manifest.json`;
if (!existsSync(DIR)) { console.error(`No such library: ${DIR}`); process.exit(1); }

const arg = (n) => { const i = rest.indexOf(`--${n}`); return i === -1 ? null : rest[i + 1]; };
const relabel = arg("relabel");
const sync = rest.includes("--sync");
const normalize = rest.includes("--normalize");
const dryRun = rest.includes("--dry-run");

/** Never overwrite a manifest without keeping the previous one. */
function saveManifest(obj) {
  if (existsSync(MANIFEST)) copyFileSync(MANIFEST, `${DIR}/manifest.backup.json`);
  writeFileSync(MANIFEST, JSON.stringify(obj, null, 2) + "\n");
}

const tabOf = (file) => {
  const base = file.replace(/\.[a-z0-9]+$/i, "");
  if (base.includes("--")) return base.split("--")[0] || null;
  const i = base.indexOf("-");
  return i > 0 ? base.slice(0, i) : null;
};

let m = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : { module: mod, sources: [], flow: [] };
m.flow ??= [];

const onDisk = () => readdirSync(DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));

/* -------------------------------------------------------------- normalize */
/**
 * Repair filenames without changing which tab a frame belongs to:
 *   - three or more hyphens collapse to the "--" separator
 *   - an action that repeats its own tab loses the repetition
 *     enhance---enhance-flags  ->  enhance--flags
 */
function normalizedName(f) {
  const ext = f.slice(f.lastIndexOf("."));
  let base = f.slice(0, f.lastIndexOf("."));
  base = base.replace(/-{3,}/g, "--");
  const i = base.indexOf("--");
  if (i > 0) {
    const tab = base.slice(0, i);
    let action = base.slice(i + 2).replace(new RegExp(`^${tab}-+`), "");
    if (!action) action = tab;
    base = `${tab}--${action}`;
  }
  return base + ext;
}

if (normalize) {
  const plan = [];
  for (const f of onDisk()) {
    const to = normalizedName(f);
    if (to !== f) plan.push([f, to]);
  }
  if (!plan.length) console.log(`Nothing to normalize.`);
  else {
    console.log(`${plan.length} file(s) to rename:`);
    for (const [a, b] of plan) console.log(`  ${a}\n    -> ${b}`);
    if (dryRun) { console.log(`\nDry run — nothing changed. Drop --dry-run to apply.`); process.exit(0); }
    for (const [a, b] of plan) {
      if (existsSync(`${DIR}/${b}`)) { console.log(`  skip ${a} — ${b} exists`); continue; }
      renameSync(`${DIR}/${a}`, `${DIR}/${b}`);
      for (const e of m.flow) if (e.file === a) { e.file = b; e.tab = tabOf(b); }
    }
    // entries whose file was already renamed by an earlier partial run
    for (const e of m.flow) {
      if (existsSync(`${DIR}/${e.file}`)) continue;
      const guess = normalizedName(e.file);
      if (existsSync(`${DIR}/${guess}`)) { e.file = guess; e.tab = tabOf(guess); }
    }
    console.log(`\nnormalized`);
  }
}

/* ---------------------------------------------------------------- relabel */
if (relabel) {
  const [oldP, newP] = relabel.split("=");
  if (!oldP || !newP) { console.error(`--relabel needs old=new`); process.exit(1); }

  // strip the old tab and any separator, however many hyphens it used
  const strip = (f) => f.replace(new RegExp(`^${oldP}-+`), "");
  let renamed = 0, remapped = 0;

  // disk
  for (const f of onDisk()) {
    if (!f.startsWith(oldP)) continue;
    const to = `${newP}--${strip(f)}`;
    if (f === to) continue;
    if (existsSync(`${DIR}/${to}`)) { console.log(`  skip ${f} — ${to} already exists`); continue; }
    renameSync(`${DIR}/${f}`, `${DIR}/${to}`);
    console.log(`  ${f}  ->  ${to}`);
    renamed++;
  }
  // manifest, including entries whose file was renamed by an earlier partial run
  for (const e of m.flow) {
    if (!e.file.startsWith(oldP)) continue;
    const to = `${newP}--${strip(e.file)}`;
    e.file = to;
    e.tab = newP;
    remapped++;
  }
  console.log(`\n${renamed} file(s) renamed, ${remapped} manifest entr(ies) remapped`);
}

/* ------------------------------------------------------------------- sync */
if (sync || relabel || normalize) {
  const disk = new Set(onDisk());
  const listed = new Set(m.flow.map((e) => e.file));

  const dead = m.flow.filter((e) => !disk.has(e.file));
  let orphans = [...disk].filter((f) => !listed.has(f)).sort();

  // A missing entry plus an unlisted file is almost always the same frame under
  // a new name. Carry shows / at / source across rather than dropping metadata
  // that exists nowhere else. Match on the action part of the name.
  const action = (f) => f.replace(/\.[a-z0-9]+$/i, "").split("--").slice(1).join("--") ||
                        f.replace(/\.[a-z0-9]+$/i, "").split("-").slice(1).join("-");
  let carried = 0;
  for (const e of dead) {
    const hit = orphans.find((f) => f === normalizedName(e.file) || action(f) === action(e.file));
    if (!hit) continue;
    console.log(`  carrying metadata: ${e.file}  ->  ${hit}`);
    e.file = hit;
    e.tab = tabOf(hit);
    orphans = orphans.filter((f) => f !== hit);
    carried++;
  }
  if (carried) console.log(`  ${carried} entr(ies) rematched, metadata kept`);

  const stillDead = m.flow.filter((e) => !disk.has(e.file));
  if (stillDead.length) {
    console.log(`\nDropping ${stillDead.length} manifest entr(ies) with no matching file:`);
    for (const e of stillDead) console.log(`  ${e.file}${e.shows ? `   ("${e.shows}" — lost)` : ""}`);
    m.flow = m.flow.filter((e) => disk.has(e.file));
  }

  if (orphans.length) {
    console.log(`\nAdding ${orphans.length} file(s) present on disk but not in the flow:`);
    for (const f of orphans) {
      console.log(`  ${f}  (appended — reorder and describe in the picker)`);
      m.flow.push({ file: f, tab: tabOf(f), shows: "", source: null, at: null });
    }
  }

  for (const e of m.flow) if (!e.tab) e.tab = tabOf(e.file);
  saveManifest(m);
}

/* ----------------------------------------------------------------- report */
const disk = onDisk();
console.log(`\n${DIR}`);
console.log(`  ${disk.length} image(s) on disk, ${m.flow.length} in the flow`);
const byTab = {};
for (const e of m.flow) byTab[e.tab ?? "(none)"] = (byTab[e.tab ?? "(none)"] ?? 0) + 1;
console.log(`  tabs: ${Object.entries(byTab).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}`);
const byProd = {};
for (const e of m.flow) byProd[e.product ?? "shared"] = (byProd[e.product ?? "shared"] ?? 0) + 1;
console.log(`  products: ${Object.entries(byProd).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log("");
m.flow.forEach((e, i) => {
  const ok = existsSync(`${DIR}/${e.file}`) ? " " : "!";
  const prod = e.product ? e.product.slice(0, 8) : "shared";
  console.log(`  ${ok}${String(i + 1).padStart(2, "0")}  ${(e.tab ?? "-").padEnd(9)} ${prod.padEnd(8)} ${e.file.padEnd(34)} ${e.shows ?? ""}`);
});
const missing = m.flow.filter((e) => !existsSync(`${DIR}/${e.file}`));
if (missing.length) console.log(`\n! ${missing.length} entr(ies) point at a missing file — run with --sync`);
