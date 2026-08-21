import { z } from "zod";

export const roleSchema = z.enum(["hook", "body", "cta", "outro"]);

export const focusSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const beatSchema = z.object({
  // exactly one of screenshot | video — see the refinement below
  screenshot: z.string().min(1).optional(),
  // ---- video beats (delete this block and lib/video-beats.mjs to remove) ----
  video: z.string().min(1).optional(),
  startFrom: z.number().nonnegative().optional(),
  endAt: z.number().positive().optional(),
  fitToAudio: z.boolean().optional(),
  // --------------------------------------------------------------------------
  caption: z.string().nullable().default(null),
  atWord: z.number().int().nonnegative().optional(),
  focus: focusSchema.optional(),
});

const baseStep = z.object({
  id: z.string().min(1),
  role: roleSchema,
  narration: z.string().min(1).nullable(),
  minHoldSeconds: z.number().positive().optional(),
  silentDurationSeconds: z.number().positive().optional(),
  beats: z.array(beatSchema).min(1),
  referenceSeconds: z
    .object({ start: z.number().nonnegative(), end: z.number().nonnegative() })
    .optional(),
});

export const stepSchema = baseStep
  .refine((s) => (s.narration === null ? s.silentDurationSeconds !== undefined : true), {
    message: "silentDurationSeconds is required when narration is null",
  })
  .refine((s) => (s.narration !== null ? s.silentDurationSeconds === undefined : true), {
    message: "silentDurationSeconds must not be set when narration is present",
  })
  .refine((s) => s.beats.every(beatHasOneSource), {
    message: "each beat needs exactly one of screenshot or video",
  })
  .refine((s) => s.beats.every((b) => !b.video || b.endAt === undefined || b.endAt > (b.startFrom ?? 0)), {
    message: "a video beat's endAt must be greater than startFrom",
  })
  .refine((s) => s.beats.length === 1 || s.beats.every((b) => b.atWord !== undefined), {
    message: "every beat must have atWord when a step has more than one beat",
  })
  .refine(
    (s) => {
      if (s.beats.length < 2) return true;
      const idx = s.beats.map((b) => b.atWord);
      return idx.every((v, i) => i === 0 || v > idx[i - 1]);
    },
    { message: "beat atWord values must be strictly increasing" }
  )
  .refine(
    (s) => {
      if (s.narration === null || s.beats.length < 2) return true;
      const n = s.narration.split(/\s+/).length;
      return s.beats.every((b) => b.atWord < n);
    },
    { message: "atWord index exceeds the narration's word count" }
  );

// A caption override is either one string (single-beat step) or an array
// positionally matching the step's beats. null means "keep the authored caption".
const beatHasOneSource = (b) => Boolean(b.screenshot) !== Boolean(b.video);

export const captionOverrideSchema = z.union([
  z.string(),
  z.array(z.string().nullable()).min(1),
]);

export const variantSchema = z.object({
  id: z.string().min(1),
  note: z.string().optional(),
  hook: stepSchema.optional(),
  cta: stepSchema.optional(),
  captionOverrides: z.record(z.string(), captionOverrideSchema).optional(),
  /**
   * Replace a body step's narration. Keyed by step id, one string per step.
   * Screenshots and beat structure are never overridable — only words are.
   */
  narrationOverrides: z.record(z.string(), z.string().min(1)).optional(),
});

export const reviewSchema = z.object({
  approvedAt: z.string(),
  approvedBy: z.string(),
  /** sha256 of the steps array at approval time — detects edits after approval */
  contentHash: z.string(),
  checks: z.record(z.string(), z.boolean()),
});

export const timingSchema = z.object({
  durationRule: z.string().optional(),
  crossfadeSeconds: z.number().nonnegative().default(0.5),
  captionLeadSeconds: z.number().default(0),
  referenceSecondsNote: z.string().optional(),
});

export const specSchema = z
  .object({
    specVersion: z.literal(2),
    product: z.string().min(1),
    module: z.string().min(1),
    videoType: z.enum(["tutorial", "promo"]),
    /** Distinguishes several videos sharing one module, e.g. enhance / quality. */
    part: z.string().min(1).optional(),
    /** Human title for publishing, e.g. "How to create Epics and Stories in Jira". */
    title: z.string().min(1).optional(),
    theme: z.string().min(1),
    voice: z.string().min(1),
    steps: z.array(stepSchema).min(1),
    variants: z.array(variantSchema).min(1),
    timing: timingSchema.default({}),
    review: reviewSchema.optional(),
  })
  .superRefine((spec, ctx) => {
    const ids = spec.steps.map((s) => s.id);
    const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
    if (dupes.length) {
      ctx.addIssue({ code: "custom", message: `duplicate step ids: ${[...new Set(dupes)].join(", ")}` });
    }

    const beatCount = new Map(spec.steps.map((s) => [s.id, s.beats.length]));

    const vIds = spec.variants.map((v) => v.id);
    const vDupes = vIds.filter((v, i) => vIds.indexOf(v) !== i);
    if (vDupes.length) {
      ctx.addIssue({ code: "custom", message: `duplicate variant ids: ${[...new Set(vDupes)].join(", ")}` });
    }

    for (const v of spec.variants) {
      if (v.hook && v.hook.role !== "hook") {
        ctx.addIssue({ code: "custom", message: `${v.id}: hook step must have role "hook"` });
      }
      if (v.cta && v.cta.role !== "cta") {
        ctx.addIssue({ code: "custom", message: `${v.id}: cta step must have role "cta"` });
      }
      for (const sid of Object.keys(v.narrationOverrides ?? {})) {
        if (!beatCount.has(sid)) {
          ctx.addIssue({ code: "custom", message: `${v.id}: narrationOverrides references unknown step "${sid}"` });
          continue;
        }
        const target = spec.steps.find((s) => s.id === sid);
        if (target && target.narration === null) {
          ctx.addIssue({ code: "custom", message: `${v.id}: narrationOverrides["${sid}"] targets a silent step` });
        }
      }
      for (const [sid, val] of Object.entries(v.captionOverrides ?? {})) {
        const n = beatCount.get(sid);
        if (n === undefined) {
          ctx.addIssue({ code: "custom", message: `${v.id}: captionOverrides references unknown step "${sid}"` });
          continue;
        }
        const got = Array.isArray(val) ? val.length : 1;
        if (got !== n) {
          ctx.addIssue({
            code: "custom",
            message: `${v.id}: captionOverrides["${sid}"] has ${got} entr${got === 1 ? "y" : "ies"} but the step has ${n} beat${n === 1 ? "" : "s"}`,
          });
        }
      }
    }
  });

export function parseSpec(raw) {
  return specSchema.parse(raw);
}

export function safeParseSpec(raw) {
  return specSchema.safeParse(raw);
}
