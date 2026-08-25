/**
 * Print a compact snapshot of repo state, for pasting into a chat that has
 * drifted from the working tree.
 *
 *   node scripts/snapshot.mjs            > snapshot.md
 *   node scripts/snapshot.mjs --full     include full text of small config files
 *
 * Deliberately short: file inventory with sizes and hashes, spec inventory,
 * library inventory, and recent git history. Enough for a reader to say
 * "that file changed since I last saw it" without pasting the repo.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join, extname } from "path";
import { createHash } from "crypto";
import { execSync } from "child_process";

const full = process.argv.includes("--full");
const SKIP = new Set(["node_modules", ".git", "out", ".frames-tmp", ".frames-raw", ".recover-tmp"]);
const CODE = new Set([".mjs", ".ts", ".tsx", ".js"]);

const short = (p) => {
  try { return createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 8); }
  catch { return "--------"; }
};

function walk(dir, depth = 0, out = []) {
  if (depth > 3 || !existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    if (SKIP.has(name) || name.startsWith(".") && name !== ".env") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, depth + 1, out);
    else out.push({ p, size: st.size, mtime: st.mtime });
  }
  return out;
}

const files = walk(".");
const code = files.filter((f) => CODE.has(extname(f.p)));
const docs = files.filter((f) => extname(f.p) === ".md");

console.log(`# Repo snapshot — ${new Date().toISOString().slice(0, 16).replace("T", " ")}\n`);

try {
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  const log = execSync("git log --oneline -12", { encoding: "utf8" }).trim();
  const dirty = execSync("git status --porcelain", { encoding: "utf8" }).trim();
  console.log(`## Git\n\nbranch \`${branch}\`\n`);
  console.log("```\n" + log + "\n```\n");
  if (dirty) console.log(`Uncommitted:\n\n\`\`\`\n${dirty}\n\`\`\`\n`);
} catch { console.log("## Git\n\nnot a git repo or git unavailable\n"); }

console.log(`## Code — ${code.length} files\n`);
console.log("| file | lines | sha |");
console.log("|---|---|---|");
for (const f of code) {
  const lines = readFileSync(f.p, "utf8").split("\n").length;
  console.log(`| \`${f.p.replace(/\\/g, "/")}\` | ${lines} | \`${short(f.p)}\` |`);
}

console.log(`\n## Docs — ${docs.length} files\n`);
console.log("| file | lines | sha |");
console.log("|---|---|---|");
for (const f of docs) {
  const lines = readFileSync(f.p, "utf8").split("\n").length;
  console.log(`| \`${f.p.replace(/\\/g, "/")}\` | ${lines} | \`${short(f.p)}\` |`);
}

if (existsSync("specs")) {
  console.log(`\n## Specs\n`);
  console.log("| spec | product | module | part | type | steps | variants | approved |");
  console.log("|---|---|---|---|---|---|---|---|");
  for (const f of readdirSync("specs").filter((x) => x.endsWith(".json")).sort()) {
    try {
      const s = JSON.parse(readFileSync(join("specs", f), "utf8"));
      console.log(`| \`${f}\` | ${s.product ?? "-"} | ${s.module ?? "-"} | ${s.part ?? "-"} | ${s.videoType ?? "-"} | ${s.steps?.length ?? 0} | ${s.variants?.length ?? 0} | ${s.review ? "yes" : "no"} |`);
    } catch { console.log(`| \`${f}\` | unreadable |||||||`); }
  }
}

if (existsSync("library")) {
  console.log(`\n## Libraries\n`);
  for (const mod of readdirSync("library").sort()) {
    const mf = join("library", mod, "manifest.json");
    if (!existsSync(mf)) continue;
    const m = JSON.parse(readFileSync(mf, "utf8"));
    const tabs = {}, prods = {};
    for (const e of m.flow ?? []) {
      tabs[e.tab ?? "-"] = (tabs[e.tab ?? "-"] ?? 0) + 1;
      prods[e.product ?? "shared"] = (prods[e.product ?? "shared"] ?? 0) + 1;
    }
    console.log(`**${mod}** — ${m.flow?.length ?? 0} frames · tabs: ${Object.entries(tabs).map(([k, v]) => `${k} ${v}`).join(", ")} · products: ${Object.entries(prods).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  }
}

if (existsSync("public/audio")) {
  const clips = readdirSync("public/audio").filter((f) => f.endsWith(".mp3"));
  console.log(`\n## Audio cache\n\n${clips.length} cached clip(s)`);
}

if (full) {
  console.log(`\n## package.json scripts\n`);
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    console.log("```json\n" + JSON.stringify(pkg.scripts ?? {}, null, 2) + "\n```");
  } catch {}
}
