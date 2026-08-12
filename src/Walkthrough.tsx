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
  /** Ring diameter in px at 1080p. */
  ringSize: number;
};

const THEMES: Record<string, Theme> = {
  deluxe: {
    page: "#FFFFFF",
    captionBg: "rgba(0,0,0,0.78)",
    captionFg: "#FFFFFF",
    accent: "#0083D3",
    fontFamily: "Carlito, Calibri, sans-serif",
    captionSize: 40,
    captionY: 0.93,
    ringSize: 78,
  },
  siriusai: {
    page: "#F7F8FA",
    captionBg: "rgba(11,36,64,0.86)",
    captionFg: "#FFFFFF",
    accent: "#E8833A",
    fontFamily: "Carlito, Calibri, sans-serif",
    captionSize: 40,
    captionY: 0.93,
    ringSize: 78,
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

const Caption: React.FC<{ entry: CaptionEntry; theme: Theme }> = ({ entry, theme }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, entry.fadeInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: `${theme.captionY * 100}%`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "84%",
          background: theme.captionBg,
          color: theme.captionFg,
          padding: "14px 30px",
          borderRadius: 8,
          fontFamily: theme.fontFamily,
          fontSize: theme.captionSize,
          fontWeight: 600,
          lineHeight: 1.25,
          textAlign: "center",
        }}
      >
        {entry.text}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ focus */

const Focus: React.FC<{ entry: FocusEntry; theme: Theme }> = ({ entry, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const pulse = 1 + 0.12 * Math.sin((frame / fps) * Math.PI * 2 * 1.1);
  const size = theme.ringSize * enter * pulse;

  const left = `${entry.x * 100}%`;
  const top = `${entry.y * 100}%`;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: `5px solid ${theme.accent}`,
          boxShadow: "0 0 0 4px rgba(255,255,255,.6), 0 0 22px rgba(200,16,46,.35)",
          opacity: enter,
        }}
      />
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: 12,
          height: 12,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: theme.accent,
          opacity: enter,
        }}
      />
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
  screenTrack,
  captionTrack,
  focusTrack,
  audioTrack,
}) => {
  const t = themeFor(theme);

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
          <Caption entry={e} theme={t} />
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
