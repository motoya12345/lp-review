"use client";

import { useRef, useEffect } from "react";
import type { Issue } from "@/lib/types";
import { C, FONT, SEVERITY_COLOR } from "@/lib/tokens";

interface Props {
  issue:    Issue;
  isActive: boolean;
  onClick:  () => void;
}

const SEVERITY_LABEL = {
  critical: "重大",
  major:    "要改善",
  minor:    "軽微",
} as const;

export function IssueCard({ issue, isActive, onClick }: Props) {
  const ref   = useRef<HTMLDivElement>(null);
  const color = SEVERITY_COLOR[issue.severity];

  useEffect(() => {
    if (isActive) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isActive]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        border:          `1px solid ${isActive ? color : C.border}`,
        borderLeft:      `4px solid ${color}`,
        borderRadius:    10,
        background:      isActive ? color + "0a" : C.surface,
        padding:         "16px 18px",
        cursor:          "pointer",
        transition:      "all .2s",
        scrollMarginTop: 80,
      }}
    >
      {/* ヘッダー */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{
          width: 26, height: 26, borderRadius: "50%",
          background: color, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, flexShrink: 0,
          fontFamily: FONT.mono,
        }}>
          {issue.id}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>
          {issue.area}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 600, color,
          border: `1px solid ${color}50`,
          borderRadius: 5, padding: "2px 8px",
          fontFamily: FONT.mono,
        }}>
          {SEVERITY_LABEL[issue.severity]}
        </span>
      </div>

      <Section label="問題" color={color}>
        {issue.problem}
      </Section>
      <Section label="なぜ重要か" color={C.amber}>
        {issue.why}
      </Section>
      <Section label="改善方法" color={C.blue}>
        {issue.how}
      </Section>

      {/* Before → After */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <div style={{
          flex: 1, background: C.redBg,
          border: `1px solid ${C.redBorder}`,
          borderRadius: 7, padding: "10px 12px",
        }}>
          <div style={{ fontSize: 9, color: C.red, fontFamily: FONT.mono, letterSpacing: "0.1em", marginBottom: 5 }}>
            BEFORE
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65 }}>{issue.before}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", color: C.muted, fontSize: 16 }}>→</div>
        <div style={{
          flex: 1, background: C.greenBg,
          border: `1px solid ${C.greenBd}`,
          borderRadius: 7, padding: "10px 12px",
        }}>
          <div style={{ fontSize: 9, color: C.green, fontFamily: FONT.mono, letterSpacing: "0.1em", marginBottom: 5 }}>
            AFTER
          </div>
          <div style={{ fontSize: 12, color: C.text, fontWeight: 500, lineHeight: 1.65 }}>{issue.after}</div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, color, children }: {
  label: string; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 9, fontFamily: FONT.mono, color,
        letterSpacing: "0.12em", marginBottom: 4,
      }}>
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
