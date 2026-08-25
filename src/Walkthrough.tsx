import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  CalculateMetadataFunction,
} from "remotion";
import { Audio } from "@remotion/media";
import { MousePointerClick, Pointer } from "lucide-react";
import type {
  Walkthrough as WalkthroughProps,
  ScreenEntry,
  CaptionEntry,
  FocusEntry,
} from "./schema";
// ---- video beats (delete this import and the branch in Screen to remove) ----
import { VideoBeat } from "./VideoBeat";
// ---------------------------------------------------------------------------

/* ---------------------------------------------------------------- themes */

type Theme = {
  page: string;
  captionBg: string;
  captionFg: string;
  accent: string;
  fontFamily: string;
  captionSize: number;
  /** Vertical centre of the caption, 0-1 of frame height. */
  captionY: number;
  /** Vertical centre for captions in a promo. */
  captionYPromo: number;
  /** Fallback vertical centre, used when a cursor sits where the caption would. */
  captionYAlt: number;
  /** Multiplier applied to captionSize for hook and CTA captions in a promo. */
  pitchScale: number;
  /** Which lucide cursor to use for a click indicator. */
  cursorIcon: "mouse-pointer-click" | "pointer";
  /** Icon height in px at 1080p. */
  cursorSize: number;
  /**
   * Where the icon's pointing tip sits inside its own box, 0-1. The focus
   * coordinate is placed on this point, not on the icon's centre, so the icon
   * body falls away from the thing it indicates. Nudge if it looks off.
   */
  cursorTip: { x: number; y: number };
};

const THEMES: Record<string, Theme> = {
  deluxe: {
    page: "#FFFFFF",
    captionBg: "rgba(0,0,0,0.78)",
    captionFg: "#FFFFFF",
    accent: "#C8102E",
    fontFamily: "Carlito, Calibri, sans-serif",
    captionSize: 40,
    captionY: 0.93,
    captionYPromo: 0.75,
    captionYAlt: 0.18,
    pitchScale: 1.35,
    cursorIcon: "mouse-pointer-click",
    cursorSize: 76,
    cursorTip: { x: 0.12, y: 0.12 },
  },
  siriusai: {
    page: "#F7F8FA",
    captionBg: "rgba(11,36,64,0.86)",
    captionFg: "#FFFFFF",
    accent: "#E8833A",
    fontFamily: "Carlito, Calibri, sans-serif",
    captionSize: 40,
    captionY: 0.93,
    captionYPromo: 0.75,
    captionYAlt: 0.18,
    pitchScale: 1.35,
    cursorIcon: "mouse-pointer-click",
    cursorSize: 76,
    cursorTip: { x: 0.12, y: 0.12 },
  },
};

const themeFor = (name: string): Theme => THEMES[name] ?? THEMES.deluxe;

/* ---------------------------------------------------------------- screens */

