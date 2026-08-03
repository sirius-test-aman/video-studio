import { z } from 'zod';

export const captionStyleSchema = z.enum(['boxed', 'plain', 'underlined', 'highlight']);

export const stepSchema = z.object({
  screenshot: z.string(),
  narration: z.string(),
  caption: z.string().optional(),
  minHoldSeconds: z.number().default(1.2),
});

export const walkthroughSchema = z.object({
  hook: z.string(),
  steps: z.array(stepSchema),
  voiceId: z.string(),
  language: z.string().default('en-US'),
  captionStyle: captionStyleSchema.default('boxed'),
  musicTrack: z.string().nullable().default(null),
});

export type Walkthrough = z.infer<typeof walkthroughSchema>;