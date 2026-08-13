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
import type {
  Walkthrough as WalkthroughProps,
  ScreenEntry,
  CaptionEntry,
  FocusEntry,
} from "./schema";

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
  /** Multiplier applied to captionSize for hook and CTA captions in a promo. */
  pitchScale: number;
  /** Height of the pointing hand in px at 1080p. */
  handSize: number;
};

const THEMES: Record<string, Theme> = {
  deluxe: {
    page: "#FFFFFF",
    captionBg: "rgba(0,0,0,0.78)",
    captionFg: "#FFFFFF",
    accent: "#C8102E",
    fontFamily: "Carlito, Calibri, sans-serif",
    captionSize: 40,
    captionY: 0.62,
    captionYPromo: 0.75,
    pitchScale: 1.35,
    handSize: 104,
  },
  siriusai: {
    page: "#F7F8FA",
    captionBg: "rgba(11,36,64,0.86)",
    captionFg: "#FFFFFF",
    accent: "#E8833A",
    fontFamily: "Carlito, Calibri, sans-serif",
    captionSize: 40,
    captionY: 0.62,
    captionYPromo: 0.75,
    pitchScale: 1.35,
    handSize: 104,
  },
};

const themeFor = (name: string): Theme => THEMES[name] ?? THEMES.deluxe;

/* ---------------------------------------------------------------- screens */

const Screen: React.FC<{ entry: ScreenEntry }> = ({ entry }) => {
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

const Caption: React.FC<{ entry: CaptionEntry; theme: Theme; isPromo: boolean }> = ({
  entry,
  theme,
  isPromo,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, entry.fadeInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // In a promo the screenshot is backdrop, not subject: captions sit lower and the
  // pitch bookends are set larger so the argument reads before the screen does.
  const isPitch = isPromo && (entry.role === "hook" || entry.role === "cta");
  const y = isPromo ? theme.captionYPromo : theme.captionY;
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

/**
 * Pointing hand with a click burst. Drawn from primitives rather than an icon
 * library so there is no third-party asset or attribution in the render path.
 * The fingertip is the anchor: the icon is offset so the tip lands exactly on
 * the focus coordinate rather than the icon being centred on it.
 */
const PointingHand: React.FC<{ size: number; accent: string; press: number }> = ({
  size,
  accent,
  press,
}) => (
  <svg
    width={size * 0.78}
    height={size}
    viewBox="0 0 78 100"
    style={{ display: "block", overflow: "visible" }}
  >
    {/* click burst above the fingertip, brightest at the moment of press */}
    <g stroke={accent} strokeWidth="5" strokeLinecap="round" opacity={press}>
      <line x1="26" y1="13" x2="26" y2="3" />
      <line x1="12" y1="19" x2="5" y2="12" />
      <line x1="40" y1="19" x2="47" y2="12" />
    </g>

    <g transform={`translate(0, ${press * 5})`}>
      {/* palm */}
      <rect x="10" y="46" width="52" height="46" rx="20" fill="#FFFFFF" stroke={accent} strokeWidth="5" />
      {/* folded fingers */}
      <rect x="34" y="38" width="14" height="26" rx="7" fill="#FFFFFF" stroke={accent} strokeWidth="5" />
      <rect x="48" y="43" width="14" height="24" rx="7" fill="#FFFFFF" stroke={accent} strokeWidth="5" />
      {/* thumb */}
      <rect x="4" y="56" width="14" height="24" rx="7" fill="#FFFFFF" stroke={accent} strokeWidth="5" transform="rotate(-18 11 68)" />
      {/* index finger — its tip is the anchor point */}
      <rect x="19" y="18" width="15" height="46" rx="7.5" fill="#FFFFFF" stroke={accent} strokeWidth="5" />
    </g>
  </svg>
);

const Focus: React.FC<{ entry: FocusEntry; theme: Theme }> = ({ entry, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, mass: 0.5 } });
  // one press shortly after arrival, then settle
  const pressAt = Math.round(fps * 0.45);
  const press = interpolate(frame, [pressAt, pressAt + 4, pressAt + 12], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const h = theme.handSize;
  // fingertip sits at roughly (26, 18) in the 78x100 viewBox
  const tipX = (26 / 78) * (h * 0.78);
  const tipY = (18 / 100) * h;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: `${entry.x * 100}%`,
          top: `${entry.y * 100}%`,
          transform: `translate(${-tipX}px, ${-tipY}px) scale(${enter})`,
          transformOrigin: `${tipX}px ${tipY}px`,
          opacity: enter,
          filter: "drop-shadow(0 3px 10px rgba(0,0,0,.28))",
        }}
      >
        <PointingHand size={h} accent={theme.accent} press={press} />
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
          <Caption entry={e} theme={t} isPromo={isPromo} />
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
