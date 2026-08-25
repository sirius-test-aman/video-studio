/**
 * Mask personal and client identifiers in library frames, producing masked
 * siblings rather than editing the originals.
 *
 *   node scripts/redact-library.mjs            # write masked frames
 *   node scripts/redact-library.mjs --verify   # also write a proof strip
 *
 * Why masked siblings and not in-place edits: one library serves both products,
 * and only Obsida has to hide Deluxe naming and the T-ID. The originals stay
 * for Velox, the masked copies are tagged `obsida` in the manifest, and
 * stage.mjs's product filter hands each video the right set.
 *
 * How the masking works: the identifying span is cut out of the monospace line
 * and the remainder slides left to close the gap, so the line reads as a
 * shorter command instead of a blacked-out one. Done in Node with pngjs
 * because Remotion's bundled FFmpeg is a minimal build with no drawtext,
 * drawbox or boxblur — the same reason padPngInPlace lives in Node.
 *
 * Cut edges snap to the nearest ink-free column so no glyph is ever bisected,
 * and every write is confined to the target line's own inked span, so block
 * edges and pane chrome are untouched. Cuts on one line are applied
 * right-to-left so an earlier cut cannot invalidate a later offset.
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, existsSync } from "fs";

const LIB = "library/pair-programming";
const PITCH = 9; // monospace cell width at 1920x1080 in these captures
const VERIFY = process.argv.includes("--verify");

/**
 * Each entry is one master frame. `lines` are the code lines carrying an
 * identifier, located by an approximate y. `cuts` are character offsets into
 * that line: `from` is the first character to remove, `len` how many. A cut
 * with `toEnd` instead of `len` clears everything from `from` to the end of the
 * line's inked span, for lines where the identifier is embedded in a long
 * mangled path and excising it would leave nonsense behind.
 */
const TARGETS = [
  { file: "quality--run-mcp2.png",         lines: [{ approxY: 491, cuts: [{ from: 13, len: 47 }] }] },
  { file: "quality--lizard-check.png",     lines: [{ approxY: 462, cuts: [{ from: 13, len: 47 }] }] },
  { file: "quality--radon-index.png",      lines: [{ approxY: 654, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] }] },
  { file: "quality--ruff-lint.png",        lines: [{ approxY: 291, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] },
                                                   { approxY: 719, cuts: [{ from: 13, len: 47 }] }] },
  { file: "quality--coverage-standard.png", lines: [{ approxY: 433, cuts: [{ from: 13, len: 47 }] }] },

  // security — the standard `cd ... && OUT=` shape carries two identifiers per line
  { file: "security--semgrep-check.png",   lines: [{ approxY: 584, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] },
                                                   { approxY: 712, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] }] },
  { file: "security--secrets-scan.png",    lines: [{ approxY: 318, cuts: [{ from: 14, toEnd: true }] },
                                                   { approxY: 433, cuts: [{ from: 13, toEnd: true }] },
                                                   { approxY: 712, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] }] },
  { file: "security--secrets-scan2.png",   lines: [{ approxY: 290, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] }] },
  { file: "security--secrets-scan3.png",   lines: [{ approxY: 647, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] }] },
  { file: "security--submit-findings.png", lines: [{ approxY: 329, cuts: [{ from: 90, len: 8 }, { from: 13, len: 47 }] }] },
];

export const maskedName = (f) => f.replace(/\.png$/, "-masked.png");

const lum = (p, x, y) => {
  const i = (y * p.width + x) * 4;
  return p.data[i] * 0.299 + p.data[i + 1] * 0.587 + p.data[i + 2] * 0.114;
};

/** Ink band and horizontal extent of the line nearest approxY. */
function measureLine(p, approxY, xFrom, xTo, thresh = 90) {
  let y0 = null, y1 = null;
  for (let y = approxY - 14; y <= approxY + 14; y++) {
    let ink = 0;
    for (let x = xFrom; x < xTo; x++) if (lum(p, x, y) > thresh) ink++;
    if (ink > 3) { if (y0 === null) y0 = y; y1 = y; }
  }
  if (y0 === null) throw new Error(`no ink near y=${approxY}`);
  const inked = (x) => { for (let y = y0; y <= y1; y++) if (lum(p, x, y) > thresh) return true; return false; };
  let a = null, b = null;
  for (let x = xFrom; x < xTo; x++) if (inked(x)) { if (a === null) a = x; b = x; }
  return { y0, y1, inkFrom: a, inkTo: b };
}

const sample = (p, x, y) => { const i = (y * p.width + x) * 4; return [p.data[i], p.data[i + 1], p.data[i + 2]]; };

