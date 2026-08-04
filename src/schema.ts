import { z } from 'zod';

export const captionStyleSchema = z.enum(['boxed', 'plain', 'underlined', 'highlight']);

export const walkthroughSchema = z.object({
  captionStyle: captionStyleSchema.default('boxed'),
  language: z.string().default('en-US'),
  voiceId: z.string().default(''),
  musicTrack: z.string().nullable().default(null),
});

export type Walkthrough = z.infer<typeof walkthroughSchema>;