import React from "react";
import { Eyebrow, Grid, Headline, PlayRow } from "./parts";
import {
  EnhanceBeforeAfter,
  EnhanceDiagram,
  GhostBrackets,
  GhostGauge,
  GhostShield,
  QualityMatrix,
  QualityReadout,
  SecurityFindings,
  SecurityLanes,
} from "./motifs";
import {
  DARK,
  DARK_2,
  DARK_SOFT,
  H,
  INK_SOFT,
  LINE,
  PAD,
  RED,
  RED_LIFT,
  SANS,
  SURFACE,
  VIDEOS,
  VideoKey,
  W,
  WHITE,
} from "./tokens";

type Copy = {
  lines: string[];
  size: number;
  sub?: string;
};

const EDITORIAL: Record<VideoKey, Copy> = {
  enhance: {
    lines: ["How to use {Velox}", "{Prompt Enhancer MCP}"],
    size: 64,
    sub: "Your task, rewritten with the ticket, the requirements and the design decisions attached.",
  },
  quality: {
    lines: ["How to use {Velox}", "{Code Quality MCP}"],
    size: 64,
    sub: "Ask your agent for a review and the same check set runs — complexity, duplication, lint, coverage.",
  },
  security: {
    lines: ["How to use {Velox}", "{Code Security MCP}"],
    size: 64,
    sub: "One pass over the whole project: vulnerable patterns, committed secrets, dependencies, graded.",
  },
};

const DARK_COPY: Record<VideoKey, Copy> = {
  enhance: {
    lines: ["One line in.", "A {full brief} out."],
    size: 98,
    sub: "Prompt enhancement in the IDE you already use",
  },
  quality: {
    lines: ["Same checks.", "{Every codebase.}"],
    size: 98,
    sub: "Code quality review, on request, in chat",
  },
  security: {
    lines: ["One pass.", "{The whole project.}"],
    size: 92,
    sub: "Security scanning, standard across every repo",
  },
};

const ILLUSTRATED: Record<VideoKey, Copy> = {
  enhance: {
    lines: ["What your agent", "{was missing.}"],
    size: 60,
  },
  quality: {
    lines: ["Every repo,", "{reviewed the same way.}"],
    size: 60,
  },
  security: {
    lines: ["Graded findings.", "{Your call on each.}"],
    size: 60,
  },
};

/** Thin brand keyline along the top edge of the light families. */
const AccentBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 9,
      background: RED,
    }}
  />
);

/* ------------------------------------------------------ family A: editorial */

const PANEL = 620;