/** Nearest ink-free column to `target`, so a cut edge never bisects a glyph. */
function snapToGap(p, target, y0, y1, span = 5, thresh = 90) {
  const clear = (x) => { for (let y = y0; y <= y1; y++) if (lum(p, x, y) > thresh) return false; return true; };
  if (clear(target)) return target;
  for (let d = 1; d <= span; d++) {
    if (clear(target - d)) return target - d;
    if (clear(target + d)) return target + d;
  }
  return target;
}

function cutAndSlide(p, { y0, y1, x0, x1, inkTo, bg }) {
  const w = x1 - x0;
  for (let y = y0; y <= y1; y++) {
    const row = y * p.width * 4;
    for (let x = x1; x <= inkTo; x++) {
      const s = row + x * 4, d = row + (x - w) * 4;
      p.data[d] = p.data[s]; p.data[d + 1] = p.data[s + 1]; p.data[d + 2] = p.data[s + 2]; p.data[d + 3] = 255;
    }
    for (let x = Math.max(x0, inkTo - w + 1); x <= inkTo; x++) {
      const d = row + x * 4;
      p.data[d] = bg[0]; p.data[d + 1] = bg[1]; p.data[d + 2] = bg[2]; p.data[d + 3] = 255;
    }
  }
}

/** Background-fill from x0 to the end of the line's inked span. */
function clearTo(p, { y0, y1, x0, inkTo, bg }) {
  for (let y = y0; y <= y1; y++) {
    const row = y * p.width * 4;
    for (let x = x0; x <= inkTo; x++) {
      const d = row + x * 4;
      p.data[d] = bg[0]; p.data[d + 1] = bg[1]; p.data[d + 2] = bg[2]; p.data[d + 3] = 255;
    }
  }
}

const strips = [];

for (const t of TARGETS) {
  const src = `${LIB}/${t.file}`;
  if (!existsSync(src)) { console.error(`missing ${src}`); process.exit(1); }
  const p = PNG.sync.read(readFileSync(src));
  console.log(`${t.file}`);

  for (const line of t.lines) {
    // Scan starts right of the block's "IN" gutter label, which sits near x=860.
    // Including it would make inkFrom the label rather than the command's first
    // character, shifting every character offset on the line.
    const { y0, y1, inkFrom, inkTo } = measureLine(p, line.approxY, 880, p.width - 20);
    const bg = sample(p, inkFrom + 4, y0 - 3);
    // right-to-left, so an earlier cut cannot shift a later offset
    const cuts = [...line.cuts].sort((a, b) => b.from - a.from);
    for (const c of cuts) {
      if (c.toEnd) {
        const x0 = snapToGap(p, inkFrom + PITCH * c.from, y0, y1);
        clearTo(p, { y0: y0 - 2, y1: y1 + 2, x0, inkTo, bg });
        console.log(`  y${y0}-${y1}  chars ${c.from}..end        x ${x0}..${inkTo}  (cleared)`);
        continue;
      }
      const raw0 = inkFrom + PITCH * c.from;
      const raw1 = inkFrom + PITCH * (c.from + c.len);
      const x0 = snapToGap(p, raw0, y0, y1);
      const x1 = snapToGap(p, raw1, y0, y1);
      cutAndSlide(p, { y0: y0 - 2, y1: y1 + 2, x0, x1, inkTo, bg });
      console.log(`  y${y0}-${y1}  chars ${c.from}..${c.from + c.len - 1}  x ${x0}..${x1 - 1}`);
    }
    if (VERIFY) strips.push({ label: t.file, y0: y0 - 4, y1: y1 + 4, p });
  }

  writeFileSync(`${LIB}/${maskedName(t.file)}`, PNG.sync.write(p));
  console.log(`  -> ${maskedName(t.file)}`);
}

if (VERIFY && strips.length) {
  const W = 1080, K = 2, RH = 0;
  const rows = strips.map((s) => s.y1 - s.y0 + 1);
  const H = rows.reduce((a, b) => a + b + RH, 0);
  const out = new PNG({ width: W * K, height: H * K });
  let oy = 0;
  for (const s of strips) {
    const h = s.y1 - s.y0 + 1;
    for (let y = 0; y < h * K; y++) {
      for (let x = 0; x < W * K; x++) {
        const sx = 840 + Math.floor(x / K), sy = s.y0 + Math.floor(y / K);
        const si = (sy * s.p.width + sx) * 4, di = ((oy * K + y) * W * K + x) * 4;
        out.data[di] = s.p.data[si]; out.data[di + 1] = s.p.data[si + 1];
        out.data[di + 2] = s.p.data[si + 2]; out.data[di + 3] = 255;
      }
    }
    oy += h + RH;
  }
  writeFileSync("out/redact-proof.png", PNG.sync.write(out));
  console.log(`\nproof strip: out/redact-proof.png  (${strips.length} line(s))`);
}