const Screen: React.FC<{ entry: ScreenEntry }> = ({ entry }) => {
  // ---- video beats ----
  if (entry.kind === "video") return <VideoBeat entry={entry} />;
  // ---------------------
  const frame = useCurrentFrame();
  const opacity =
    entry.fadeInFrames > 0
      ? interpolate(frame, [0, entry.fadeInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile(entry.src)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- captions */

/**
 * How close, in fractions of frame height, a cursor has to be to the caption's
 * usual line before the caption moves out of its way.
 */
const CAPTION_BAND = 0.075;

const Caption: React.FC<{
  entry: CaptionEntry;
  theme: Theme;
  isPromo: boolean;
  cursors: { x: number; y: number }[];
}> = ({
  entry,
  theme,
  isPromo,
  cursors,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, entry.fadeInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // In a promo the screenshot is backdrop, not subject: captions sit lower and the
  // pitch bookends are set larger so the argument reads before the screen does.
  const isPitch = isPromo && (entry.role === "hook" || entry.role === "cta");
  const preferred = isPromo ? theme.captionYPromo : theme.captionY;
  // A click indicator landing on the caption line hides one or the other, so the
  // caption yields and moves to the opposite edge for as long as they overlap.
  const collides = cursors.some((c) => Math.abs(c.y - preferred) < CAPTION_BAND);
  const y = collides ? theme.captionYAlt : preferred;
  const size = Math.round(theme.captionSize * (isPitch ? theme.pitchScale : 1));

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: `${y * 100}%`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "84%",
          background: theme.captionBg,
          color: theme.captionFg,
          padding: "14px 30px",
          borderRadius: 8,
          fontFamily: theme.fontFamily,
          fontSize: size,
          fontWeight: isPitch ? 700 : 600,
          lineHeight: 1.25,
          textAlign: "center",
          maxWidth: isPitch ? "72%" : "84%",
        }}
      >
        {entry.text}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ focus */

const CURSORS = {
  "mouse-pointer-click": MousePointerClick,
  pointer: Pointer,
} as const;

const Focus: React.FC<{ entry: FocusEntry; theme: Theme }> = ({ entry, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, mass: 0.5 } });

  // one click shortly after the cursor arrives
  const clickAt = Math.round(fps * 0.4);
  const press = interpolate(frame, [clickAt, clickAt + 3, clickAt + 10], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ripple = interpolate(frame, [clickAt, clickAt + Math.round(fps * 0.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const Icon = CURSORS[theme.cursorIcon] ?? MousePointerClick;
  const size = theme.cursorSize;
  const tipX = theme.cursorTip.x * size;
  const tipY = theme.cursorTip.y * size;

  const left = `${entry.x * 100}%`;
  const top = `${entry.y * 100}%`;

  return (
    <AbsoluteFill>
      {/* click ripple, centred on the tip */}
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: size * 1.5 * ripple,
          height: size * 1.5 * ripple,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: `4px solid ${theme.accent}`,
          opacity: (1 - ripple) * enter,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left,
          top,
          width: size,
          height: size,
          transform: `translate(${-tipX}px, ${-tipY}px) scale(${enter * (1 - press * 0.12)})`,
          transformOrigin: `${tipX}px ${tipY}px`,
          opacity: enter,
        }}
      >
        {/* white halo underneath so the stroke reads over any screenshot */}
        <Icon
          size={size}
          color="#FFFFFF"
          strokeWidth={4.5}
          absoluteStrokeWidth
          style={{ position: "absolute", inset: 0 }}
        />
        <Icon
          size={size}
          color={theme.accent}
          strokeWidth={2}
          absoluteStrokeWidth
          style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 2px 6px rgba(0,0,0,.25))" }}
        />
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- metadata */

export const calculateWalkthroughMetadata: CalculateMetadataFunction<WalkthroughProps> = ({
  props,
}) => ({
  durationInFrames: props.totalDurationInFrames,
  fps: props.fps,
  defaultOutName: `${props.module}-${props.videoType}-${props.variantId}`,
});

/* ----------------------------------------------------------- composition */

export const Walkthrough: React.FC<WalkthroughProps> = ({
  theme,
  videoType,
  screenTrack,
  captionTrack,
  focusTrack,
  audioTrack,
}) => {
  const t = themeFor(theme);
  const isPromo = videoType === "promo";

  return (
    <AbsoluteFill style={{ backgroundColor: t.page }}>
      {screenTrack.map((e, i) => (
        <Sequence key={`s${i}`} from={e.from} durationInFrames={e.durationInFrames}>
          <Screen entry={e} />
        </Sequence>
      ))}

      {focusTrack.map((e, i) => (
        <Sequence key={`f${i}`} from={e.from} durationInFrames={e.durationInFrames}>
          <Focus entry={e} theme={t} />
        </Sequence>
      ))}

      {captionTrack.map((e, i) => (
        <Sequence key={`c${i}`} from={e.from} durationInFrames={e.durationInFrames}>
          <Caption
            entry={e}
            theme={t}
            isPromo={isPromo}
            cursors={focusTrack.filter(
              (f) => f.from < e.from + e.durationInFrames && f.from + f.durationInFrames > e.from,
            )}
          />
        </Sequence>
      ))}

      {audioTrack.map((e, i) => (
        <Sequence key={`a${i}`} from={e.from} durationInFrames={e.durationInFrames}>
          <Audio src={staticFile(e.src)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
