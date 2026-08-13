/**
 * Resolve a spec + variantId into a flat, render-ready step list.
 * Pure function. No file IO, no audio, no timing — timing comes later
 * from the alignment data, once audio exists.
 */

function applyCaptionOverride(step, override) {
  if (override === undefined) return step;

  const list = Array.isArray(override) ? override : [override];
  const beats = step.beats.map((beat, i) => {
    const next = list[i];
    // null (or missing) means: keep the authored caption
    if (next === null || next === undefined) return beat;
    return { ...beat, caption: next };
  });

  return { ...step, beats };
}

export function resolveVariant(spec, variantId) {
  const variant = spec.variants.find((v) => v.id === variantId);
  if (!variant) {
    const known = spec.variants.map((v) => v.id).join(", ");
    throw new Error(`Unknown variant "${variantId}". Known variants: ${known}`);
  }

  const overrides = variant.captionOverrides ?? {};

  const narrOverrides = variant.narrationOverrides ?? {};

  const body = spec.steps.map((step) => {
    let next = applyCaptionOverride(step, overrides[step.id]);
    const narr = narrOverrides[step.id];
    if (narr !== undefined) next = { ...next, narration: narr };
    return next;
  });

  const steps = [
    ...(variant.hook ? [variant.hook] : []),
    ...body,
    ...(variant.cta ? [variant.cta] : []),
  ];

  return {
    variantId: variant.id,
    note: variant.note ?? null,
    product: spec.product,
    module: spec.module,
    videoType: spec.videoType,
    theme: spec.theme,
    voice: spec.voice,
    timing: spec.timing,
    steps,
  };
}

export function resolveAll(spec) {
  return spec.variants.map((v) => resolveVariant(spec, v.id));
}

/** Every screenshot a given resolved variant needs. */
export function screenshotsFor(resolved) {
  const seen = new Set();
  for (const step of resolved.steps) {
    for (const beat of step.beats) seen.add(beat.screenshot);
  }
  return [...seen];
}

/** Distinct narration strings across all variants — the cache-planning unit. */
export function narrationSet(spec) {
  const seen = new Map();
  const add = (narration, id) => {
    if (!narration) return;
    if (!seen.has(narration)) seen.set(narration, []);
    seen.get(narration).push(id);
  };
  spec.steps.forEach((s) => add(s.narration, s.id));
  for (const v of spec.variants) {
    add(v.hook?.narration, v.hook?.id ?? `${v.id}/hook`);
    add(v.cta?.narration, v.cta?.id ?? `${v.id}/cta`);
    for (const [sid, narr] of Object.entries(v.narrationOverrides ?? {})) {
      add(narr, `${v.id}/${sid}`);
    }
  }
  return seen;
}
