/**
 * Number and file raw screenshots.
 *
 *   node scripts/intake.mjs <sourceDir> <module> <videoType> [--dry-run] [--by name]
 *
 * Sorts by file modification time by default, which is capture order if you
 * captured in sequence. Copies rather than moves, so the source stays intact.
 */
import { readdirSync, statSync, mkdirSync, copyFileSync, existsSync, openSync, readSync, closeSync } from "fs";
import { join, extname } from "path";

/** Image dimensions straight from the file header. No ffmpeg needed. */
function imageSize(path) {
  let fd;
  try {
    fd = openSync(path, "r");
    const b = Buffer.alloc(65536);
    const n = readSync(fd, b, 0, 65536, 0);

    // PNG: width/height are big-endian uint32 at byte 16 and 20
    if (n > 24 && b.toString("ascii", 1, 4) === "PNG") {
      return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
    }
    // JPEG: walk segments to the first start-of-frame
    if (n > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < n - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
          return `${b.readUInt16BE(i + 7)}x${b.readUInt16BE(i + 5)}`;
        }
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) try { closeSync(fd); } catch {}
  }
}

const [src, mod, videoType, ...rest] = process.argv.slice(2);
if (!src || !mod || !videoType) {
  console.error("Usage: node scripts/intake.mjs <sourceDir> <module> <videoType> [--dry-run] [--by name] [--only 1,4,9]");
  console.error("  full set  : node scripts/intake.mjs ./caps planning tutorial --by name");
  console.error("  subset    : node scripts/intake.mjs ./caps planning promo --by name --only 3,8,11,14,17,18");
  process.exit(1);
}
const dryRun = rest.includes("--dry-run");
const byName = rest.includes("--by") && rest[rest.indexOf("--by") + 1] === "name";
// Accept "--only 2,3,5" and "--only 2, 3, 5" — bash splits the latter into
// separate argv entries, so collect everything up to the next flag.
let onlyArg = null;
if (rest.includes("--only")) {
  const parts = [];
  for (let i = rest.indexOf("--only") + 1; i < rest.length; i++) {
    if (rest[i].startsWith("--")) break;
    parts.push(rest[i]);
  }
  onlyArg = parts.join(",");
}

if (!existsSync(src)) {
  console.error(`No such directory: ${src}`);
  process.exit(1);
}

const IMG = /\.(png|jpe?g|webp)$/i;
let files = readdirSync(src)
  .filter((f) => IMG.test(f))
  .map((f) => ({ name: f, path: join(src, f), mtime: statSync(join(src, f)).mtimeMs }));

if (!files.length) {
  console.error(`No images in ${src}`);
  process.exit(1);
}

files.sort(byName
  ? (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })
  : (a, b) => a.mtime - b.mtime);

// --only picks a subset by position in the sorted order, keeping that order.
if (onlyArg) {
  const tokens = onlyArg.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean);
  const want = tokens.map(Number);

  const nonNumeric = tokens.filter((t, i) => !Number.isInteger(want[i]));
  if (nonNumeric.length) {
    console.error(`--only could not read: ${nonNumeric.join(", ")}`);
    console.error(`  parsed from: "${onlyArg}"`);
    console.error(`  expected something like --only 2,3,5,6`);
    process.exit(1);
  }
  const bad = want.filter((n) => n < 1 || n > files.length);
  if (bad.length) {
    console.error(`--only positions out of range (1-${files.length}): ${bad.join(", ")}`);
    console.error(`  parsed ${want.length} position(s) from "${onlyArg}"`);
    process.exit(1);
  }
  const dupes = want.filter((n, i) => want.indexOf(n) !== i);
  if (dupes.length) {
    console.error(`--only has duplicate positions: ${[...new Set(dupes)].join(", ")}`);
    process.exit(1);
  }
  files = want.sort((a, b) => a - b).map((n) => files[n - 1]);
  console.log(`picking ${files.length} of the sorted set: ${want.join(", ")}\n`);
}

const slug = `${mod}-${videoType}`;
const dest = `public/assets/${slug}`;

if (existsSync(dest)) {
  const clash = readdirSync(dest).filter((f) => /^step-\d+\./.test(f));
  if (clash.length) {
    console.error(`${dest} already holds ${clash.length} step-NN files.`);
    console.error(`Move or delete them first so numbering cannot collide.`);
    process.exit(1);
  }
}

// dimension sanity — mismatched captures make captions land inconsistently
const dims = new Map();
for (const f of files) {
  f.dim = imageSize(f.path) ?? "unknown";
  dims.set(f.dim, (dims.get(f.dim) ?? 0) + 1);
}

console.log(`source : ${src}`);
console.log(`target : ${dest}/`);
console.log(`order  : ${byName ? "filename" : "capture time (mtime)"}`);
console.log(`\n${files.length} image(s):\n`);

files.forEach((f, i) => {
  const to = `step-${String(i + 1).padStart(2, "0")}${extname(f.name).toLowerCase()}`;
  console.log(`  ${to}  <-  ${f.name}   ${f.dim}`);
});

if (dims.size > 1) {
  console.log(`\nWARNING: ${dims.size} different resolutions present:`);
  for (const [d, n] of dims) console.log(`  ${d}  x${n}`);
  console.log(`  Mixed sizes letterbox differently and shift where captions land.`);
  console.log(`  Recapture at one resolution if you can.`);
}

if (dryRun) {
  console.log(`\nDry run — nothing copied. Drop --dry-run to write.`);
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
files.forEach((f, i) => {
  const to = `step-${String(i + 1).padStart(2, "0")}${extname(f.name).toLowerCase()}`;
  copyFileSync(f.path, join(dest, to));
});

console.log(`\n${files.length} file(s) copied to ${dest}/`);
console.log(`Source directory untouched.`);
console.log(`\nnext: ask Claude Code to draft the storyline for ${slug}`);
