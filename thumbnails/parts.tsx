import React from "react";
import {
  DARK_LINE,
  DARK_SOFT,
  INK,
  INK_SOFT,
  LINE,
  MONO,
  RED,
  SANS,
  WHITE,
} from "./tokens";

/** Small letterspaced eyebrow with a solid accent tick. */
export const Eyebrow: React.FC<{ text: string; dark?: boolean }> = ({
  text,
  dark,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ width: 26, height: 6, background: RED, borderRadius: 3 }} />
    <div
      style={{
        fontFamily: SANS,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: 3.4,
        color: dark ? DARK_SOFT : INK_SOFT,
      }}
    >
      {text}
    </div>
  </div>
);

/** Play affordance + part label: tells the reader this is a video. */
export const PlayRow: React.FC<{ label: string; dark?: boolean }> = ({
  label,
  dark,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
    <div
      style={{
        width: 62,
        height: 62,
        borderRadius: 62,
        background: RED,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: dark
          ? "0 10px 30px rgba(200,16,46,0.45)"
          : "0 10px 24px rgba(200,16,46,0.28)",
      }}
    >
      <svg width="22" height="26" viewBox="0 0 22 26">
        <path d="M3 2.5 L19 13 L3 23.5 Z" fill={WHITE} />
      </svg>
    </div>
    <div
      style={{
        fontFamily: SANS,
        fontSize: 25,
        fontWeight: 600,
        letterSpacing: 0.4,
        color: dark ? DARK_SOFT : INK_SOFT,
      }}
    >
      {label}
    </div>
  </div>
);

/** Headline. Words wrapped in {} render in the accent colour. */
export const Headline: React.FC<{
  lines: string[];
  size: number;
  dark?: boolean;
  accent: string;
  maxWidth?: number;
}> = ({ lines, size, dark, accent, maxWidth }) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.07,
      letterSpacing: -1.6,
      color: dark ? "#F2F5F8" : INK,
      maxWidth,
    }}
  >
    {lines.map((line, i) => (
      <div key={i}>
        {line.split(/(\{[^}]*\})/).map((chunk, j) =>
          chunk.startsWith("{") ? (
            <span key={j} style={{ color: accent }}>
              {chunk.slice(1, -1)}
            </span>
          ) : (
            <span key={j}>{chunk}</span>
          ),
        )}
      </div>
    ))}
  </div>
);

export const Chip: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  mono?: boolean;
  strong?: boolean;
}> = ({ children, dark, mono, strong }) => (
  <div
    style={{
      fontFamily: mono ? MONO : SANS,
      fontSize: 21,
      fontWeight: 600,
      padding: "9px 16px",
      borderRadius: 8,
      color: strong ? WHITE : dark ? "#C9D4E2" : "#3B4655",
      background: strong ? RED : dark ? "#1B2735" : WHITE,
      border: `1.5px solid ${strong ? RED : dark ? DARK_LINE : LINE}`,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

export const Card: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  pad?: number;
  style?: React.CSSProperties;
}> = ({ children, dark, pad = 26, style }) => (
  <div
    style={{
      background: dark ? "#131C27" : WHITE,
      border: `1.5px solid ${dark ? DARK_LINE : LINE}`,
      borderRadius: 16,
      padding: pad,
      boxShadow: dark
        ? "0 18px 40px rgba(0,0,0,0.35)"
        : "0 14px 34px rgba(16,23,38,0.07)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Tick: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = RED,
}) => (
  <svg width={size} height={size} viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="10" fill={color} />
    <path
      d="M6 11.4 L9.4 14.6 L16 7.8"
      stroke={WHITE}
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Faint square grid for the dark family. */
export const Grid: React.FC<{ opacity?: number }> = ({ opacity = 0.5 }) => (
  <svg
    width="1600"
    height="900"
    style={{ position: "absolute", inset: 0, opacity }}
  >
    <defs>
      <pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse">
        <path d="M64 0 H0 V64" fill="none" stroke="#22303F" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="1600" height="900" fill="url(#g)" />
  </svg>
);

export const MonoLine: React.FC<{
  text: string;
  dark?: boolean;
  size?: number;
  dim?: boolean;
}> = ({ text, dark, size = 23, dim }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      color: dim ? (dark ? "#5E6E80" : "#98A2B0") : dark ? "#C9D4E2" : "#3B4655",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

/** Grey placeholder text lines, for suggesting body copy inside a card. */
export const FauxLines: React.FC<{
  widths: number[];
  dark?: boolean;
  gap?: number;
  height?: number;
}> = ({ widths, dark, gap = 12, height = 10 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>
    {widths.map((w, i) => (
      <div
        key={i}
        style={{
          width: w,
          height,
          borderRadius: height,
          background: dark ? "#243244" : "#E7EBF0",
        }}
      />
    ))}
  </div>
);
