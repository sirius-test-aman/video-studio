/**
 * Resolve ffmpeg / ffprobe without requiring a system install.
 *
 * Candidates, in order:
 *   1. FFMPEG_PATH / FFPROBE_PATH from .env
 *   2. the binary Remotion ships inside node_modules/@remotion/compositor-*
 *   3. ffmpeg / ffprobe on PATH
 *   4. npx remotion ffmpeg / ffprobe  (needs a shell — npx is a .cmd on Windows)
 *
 * Each candidate is verified by running -version before being accepted, so
 * whichever works on a given machine is the one used.
 *
 * Invocation style matters. A real executable is run with spawnSync and an
 * argument ARRAY, so no shell can mangle a filter graph. npx has to go through
 * a shell because Node cannot launch a .cmd directly, so those arguments are
 * quoted by hand.
 */
import { spawnSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PNG } from "pngjs";
import "dotenv/config";

const isWin = process.platform === "win32";
const EXE = isWin ? ".exe" : "";

/** Binaries Remotion unpacks into node_modules for the current platform. */
function remotionBundled(tool) {
  const base = "node_modules/@remotion";
  if (!existsSync(base)) return [];
  const out = [];
  for (const dir of readdirSync(base)) {
    if (!dir.startsWith("compositor-")) continue;
    for (const sub of ["", "bin", "lib"]) {
      const p = join(base, dir, sub, `${tool}${EXE}`);
      if (existsSync(p)) out.push(p);
    }
  }
  return out;
}

const quoteWin = (a) => (/[\s"^&|<>()]/.test(a) ? `"${a.replace(/"/g, '""')}"` : a);

function probe(cand) {
  try {
    const r = cand.shell
      ? spawnSync([cand.bin, ...cand.prefix, "-version"].map(quoteWin).join(" "),
          { shell: true, encoding: "utf8", windowsHide: true })
      : spawnSync(cand.bin, [...cand.prefix, "-version"],
          { encoding: "utf8", windowsHide: true });
    return r.status === 0;
  } catch {
    return false;
  }
}

function resolve(tool) {
  const envKey = tool === "ffmpeg" ? "FFMPEG_PATH" : "FFPROBE_PATH";
  const cands = [];
  if (process.env[envKey]) cands.push({ bin: process.env[envKey], prefix: [], shell: false, via: "env" });
  for (const p of remotionBundled(tool)) cands.push({ bin: p, prefix: [], shell: false, via: "remotion bundle" });
  cands.push({ bin: tool, prefix: [], shell: false, via: "PATH" });
  cands.push({ bin: "npx", prefix: ["remotion", tool], shell: true, via: "npx remotion" });

  for (const c of cands) if (probe(c)) return c;

  console.error(`\nCannot find ${tool}. Tried:`);
  for (const c of cands) console.error(`  ${[c.bin, ...c.prefix].join(" ")}   (${c.via})`);
  console.error(`\nFix any one of these:`);
  console.error(`  - add ${envKey}=C:/path/to/${tool}${EXE} to .env   (most reliable)`);
  console.error(`  - install ffmpeg and put it on PATH`);
  console.error(`  - run from the repo root so node_modules/@remotion is visible`);
  process.exit(1);
}

const cache = {};
function get(tool) {
  if (!cache[tool]) {
    cache[tool] = resolve(tool);
    const c = cache[tool];
    console.log(`  ${tool.padEnd(7)}: ${[c.bin, ...c.prefix].join(" ")}  (${c.via})`);
  }
  return cache[tool];
}

function exec(tool, args, keepStderr = false) {
  const c = get(tool);
  const r = c.shell
    ? spawnSync([c.bin, ...c.prefix, ...args].map(quoteWin).join(" "),
        { shell: true, encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 })
    : spawnSync(c.bin, [...c.prefix, ...args],
        { encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 });

  if (keepStderr) return `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  if (r.error) throw new Error(`${tool} could not start: ${r.error.message}`);
  if (r.status !== 0) {
    throw new Error(`${tool} exited ${r.status}\n${(r.stderr || r.stdout || "(no output)").trim()}`);
  }
  return r.stdout ?? "";
}

export const runFfmpeg = (args) => exec("ffmpeg", args);
export const runFfprobe = (args) => exec("ffprobe", args);
export const runFfmpegCapture = (args) => exec("ffmpeg", args, true);

const NAMED_COLORS = {
  white: [255, 255, 255], black: [0, 0, 0], gray: [128, 128, 128], grey: [128, 128, 128],
};
function toRgb(c) {
  if (NAMED_COLORS[c]) return NAMED_COLORS[c];
  const h = String(c).replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(h)) return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return NAMED_COLORS.white;
}

/** Box-average downscale. Good enough for UI text and needs no ffmpeg filter. */
function downscale(src, w, h) {
  const dst = new PNG({ width: w, height: h });
  const xr = src.width / w, yr = src.height / h;
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * yr), y1 = Math.max(y0 + 1, Math.floor((y + 1) * yr));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * xr), x1 = Math.max(x0 + 1, Math.floor((x + 1) * xr));
      let r = 0, g = 0, b = 0, n = 0;
      for (let sy = y0; sy < y1 && sy < src.height; sy++) {
        const row = sy * src.width;
        for (let sx = x0; sx < x1 && sx < src.width; sx++) {
          const i = (row + sx) * 4;
          r += src.data[i]; g += src.data[i + 1]; b += src.data[i + 2]; n++;
        }
      }
      const d = (y * w + x) * 4;
      dst.data[d] = r / n; dst.data[d + 1] = g / n; dst.data[d + 2] = b / n; dst.data[d + 3] = 255;
    }
  }
  return dst;
}

/**
 * Fit a PNG onto a fixed canvas, in place: downscale if it overflows, then
 * centre it. Never upscales — a small capture is padded rather than blurred.
 *
 * Done in Node rather than with ffmpeg's `scale` and `pad` filters, because
 * Remotion's bundled FFmpeg is a minimal build that ships neither.
 */
export function padPngInPlace(file, width, height, color = "white") {
  let src = PNG.sync.read(readFileSync(file));
  const from = `${src.width}x${src.height}`;
  if (src.width === width && src.height === height) return { padded: false };

  let scaled = false;
  if (src.width > width || src.height > height) {
    const k = Math.min(width / src.width, height / src.height);
    src = downscale(src, Math.max(1, Math.round(src.width * k)), Math.max(1, Math.round(src.height * k)));
    scaled = true;
  }

  const dst = new PNG({ width, height });
  const [r, g, b] = toRgb(color);
  for (let i = 0; i < dst.data.length; i += 4) {
    dst.data[i] = r; dst.data[i + 1] = g; dst.data[i + 2] = b; dst.data[i + 3] = 255;
  }
  const ox = Math.floor((width - src.width) / 2);
  const oy = Math.floor((height - src.height) / 2);
  for (let y = 0; y < src.height; y++) {
    const srow = y * src.width * 4;
    dst.data.set(src.data.subarray(srow, srow + src.width * 4), (y + oy) * width * 4 + ox * 4);
  }
  writeFileSync(file, PNG.sync.write(dst));
  return { padded: true, scaled, from, fitted: `${src.width}x${src.height}` };
}

/**
 * Single frame at `t` seconds, extracted at native resolution then centred on a
 * fixed canvas. No ffmpeg filters are used, so this works on minimal builds.
 */
export function grabFrame({ video, t, out, width, height, pad = "white" }) {
  runFfmpeg([
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", Number(t).toFixed(3),
    "-i", video,
    "-frames:v", "1",
    out,
  ]);
  return padPngInPlace(out, width, height, pad);
}
