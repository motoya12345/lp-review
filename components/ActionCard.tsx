"use client";
import { useState } from "react";
import { ActionItem } from "@/lib/types";
import { C, FONT } from "@/lib/tokens";

interface Props {
  action: ActionItem;
  defaultOpen?: boolean;
}

const BORDER_COLORS = {
  1: C.red,
  2: C.amber,
  3: C.blue,
};

const BADGE_STYLES: Record<number, { bg: string; color: string }> = {
  1: { bg: C.redBg, color: C.red },
  2: { bg: C.amberBg, color: C.amber },
  3: { bg: C.blueBg, color: C.blue },
};

export default function ActionCard({ action, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const borderColor = BORDER_COLORS[action.priority];
  const badge = BADGE_STYLES[action.priority];

  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 8,
        overflow: "hidden",
        background: C.surface,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: badge.bg,
            color: badge.color,
            fontFamily: FONT.mono,
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          {action.priority}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontFamily: FONT.mono,
              color: badge.color,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 2,
            }}
          >
            {action.area}
          </div>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600, lineHeight: 1.4 }}>
            {action.problem}
          </div>
        </div>
        <span style={{ fontSize: 16, color: C.muted, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* WHY */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: FONT.mono,
                  color: C.muted,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                WHY — なぜ重要か
              </div>
              <div style={{ fontSize: 14, color: C.sub, lineHeight: 1.6 }}>{action.why}</div>
            </div>

            {/* HOW */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: FONT.mono,
                  color: C.muted,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                HOW — こう直す
              </div>
              <div style={{ fontSize: 14, color: C.text, fontWeight: 500, lineHeight: 1.6 }}>{action.how}</div>
            </div>

            {/* Before / After */}
            <div style={{ display: "flex", gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  background: C.redBg,
                  border: `1px solid ${C.redBorder}`,
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: FONT.mono,
                    color: C.red,
                    fontWeight: 700,
                    marginBottom: 4,
                    letterSpacing: "0.04em",
                  }}
                >
                  BEFORE
                </div>
                <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{action.before}</div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  background: C.greenBg,
                  border: `1px solid ${C.greenBd}`,
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: FONT.mono,
                    color: C.green,
                    fontWeight: 700,
                    marginBottom: 4,
                    letterSpacing: "0.04em",
                  }}
                >
                  AFTER
                </div>
                <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{action.after}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
