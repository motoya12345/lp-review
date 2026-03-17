"use client";
import { useState } from "react";
import { ReviewResult } from "@/lib/types";
import ActionCard from "./ActionCard";
import Strengths from "./Strengths";
import ResearchPanel from "./ResearchPanel";
import { C, FONT } from "@/lib/tokens";

interface Props {
  result:       ReviewResult;
  pcImage:      string | null;
  spImage:      string | null;
  providerName: string;
  modelId:      string;
  onReset:      () => void;
}

export default function ResultPhase({ result, pcImage, spImage, providerName, modelId, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<"pc" | "sp">("pc");
  const showTabs    = !!pcImage && !!spImage;
  const previewImage = showTabs ? (activeTab === "pc" ? pcImage : spImage) : (pcImage || spImage);

  return (
    <div style={{ animation: "up 0.4s ease", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Headline */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize:   11,
              fontFamily: FONT.mono,
              background: C.surfaceAlt,
              border:     `1px solid ${C.border}`,
              borderRadius: 4,
              padding:    "2px 8px",
              color:      C.sub,
            }}
          >
            {providerName}
          </span>
          <span
            style={{
              fontSize:   11,
              fontFamily: FONT.mono,
              background: C.surfaceAlt,
              border:     `1px solid ${C.border}`,
              borderRadius: 4,
              padding:    "2px 8px",
              color:      C.muted,
            }}
          >
            {modelId}
          </span>
          {result.lpUrl && (
            <a
              href={result.lpUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize:   11,
                fontFamily: FONT.mono,
                background: C.blueBg,
                border:     `1px solid ${C.blueBd}`,
                borderRadius: 4,
                padding:    "2px 8px",
                color:      C.blue,
                textDecoration: "none",
                maxWidth:   200,
                overflow:   "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display:    "inline-block",
              }}
            >
              {result.lpUrl}
            </a>
          )}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.4, margin: 0 }}>
          {result.headline}
        </h2>
      </div>

      {/* LP Preview */}
      {previewImage && (
        <div>
          {showTabs && (
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {(["pc", "sp"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding:    "4px 12px",
                    border:     `1px solid ${activeTab === tab ? C.red : C.border}`,
                    borderRadius: 4,
                    background: activeTab === tab ? C.redBg : C.surface,
                    color:      activeTab === tab ? C.red : C.sub,
                    fontSize:   12,
                    fontWeight: activeTab === tab ? 700 : 400,
                    cursor:     "pointer",
                    fontFamily: FONT.mono,
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt="LP preview"
            style={{
              width:        "100%",
              maxHeight:    280,
              objectFit:    "contain",
              background:   C.surface,
              border:       `1px solid ${C.border}`,
              borderRadius: 8,
              boxShadow:    "0 1px 4px rgba(0,0,0,0.06)",
              display:      "block",
            }}
          />
        </div>
      )}

      {/* Strengths */}
      <Strengths strengths={result.strengths} />

      {/* Priority Actions */}
      <div>
        <div
          style={{
            fontSize:      11,
            fontFamily:    FONT.mono,
            color:         C.muted,
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom:  12,
          }}
        >
          PRIORITY ACTIONS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {result.actions.map((action) => (
            <ActionCard
              key={action.priority}
              action={action}
              defaultOpen={action.priority === 1}
            />
          ))}
        </div>
      </div>

      {/* Research Basis */}
      {result.researchBasis && <ResearchPanel research={result.researchBasis} />}

      {/* Next Step */}
      <div
        style={{
          padding:      16,
          background:   C.surface,
          border:       `1px solid ${C.border}`,
          borderLeft:   `4px solid ${C.red}`,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize:      11,
            fontFamily:    FONT.mono,
            color:         C.red,
            fontWeight:    700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom:  8,
          }}
        >
          NEXT STEP — 今すぐひとつだけやるなら
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>
          {result.next_action}
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        style={{
          padding:      "10px 20px",
          border:       `1px solid ${C.border}`,
          borderRadius: 8,
          background:   C.surface,
          color:        C.sub,
          fontSize:     14,
          cursor:       "pointer",
          alignSelf:    "flex-start",
        }}
      >
        ← 別のLPをレビューする
      </button>
    </div>
  );
}
