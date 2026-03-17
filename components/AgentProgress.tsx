"use client";
import { AgentStep } from "@/lib/types";
import { C, FONT } from "@/lib/tokens";

const STEP_ORDER = ["memory", "fetch", "research", "ux", "copy", "cro", "synthesis"];

const STEP_META: Record<string, { label: string; icon: string }> = {
  memory:    { label: "過去レビューを確認",       icon: "🗂"  },
  fetch:     { label: "LPを取得",                icon: "🌐"  },
  research:  { label: "競合・事例を調査",          icon: "🔍"  },
  ux:        { label: "UX・視線誘導を分析",        icon: "🎨"  },
  copy:      { label: "コピーライティングを分析",   icon: "✍️" },
  cro:       { label: "CVR・CTAを分析",           icon: "🎯"  },
  synthesis: { label: "結果を統合",               icon: "🧠"  },
};

interface Props {
  steps: AgentStep[];
}

export default function AgentProgress({ steps }: Props) {
  const stepMap = new Map(steps.map((s) => [s.id, s]));

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.sub,
          marginBottom: 16,
          fontFamily: FONT.mono,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        AGENT PIPELINE
      </div>
      {STEP_ORDER.map((id) => {
        const meta   = STEP_META[id];
        const step   = stepMap.get(id);
        const status = step?.status ?? "idle";
        const msg    = step?.message;

        return (
          <div
            key={id}
            style={{
              display:        "flex",
              alignItems:     "center",
              gap:            12,
              padding:        "10px 12px",
              borderRadius:   8,
              background:     status === "running" ? C.amberBg
                            : status === "done"    ? C.greenBg
                            : status === "error"   ? C.redBg
                            : C.surfaceAlt,
              border: `1px solid ${
                status === "running" ? C.amberBd
              : status === "done"    ? C.greenBd
              : status === "error"   ? C.redBorder
              : C.border
              }`,
              transition: "all 0.3s ease",
            }}
          >
            {/* Icon */}
            <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>

            {/* Label + message */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize:   14,
                  fontWeight: status === "idle" ? 400 : 600,
                  color:      status === "running" ? C.amber
                            : status === "done"    ? C.green
                            : status === "error"   ? C.red
                            : C.muted,
                }}
              >
                {step?.label ?? meta.label}
              </div>
              {msg && (
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {msg}
                </div>
              )}
            </div>

            {/* Status indicator */}
            <StatusIcon status={status} />
          </div>
        );
      })}
    </div>
  );
}

function StatusIcon({ status }: { status: AgentStep["status"] }) {
  if (status === "done") {
    return (
      <span style={{ fontSize: 16, color: C.green, flexShrink: 0 }}>✓</span>
    );
  }
  if (status === "error") {
    return (
      <span style={{ fontSize: 16, color: C.red, flexShrink: 0 }}>✕</span>
    );
  }
  if (status === "running") {
    return (
      <span
        style={{
          width:        16,
          height:       16,
          border:       `2px solid ${C.amberBd}`,
          borderTop:    `2px solid ${C.amber}`,
          borderRadius: "50%",
          flexShrink:   0,
          display:      "inline-block",
          animation:    "spin 0.7s linear infinite",
        }}
      />
    );
  }
  return (
    <span
      style={{
        width:        12,
        height:       12,
        borderRadius: "50%",
        border:       `2px solid ${C.border}`,
        flexShrink:   0,
        display:      "inline-block",
      }}
    />
  );
}
