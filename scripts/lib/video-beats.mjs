/**
 * Video beat support. Deliberately isolated: delete this file and
 * src/VideoBeat.tsx, remove the two call sites marked "video beats", and the
 * pipeline returns to stills only.
 *
 * Audio stays authoritative. A clip is stretched or compressed to span its
 * narration exactly, so the pipeline's core rule — narration length decides how
 * long a step lasts — survives contact with pre-recorded footage.
 */

export const MIN_RATE = 0.5;
export const MAX_RATE = 2.0;

export const isVideoBeat = (b) => Boolean(b?.video);

/**
 * @param beat        { video, startFrom, endAt, fitToAudio }
 * @param stepSeconds duration the step will occupy, from its narration
 */
export function videoPlayback(beat, stepSeconds, fps) {
  const startFrom = beat.startFrom ?? 0;
  const endAt = beat.endAt ?? null;
  const clipSeconds = endAt === null ? null : Math.max(0.05, endAt - startFrom);

  const warnings = [];
  let playbackRate = 1;

  if (beat.fitToAudio === false || clipSeconds === null) {
    // clip plays at its own pace; the step is whatever the narration needs
    return { startFrom, endAt, playbackRate: 1, clipSeconds, warnings };
  }

  playbackRate = clipSeconds / stepSeconds;

  if (playbackRate < MIN_RATE || playbackRate > MAX_RATE) {
    const clamped = Math.min(Math.max(playbackRate, MIN_RATE), MAX_RATE);
    warnings.push(
      `${beat.video}: clip is ${clipSeconds.toFixed(1)}s against ${stepSeconds.toFixed(1)}s of narration ` +
        `(rate ${playbackRate.toFixed(2)}x). Clamped to ${clamped.toFixed(2)}x — ` +
        (playbackRate > MAX_RATE
          ? `trim the clip or lengthen the narration.`
          : `shorten the narration or use a longer clip.`)
    );
    playbackRate = clamped;
  } else if (playbackRate < 0.85 || playbackRate > 1.18) {
    warnings.push(
      `${beat.video}: playing at ${playbackRate.toFixed(2)}x to match narration — check it still reads naturally.`
    );
  }

  return { startFrom, endAt, playbackRate, clipSeconds, warnings };
}

/** Screen-track entry for a video beat. Never merged with anything. */
export function videoScreenEntry(beat, absFrom, durationInFrames, stepSeconds, fps) {
  const p = videoPlayback(beat, stepSeconds, fps);
  return {
    entry: {
      kind: "video",
      src: beat.video,
      startFrom: p.startFrom,
      playbackRate: Number(p.playbackRate.toFixed(4)),
      zoom: beat.zoom ?? null,
      from: absFrom,
      durationInFrames,
      fadeInFrames: 0,
    },
    warnings: p.warnings,
  };
}