const Editorial: React.FC<{ v: VideoKey }> = ({ v }) => {
  const meta = VIDEOS[v];
  const copy = EDITORIAL[v];
  const motif =
    v === "enhance" ? (
      <div style={{ transform: "scale(0.92)" }}>
        <EnhanceDiagram />
      </div>
    ) : v === "quality" ? (
      <div style={{ transform: "scale(0.98)" }}>
        <QualityMatrix />
      </div>
    ) : (
      <div style={{ transform: "scale(0.98)" }}>
        <SecurityLanes />
      </div>
    );

  return (
    <div
      style={{
        width: W,
        height: H,
        background: WHITE,
        display: "flex",
        fontFamily: SANS,
        position: "relative",
      }}
    >
      <AccentBar />
      <div
        style={{
          flex: 1,
          padding: PAD,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Eyebrow text={meta.eyebrow} />
        <div>
          <Headline lines={copy.lines} size={copy.size} accent={RED} />
          {copy.sub ? (
            <div
              style={{
                marginTop: 26,
                fontSize: 27,
                fontWeight: 500,
                lineHeight: 1.42,
                color: INK_SOFT,
                maxWidth: 760,
              }}
            >
              {copy.sub}
            </div>
          ) : null}
        </div>
        <PlayRow label={meta.partLabel} />
      </div>

      <div
        style={{
          width: PANEL,
          background: SURFACE,
          borderLeft: `1.5px solid ${LINE}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {motif}
      </div>
    </div>
  );
};

/* ----------------------------------------------------------- family B: dark */

const Dark: React.FC<{ v: VideoKey }> = ({ v }) => {
  const meta = VIDEOS[v];
  const copy = DARK_COPY[v];
  const ghost =
    v === "enhance" ? <GhostBrackets /> : v === "quality" ? <GhostGauge /> : <GhostShield />;

  return (
    <div
      style={{
        width: W,
        height: H,
        position: "relative",
        overflow: "hidden",
        fontFamily: SANS,
        background: `radial-gradient(120% 100% at 8% 0%, ${DARK_2} 0%, ${DARK} 62%)`,
      }}
    >
      <Grid opacity={0.55} />
      {ghost}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: PAD,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Eyebrow text={meta.eyebrow} dark />
        <div>
          <Headline
            lines={copy.lines}
            size={copy.size}
            accent={RED_LIFT}
            dark
            maxWidth={1080}
          />
          {copy.sub ? (
            <div
              style={{
                marginTop: 28,
                fontSize: 30,
                fontWeight: 500,
                color: DARK_SOFT,
              }}
            >
              {copy.sub}
            </div>
          ) : null}
        </div>
        <PlayRow label={meta.partLabel} dark />
      </div>
    </div>
  );
};

/* --------------------------------------------------- family C: illustrative */

const Illustrated: React.FC<{ v: VideoKey }> = ({ v }) => {
  const meta = VIDEOS[v];
  const copy = ILLUSTRATED[v];
  const hero =
    v === "enhance" ? (
      <EnhanceBeforeAfter />
    ) : v === "quality" ? (
      <QualityReadout />
    ) : (
      <SecurityFindings />
    );
  const aside =
    v === "quality"
      ? "The same toolchain and the same thresholds, whichever repository you are in."
      : v === "security"
        ? "Vulnerable patterns, committed secrets and dependencies — one standard pass."
        : null;

  return (
    <div
      style={{
        width: W,
        height: H,
        background: `linear-gradient(180deg, ${WHITE} 0%, ${SURFACE} 100%)`,
        fontFamily: SANS,
        padding: `${PAD - 8}px ${PAD}px ${PAD - 10}px`,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
      }}
    >
      <AccentBar />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <Eyebrow text={meta.eyebrow} />
          <div style={{ height: 22 }} />
          <Headline
            lines={copy.lines}
            size={copy.size}
            accent={RED}
            maxWidth={880}
          />
        </div>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 80,
            background: RED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 28px rgba(200,16,46,0.3)",
            flexShrink: 0,
          }}
        >
          <svg width="28" height="32" viewBox="0 0 22 26">
            <path d="M3 2.5 L19 13 L3 23.5 Z" fill={WHITE} />
          </svg>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 46,
          paddingTop: 18,
        }}
      >
        {hero}
        {aside ? (
          <div style={{ maxWidth: 420 }}>
            <div
              style={{
                fontSize: 31,
                fontWeight: 700,
                lineHeight: 1.3,
                color: "#0E1726",
              }}
            >
              {aside}
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ fontSize: 25, fontWeight: 600, color: INK_SOFT }}>
        {meta.partLabel}
      </div>
    </div>
  );
};

export const THUMBS: { id: string; component: React.FC }[] = [
  { id: "v1-enhance-a-editorial", component: () => <Editorial v="enhance" /> },
  { id: "v1-enhance-b-dark", component: () => <Dark v="enhance" /> },
  { id: "v1-enhance-c-illustrated", component: () => <Illustrated v="enhance" /> },
  { id: "v2-quality-a-editorial", component: () => <Editorial v="quality" /> },
  { id: "v2-quality-b-dark", component: () => <Dark v="quality" /> },
  { id: "v2-quality-c-illustrated", component: () => <Illustrated v="quality" /> },
  { id: "v3-security-a-editorial", component: () => <Editorial v="security" /> },
  { id: "v3-security-b-dark", component: () => <Dark v="security" /> },
  { id: "v3-security-c-illustrated", component: () => <Illustrated v="security" /> },
];
