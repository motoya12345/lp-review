"use client";
import { useState } from "react";
import type { ResearchResult } from "@/lib/types";
import { C, FONT } from "@/lib/tokens";

interface Props {
  research: ResearchResult;
}

export default function ResearchPanel({ research }: Props) {
  const [open, setOpen] = useState(false);

  if (!research || research.sources.length === 0) return null;

  return (
    <div
      style={{
        border:       `1px solid ${C.blueBd}`,
        borderRadius: 8,
        background:   C.blueBg,
        overflow:     "hidden",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width:      "100%",
          padding:    "12px 16px",
          display:    "flex",
          alignItems: "center",
          gap:        10,
          background: "none",
          border:     "none",
          cursor:     "pointer",
          textAlign:  "left",
        }}
      >
        <span style={{ fontSize: 16 }}>🔍</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize:        11,
              fontFamily:      FONT.mono,
              color:           C.blue,
              fontWeight:      700,
              textTransform:   "uppercase",
              letterSpacing:   "0.06em",
            }}
          >
            RESEARCH BASIS — 調査根拠
          </div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>
            {research.sources.length}件の参考情報を参照
          </div>
        </div>
        <span style={{ fontSize: 14, color: C.muted }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.blueBd}` }}>
          {research.competitorInsights.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionTitle>競合・事例からの知見</SectionTitle>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {research.competitorInsights.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {research.industryBestPractices.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionTitle>業界ベストプラクティス</SectionTitle>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {research.industryBestPractices.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {research.sources.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionTitle>参照URL</SectionTitle>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                {research.sources.slice(0, 6).map((s, i) => (
                  <li key={i} style={{ fontSize: 12 }}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: C.blue, textDecoration: "underline", wordBreak: "break-all" }}
                    >
                      {s.title || s.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize:      11,
        fontFamily:    FONT.mono,
        color:         C.blue,
        fontWeight:    700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </div>
  );
}
