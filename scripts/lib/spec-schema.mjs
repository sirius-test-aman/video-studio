import { z } from "zod";

export const roleSchema = z.enum(["hook", "body", "cta", "outro"]);

export const beatSchema = z.object({
  screenshot: z.string().min(1),
  caption: z.string().nullable().default(null),
  atWord: z.number().int().nonnegative().optional(),
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
    theme: z.string().min(1),
    voice: z.string().min(1),
    steps: z.array(stepSchema).min(1),
    variants: z.array(variantSchema).min(1),
    timing: timingSchema.default({}),
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
