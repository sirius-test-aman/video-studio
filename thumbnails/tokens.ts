// Shared design tokens for newsletter thumbnails.
// Palette follows the "deluxe" video theme: Deluxe red on light surfaces.

export const INK = "#0E1726";
export const INK_SOFT = "#5A6472";
export const RED = "#C8102E";
export const RED_LIFT = "#E33B4F"; // red that still reads on the dark family
export const LINE = "#E2E7ED";
export const SURFACE = "#F5F7FA";
export const WHITE = "#FFFFFF";
export const DARK = "#0B1119";
export const DARK_2 = "#16202D";
export const DARK_LINE = "#243244";
export const DARK_TEXT = "#F2F5F8";
export const DARK_SOFT = "#93A0B2";

export const SANS =
  "'Segoe UI Variable Display', 'Segoe UI', Carlito, Calibri, sans-serif";
export const MONO = "'Cascadia Mono', Consolas, 'Courier New', monospace";

export const W = 1600;
export const H = 900;
export const PAD = 76;

export type VideoKey = "enhance" | "quality" | "security";

type VideoMeta = {
  key: VideoKey;
  index: number;
  eyebrow: string;
  partLabel: string;
};

export const VIDEOS: Record<VideoKey, VideoMeta> = {
  enhance: {
    key: "enhance",
    index: 1,
    eyebrow: "VELOX · PAIR PROGRAMMING",
    partLabel: "Tutorial 1 of 3 · Prompt Enhancement",
  },
  quality: {
    key: "quality",
    index: 2,
    eyebrow: "VELOX · PAIR PROGRAMMING",
    partLabel: "Tutorial 2 of 3 · Code Quality",
  },
  security: {
    key: "security",
    index: 3,
    eyebrow: "VELOX · PAIR PROGRAMMING",
    partLabel: "Tutorial 3 of 3 · Code Security",
  },
};
