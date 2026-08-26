import React from "react";
import {
  Card,
  Chip,
  FauxLines,
  MonoLine,
  Tick,
} from "./parts";
import { DARK_LINE, INK, INK_SOFT, LINE, MONO, RED, SANS, WHITE } from "./tokens";

const Label: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({
  children,
  dark,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 19,
      fontWeight: 700,
      letterSpacing: 2.2,
      color: dark ? "#7E8CA0" : "#8A94A2",
    }}
  >
    {children}
  </div>
);

const DownArrow: React.FC<{ dark?: boolean; height?: number }> = ({
  dark,
  height = 34,
}) => (
  <svg width="20" height={height} viewBox={`0 0 20 ${height}`}>
    <path
      d={`M10 0 V${height - 10}`}
      stroke={dark ? DARK_LINE : "#C9D2DC"}
      strokeWidth="2.5"
    />
    <path
      d={`M3.5 ${height - 12} L10 ${height - 2} L16.5 ${height - 12}`}
      fill="none"
      stroke={dark ? DARK_LINE : "#C9D2DC"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ------------------------------------------------------------------ enhance */

/** Plain task in, context added, enriched brief out. */
export const EnhanceDiagram: React.FC<{ dark?: boolean; scale?: number }> = ({
  dark,
  scale = 1,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      transform: `scale(${scale})`,
    }}
  >
    <Card dark={dark} pad={20} style={{ width: 470 }}>
      <Label dark={dark}>YOU TYPE</Label>
      <div style={{ height: 12 }} />
      <MonoLine dark={dark} size={21} text="enhance  add retry to export job" />
    </Card>

    <DownArrow dark={dark} />

    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", width: 470 }}>
      <Chip dark={dark}>Ticket + acceptance criteria</Chip>
      <Chip dark={dark}>BRD</Chip>
      <Chip dark={dark}>ADRs</Chip>
      <Chip dark={dark}>Team standards</Chip>
    </div>

    <DownArrow dark={dark} />

    <Card
      dark={dark}
      pad={20}
      style={{
        width: 470,
        borderColor: RED,
        borderWidth: 2,
        position: "relative",
      }}
    >
      <Label dark={dark}>YOUR AGENT RECEIVES</Label>
      <div style={{ height: 14 }} />
      <FauxLines
        dark={dark}
        widths={[420, 388, 430, 300]}
        gap={11}
        height={9}
      />
    </Card>
  </div>
);

/** Big before / after pair — the whole argument for video one. */
export const EnhanceBeforeAfter: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <Card dark={dark} pad={28} style={{ width: 380, height: 272 }}>
      <Label dark={dark}>THE TASK YOU TYPE</Label>
      <div style={{ height: 22 }} />
      <div
        style={{
          fontFamily: MONO,
          fontSize: 27,
          lineHeight: 1.45,
          color: dark ? "#C9D4E2" : "#3B4655",
        }}
      >
        add retry to the
        <br />
        export job
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 26,
            background: RED,
            marginLeft: 6,
            transform: "translateY(4px)",
          }}
        />
      </div>
      <div style={{ height: 26 }} />
      <div
        style={{
          fontFamily: SANS,
          fontSize: 21,
          fontWeight: 500,
          lineHeight: 1.35,
          color: dark ? "#7E8CA0" : INK_SOFT,
        }}
      >
        Everything else, your
        <br />
        assistant has to guess.
      </div>
    </Card>

    <svg width="70" height="40" viewBox="0 0 70 40">
      <path d="M0 20 H52" stroke={RED} strokeWidth="4" />
      <path
        d="M46 8 L62 20 L46 32"
        fill="none"
        stroke={RED}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <Card
      dark={dark}
      pad={28}
      style={{ width: 486, height: 272, borderColor: RED, borderWidth: 2 }}
    >
      <Label dark={dark}>WHAT YOUR AGENT GETS</Label>
      <div style={{ height: 18 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {[
          "Linked ticket + acceptance criteria",
          "Requirements from the BRD",
          "Architecture decisions",
          "Team standards",
        ].map((t) => (
          <div
            key={t}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <Tick size={20} />
            <div
              style={{
                fontFamily: SANS,
                fontSize: 22,
                fontWeight: 600,
                color: dark ? "#D5DEE9" : INK,
              }}
            >
              {t}
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/* ------------------------------------------------------------------ quality */

const CHECKS = ["Complexity", "Maintainability", "Duplication", "Lint", "Coverage"];

/** Three repos, one identical check set: the standardisation argument. */
export const QualityMatrix: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <Card dark={dark} pad={28} style={{ width: 520 }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Label dark={dark}>CHECK SET</Label>
      <div style={{ display: "flex", gap: 22 }}>
        {["repo a", "repo b", "repo c"].map((r) => (
          <div
            key={r}
            style={{
              fontFamily: MONO,
              fontSize: 18,
              color: dark ? "#7E8CA0" : "#8A94A2",
              width: 76,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {r}
          </div>
        ))}
      </div>
    </div>
    <div style={{ height: 18 }} />
    <div style={{ display: "flex", flexDirection: "column" }}>
      {CHECKS.map((c, i) => (
        <div
          key={c}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "13px 0",
            borderTop: i === 0 ? "none" : `1.5px solid ${dark ? DARK_LINE : LINE}`,
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 23,
              fontWeight: 600,
              color: dark ? "#D5DEE9" : INK,
            }}
          >
            {c}
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ width: 76, display: "flex", justifyContent: "center" }}>
                <Tick size={22} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

/** A quality read-out as it lands in chat — no invented scores. */
export const QualityReadout: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <Card dark={dark} pad={32} style={{ width: 640 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 12, height: 12, borderRadius: 12, background: RED }} />
      <div
        style={{
          fontFamily: MONO,
          fontSize: 23,
          color: dark ? "#C9D4E2" : "#3B4655",
        }}
      >
        code-quality · review complete
      </div>
    </div>
    <div style={{ height: 24 }} />
    <div style={{ display: "flex", flexDirection: "column" }}>
      {[
        ["Complexity", "per function"],
        ["Maintainability", "per module"],
        ["Duplication", "across the scope"],
        ["Lint", "the project rule set"],
        ["Coverage", "against the required bar"],
      ].map(([label, note], i) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "15px 0",
            borderTop:
              i === 0 ? "none" : `1.5px solid ${dark ? DARK_LINE : LINE}`,
          }}
        >
          <Tick size={22} />
          <div
            style={{
              fontFamily: SANS,
              fontSize: 25,
              fontWeight: 700,
              color: dark ? "#EDF2F7" : INK,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 22,
              fontWeight: 500,
              color: dark ? "#7E8CA0" : INK_SOFT,
            }}
          >
            {note}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

/* ----------------------------------------------------------------- security */

const Shield: React.FC<{ size?: number; dark?: boolean }> = ({
  size = 210,
  dark,
}) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115">
    <path
      d="M50 4 L94 20 V58 C94 84 74 102 50 111 C26 102 6 84 6 58 V20 Z"
      fill={dark ? "#131C27" : WHITE}
      stroke={RED}
      strokeWidth="4"
    />
    <path
      d="M30 57 L44 71 L71 42"
      fill="none"
      stroke={RED}
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Three scan lanes plus the shield: one pass, whole project. */
export const SecurityLanes: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <Shield dark={dark} size={158} />
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[
        ["Vulnerable patterns", "two static passes"],
        ["Committed secrets", "whole repository"],
        ["Dependencies", "graded by severity"],
      ].map(([t, s]) => (
        <Card key={t} dark={dark} pad={18} style={{ width: 330 }}>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 24,
              fontWeight: 700,
              color: dark ? "#EDF2F7" : INK,
            }}
          >
            {t}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 20,
              fontWeight: 600,
              color: dark ? "#7E8CA0" : INK_SOFT,
              marginTop: 4,
            }}
          >
            {s}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

/** Severity read-out card. */
export const SecurityFindings: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <Card dark={dark} pad={30} style={{ width: 620 }}>
    <div
      style={{
        fontFamily: MONO,
        fontSize: 22,
        color: dark ? "#C9D4E2" : "#3B4655",
      }}
    >
      security · whole project
    </div>
    <div style={{ height: 24 }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[
        ["BLOCKER", "Vulnerable pattern", RED],
        ["HIGH", "Committed secret", "#E2683B"],
        ["MEDIUM", "Outdated dependency", "#C9A227"],
        ["LOW", "Advisory note", dark ? "#5E6E80" : "#98A2B0"],
      ].map(([sev, label, colour]) => (
        <div
          key={sev as string}
          style={{ display: "flex", alignItems: "center", gap: 18 }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1.6,
              color: WHITE,
              background: colour as string,
              padding: "7px 12px",
              borderRadius: 6,
              width: 112,
              textAlign: "center",
            }}
          >
            {sev}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 24,
              fontWeight: 600,
              color: dark ? "#D5DEE9" : INK,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 24 }} />
    <div
      style={{
        fontFamily: SANS,
        fontSize: 20,
        fontWeight: 600,
        color: dark ? "#7E8CA0" : INK_SOFT,
      }}
    >
      What you fix and what you accept stays your call.
    </div>
  </Card>
);

/* Dark-family accent graphics ---------------------------------------------- */

export const GhostShield: React.FC = () => (
  <svg
    width="440"
    height="506"
    viewBox="0 0 100 115"
    style={{ position: "absolute", right: 110, bottom: 100, opacity: 0.17 }}
  >
    <path
      d="M50 4 L94 20 V58 C94 84 74 102 50 111 C26 102 6 84 6 58 V20 Z"
      fill="none"
      stroke={RED}
      strokeWidth="3"
    />
    <path
      d="M30 57 L44 71 L71 42"
      fill="none"
      stroke={RED}
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export const GhostGauge: React.FC = () => (
  <svg
    width="500"
    height="500"
    viewBox="0 0 100 100"
    style={{ position: "absolute", right: 80, bottom: 110, opacity: 0.17 }}
  >
    <circle cx="50" cy="50" r="44" fill="none" stroke={RED} strokeWidth="2" />
    <circle
      cx="50"
      cy="50"
      r="34"
      fill="none"
      stroke={RED}
      strokeWidth="6"
      strokeDasharray="160 60"
      transform="rotate(-90 50 50)"
    />
    <path
      d="M32 52 L45 65 L70 36"
      fill="none"
      stroke={RED}
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export const GhostBrackets: React.FC = () => (
  <svg
    width="470"
    height="470"
    viewBox="0 0 100 100"
    style={{ position: "absolute", right: 90, bottom: 120, opacity: 0.16 }}
  >
    <path
      d="M38 18 L14 50 L38 82"
      fill="none"
      stroke={RED}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M62 18 L86 50 L62 82"
      fill="none"
      stroke={RED}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M56 14 L44 86" stroke={RED} strokeWidth="4" strokeLinecap="round" />
  </svg>
);
