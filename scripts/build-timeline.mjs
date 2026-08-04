import { readFileSync, writeFileSync } from "fs";
import { steps } from "../src/content/steps.mjs";

const fps = 30;
const paddingFrames = 15;

let currentFrame = 0;
const timeline = steps.map((step) => {
  const alignment = JSON.parse(readFileSync(`public/${step.id}-alignment.json`, "utf-8"));
  const narrationSeconds = alignment.character_end_times_seconds.at(-1);

  const audioFrames = Math.ceil(narrationSeconds * fps) + paddingFrames;
  const floorFrames = Math.ceil((step.minHoldSeconds ?? 1.2) * fps);
  const durationInFrames = Math.max(audioFrames, floorFrames);

  const entry = {
    id: step.id,
    screenshot: step.screenshot,
    audio: `${step.id}.mp3`,
    caption: step.caption ?? null,
    from: currentFrame,
    durationInFrames,
    narrationSeconds: Number(narrationSeconds.toFixed(3)),
    floorApplied: floorFrames > audioFrames,
  };
  currentFrame += durationInFrames;
  return entry;
});

writeFileSync(
  "public/timeline.json",
  JSON.stringify({ fps, steps: timeline, totalDurationInFrames: currentFrame }, null, 2)
);

console.table(timeline.map((t) => ({
  id: t.id, from: t.from, frames: t.durationInFrames,
  narration: t.narrationSeconds + "s", floor: t.floorApplied ? "YES" : "",
})));
console.log(`Total: ${currentFrame} frames (${(currentFrame / fps).toFixed(2)}s)`);