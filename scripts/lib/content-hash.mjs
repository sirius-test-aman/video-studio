import { createHash } from "crypto";

/**
 * Hash of everything a reviewer signs off on: narration, captions, screenshots,
 * beat positions, hold durations. Focus points are excluded — moving a click
 * ring does not invalidate an approval.
 */
export function contentHash(spec) {
  const material = spec.steps.map((s) => ({
    id: s.id,
    role: s.role,
    narration: s.narration,
    minHoldSeconds: s.minHoldSeconds ?? null,
    silentDurationSeconds: s.silentDurationSeconds ?? null,
    beats: s.beats.map((b) => ({
      screenshot: b.screenshot ?? null,
      video: b.video ?? null,
      startFrom: b.startFrom ?? null,
      endAt: b.endAt ?? null,
      caption: b.caption,
      atWord: b.atWord ?? null,
    })),
  }));
  const variants = spec.variants.map((v) => ({
    id: v.id,
    hook: v.hook ? { narration: v.hook.narration, beats: v.hook.beats.map((b) => [b.screenshot, b.caption]) } : null,
    cta: v.cta ? { narration: v.cta.narration, beats: v.cta.beats.map((b) => [b.screenshot, b.caption]) } : null,
    captionOverrides: v.captionOverrides ?? null,
  }));
  return createHash("sha256")
    .update(JSON.stringify({ material, variants }))
    .digest("hex")
    .slice(0, 20);
}

export function approvalState(spec) {
  if (!spec.review) return { ok: false, reason: "never reviewed" };
  const now = contentHash(spec);
  if (now !== spec.review.contentHash)
    return { ok: false, reason: "spec edited after approval", was: spec.review.contentHash, now };
  const failed = Object.entries(spec.review.checks).filter(([, v]) => !v).map(([k]) => k);
  if (failed.length) return { ok: false, reason: `unchecked: ${failed.join(", ")}` };
  return { ok: true, at: spec.review.approvedAt, by: spec.review.approvedBy };
}
