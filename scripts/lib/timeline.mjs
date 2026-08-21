/**
 * Turns resolved steps + ElevenLabs alignment data into parallel tracks.
 *
 * Screens, captions, focus indicators and audio are independent tracks rather
 * than nested inside steps. Consecutive beats sharing a screenshot merge into a
 * single screen entry, so an unchanged screenshot holds instead of remounting.
 */

/** Character offset in `text` where word #wordIndex begins. */
export function wordStartCharIndex(text, wordIndex) {
  const re = /\S+/g;
  let m;
  let w = 0;
  while ((m = re.exec(text)) !== null) {
    if (w === wordIndex) return m.index;
    w++;
  }
  return null;
}

/** Seconds into the clip at which a given word begins. */
export function wordStartSeconds(alignment, narration, wordIndex) {
  if (wordIndex === 0) return 0;

  const starts = alignment.character_start_times_seconds;
  const chars = alignment.characters;
  const spoken = Array.isArray(chars) ? chars.join("") : "";

  if (spoken === narration) {
    const ci = wordStartCharIndex(narration, wordIndex);
    if (ci !== null && ci < starts.length) return starts[ci];
  }

  // Fallback if ElevenLabs normalised the text: proportional by word count.
  const words = narration.split(/\s+/).length;
  return (wordIndex / words) * alignment.character_end_times_seconds.at(-1);
}

export const narrationSeconds = (a) => a.character_end_times_seconds.at(-1);

// ---- video beats ---------------------------------------------------------
import { isVideoBeat, videoScreenEntry } from "./video-beats.mjs";
// --------------------------------------------------------------------------

/** Collapse consecutive adjacent entries whose key matches. */
function mergeRuns(entries, keyOf) {
  const out = [];
  for (const e of entries) {
    const last = out[out.length - 1];
    if (last && keyOf(last) === keyOf(e) && last.from + last.durationInFrames === e.from) {
      last.durationInFrames += e.durationInFrames;
    } else {
      out.push({ ...e });
    }
  }
  return out;
}

export function buildTimeline(resolved, opts) {
  const { fps, assetPrefix, getAudio, paddingFrames = 12 } = opts;
  const warnings = [];

  const crossfade = Math.round((resolved.timing?.crossfadeSeconds ?? 0.6) * fps);
  const captionFade = Math.max(Math.round(0.18 * fps), 1);

  // ---- pass 1: absolute frame position for every beat --------------------
  const flatBeats = [];
  const audioTrack = [];
  let cursor = 0;

  for (const step of resolved.steps) {
    let durationInFrames;
    let alignment = null;

    if (step.narration) {
      const found = getAudio(step.narration);
      if (!found) throw new Error(`No cached audio for step ${step.id}. Run generate-audio first.`);
      alignment = found.alignment;
      const secs = narrationSeconds(alignment);
      const audioFrames = Math.ceil(secs * fps) + paddingFrames;
      const floorFrames = Math.ceil((step.minHoldSeconds ?? 0) * fps);
      durationInFrames = Math.max(audioFrames, floorFrames);
      if (floorFrames > audioFrames) {
        warnings.push(`${step.id}: minHoldSeconds extended the step by ${((floorFrames - audioFrames) / fps).toFixed(2)}s`);
      }
      audioTrack.push({ src: found.ref, from: cursor, durationInFrames, stepId: step.id });
    } else {
      durationInFrames = Math.ceil(step.silentDurationSeconds * fps);
    }

    const cuts = step.beats.map((b, i) =>
      i === 0 ? 0 : Math.round(wordStartSeconds(alignment, step.narration, b.atWord ?? 0) * fps)
    );

    step.beats.forEach((b, i) => {
      const from = cursor + cuts[i];
      const next = i + 1 < cuts.length ? cursor + cuts[i + 1] : cursor + durationInFrames;
      const len = next - from;
      if (len <= 0) warnings.push(`${step.id}: beat ${i + 1} has non-positive duration — check its atWord`);
      flatBeats.push({
        stepId: step.id,
        role: step.role,
        beat: b,
        stepSeconds: durationInFrames / fps,
        screenshot: b.screenshot ? `${assetPrefix}/${b.screenshot}` : null,
        caption: b.caption,
        focus: b.focus ?? null,
        from,
        durationInFrames: Math.max(len, 1),
      });
    });

    cursor += durationInFrames;
  }

  const total = cursor;

  // ---- pass 2: tracks ----------------------------------------------------
  // ---- video beats: never merged, they carry their own playback rate ----
  const screenRaw = flatBeats.map((b) => {
    if (isVideoBeat(b.beat)) {
      const { entry, warnings: w } = videoScreenEntry(
        b.beat, b.from, b.durationInFrames, b.stepSeconds, fps
      );
      warnings.push(...w);
      return entry;
    }
    return { kind: "image", src: b.screenshot, from: b.from, durationInFrames: b.durationInFrames };
  });
  const screenMerged = mergeRuns(
    screenRaw,
    (e) => (e.kind === "video" ? `video:${e.from}` : e.src)
  );
  // -----------------------------------------------------------------------

  // True crossfade: start each screen early so it dissolves over the previous.
  const screenTrack = screenMerged.map((e, i) => {
    // a video is not extended backwards — that would replay its opening frames
    const lead = i === 0 || e.kind === "video" ? 0 : Math.min(crossfade, e.from);
    return { ...e, kind: e.kind ?? "image", from: e.from - lead,
             durationInFrames: e.durationInFrames + lead, fadeInFrames: lead };
  });

  const captionTrack = mergeRuns(
    flatBeats.filter((b) => b.caption).map((b) => ({ text: b.caption, role: b.role, from: b.from, durationInFrames: b.durationInFrames })),
    (e) => e.text
  ).map((e) => ({ ...e, fadeInFrames: captionFade }));

  const focusTrack = flatBeats
    .filter((b) => b.focus)
    .map((b) => ({ ...b.focus, from: b.from, durationInFrames: b.durationInFrames }));

  return {
    variantId: resolved.variantId,
    product: resolved.product,
    module: resolved.module,
    videoType: resolved.videoType,
    theme: resolved.theme,
    fps,
    totalDurationInFrames: total,
    screenTrack,
    captionTrack,
    focusTrack,
    audioTrack,
    stats: {
      beats: flatBeats.length,
      screens: screenTrack.length,
      screensMergedAway: flatBeats.length - screenTrack.length,
      captions: captionTrack.length,
      focusPoints: focusTrack.length,
    },
    warnings,
  };
}
