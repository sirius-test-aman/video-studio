import { z } from "zod";

const trackBase = { from: z.number(), durationInFrames: z.number() };

export const roleSchema = z.enum(["hook", "body", "cta", "outro"]);

export const screenEntrySchema = z.object({
  kind: z.enum(["image", "video"]).default("image"),
  src: z.string(),
  fadeInFrames: z.number(),
  // ---- video beats ----
  startFrom: z.number().optional(),
  playbackRate: z.number().optional(),
  // ---------------------
  ...trackBase,
});

export const captionEntrySchema = z.object({
  text: z.string(),
  role: roleSchema.optional(),
  fadeInFrames: z.number(),
  ...trackBase,
});

export const focusEntrySchema = z.object({
  x: z.number(),
  y: z.number(),
  ...trackBase,
});

export const audioEntrySchema = z.object({
  src: z.string(),
  stepId: z.string(),
  ...trackBase,
});

export const walkthroughSchema = z.object({
  variantId: z.string(),
  product: z.string(),
  module: z.string(),
  videoType: z.string(),
  theme: z.string(),
  fps: z.number(),
  totalDurationInFrames: z.number(),
  screenTrack: z.array(screenEntrySchema).min(1),
  captionTrack: z.array(captionEntrySchema),
  focusTrack: z.array(focusEntrySchema),
  audioTrack: z.array(audioEntrySchema),
  stats: z.record(z.string(), z.number()).optional(),
  warnings: z.array(z.string()).default([]),
});

export type Walkthrough = z.infer<typeof walkthroughSchema>;
export type ScreenEntry = z.infer<typeof screenEntrySchema>;
export type CaptionEntry = z.infer<typeof captionEntrySchema>;
export type FocusEntry = z.infer<typeof focusEntrySchema>;
