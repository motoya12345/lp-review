"use client";

import { useState, useEffect } from "react";
import { AnnotatedImage } from "./AnnotatedImage";
import { IssueCard }      from "./IssueCard";
import type { ReviewResult } from "@/lib/types";
import { C, FONT, SEVERITY_COLOR } from "@/lib/tokens";

interface Props {
  result:   ReviewResult;
  pcImage:  string | null;
  spImage:  string | null;
  provider: string;
  modelId:  string;
  onReset:  () => void;
}

export function ResultPhase({ result, pcImage, spImage, provider, modelId, onReset }: Props) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [tab, setTab]           = useState<"pc" | "sp">("pc");
  const [narrow, setNarrow]     = useState(false);

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const previewImage = pcImage && spImage ? (tab === "pc" ? pcImage : spImage) : (pcImage ?? spImage);

  const critical = result.issues.filter((i) => i.severity === "critical").length;
  const major    = result.issues.filter((i) => i.severity === "major").length;
  const minor    = result.issues.filter((i) => i.severity === "minor").length;

  return (
    <div>
      {/* サマリー */}
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "20px 22px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontFamily: FONT.mono, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 8px", color: C.sub }}>
            {provider}
          </span>
          <span style={{ fontSize: 11, fontFamily: FONT.mono, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 8px", color: C.muted }}>
            {modelId}
          </span>
        </div>
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>
          REVIEW SUMMARY
        </div>
        <p style={{ fontSize: 14, color: C.text, lineHeight: 1.8, marginBottom: 16, margin: "0 0 16px" }}>
          {result.summary}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {critical > 0 && (
            <span style={{ fontSize: 12, color: SEVERITY_COLOR.critical, border: `1px solid ${SEVERITY_COLOR.critical}40`, background: SEVERITY_COLOR.critical + "10", borderRadius: 6, padding: "4px 12px", fontWeight: 600 }}>
              重大 {critical}件
            </span>
          )}
          {major > 0 && (
            <span style={{ fontSize: 12, color: SEVERITY_COLOR.major, border: `1px solid ${SEVERITY_COLOR.major}40`, background: SEVERITY_COLOR.major + "10", borderRadius: 6, padding: "4px 12px", fontWeight: 600 }}>
              要改善 {major}件
            </span>
          )}
          {minor > 0 && (
            <span style={{ fontSize: 12, color: SEVERITY_COLOR.minor, border: `1px solid ${SEVERITY_COLOR.minor}40`, background: SEVERITY_COLOR.minor + "10", borderRadius: 6, padding: "4px 12px", fontWeight: 600 }}>
              軽微 {minor}件
            </span>
          )}
          <span style={{ fontSize: 12, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 12px" }}>
            合計 {result.issues.length}件
          </span>
        </div>
      </div>

      {/* Strengths */}
      {result.strengths.length > 0 && (
        <div style={{
          background: C.greenBg, border: `1px solid ${C.greenBd}`,
          borderRadius: 10, padding: "14px 18px", marginBottom: 24,
        }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 10, color: C.green, letterSpacing: "0.12em", marginBottom: 10 }}>
            ✓ STRENGTHS — 活かせる強み
          </div>
          {result.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: C.sub, lineHeight: 1.75, display: "flex", gap: 8, marginTop: i > 0 ? 6 : 0 }}>
              <span style={{ color: C.green, flexShrink: 0 }}>◆</span>{s}
            </div>
          ))}
        </div>
      )}

      {/* 2カラム or 1カラム */}
      <div style={{
        display: "grid",
        gridTemplateColumns: narrow ? "1fr" : "1fr 1fr",
        gap: 20,
        alignItems: "start",
      }}>
        {/* 左: アノテーション付き画像 */}
        <div style={narrow ? {} : { position: "sticky", top: 72 }}>
          {pcImage && spImage && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {(["pc", "sp"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  fontFamily: FONT.mono, fontSize: 11,
                  color:      tab === t ? C.red : C.muted,
                  background: tab === t ? C.surface : "transparent",
                  border:     `1px solid ${tab === t ? C.redBorder : C.border}`,
                  borderRadius: 5, padding: "3px 12px", cursor: "pointer",
                }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          {previewImage && (
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, overflow: "hidden",
              boxShadow: "0 2px 12px rgba(0,0,0,.06)",
            }}>
              <AnnotatedImage
                imageUrl={previewImage}
                issues={result.issues}
                activeIssueId={activeId}
                onClickIssue={(id) => setActiveId(id === activeId ? null : id)}
              />
            </div>
          )}
          {/* 凡例 */}
          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {([
              { color: SEVERITY_COLOR.critical, label: "重大" },
              { color: SEVERITY_COLOR.major,    label: "要改善" },
              { color: SEVERITY_COLOR.minor,    label: "軽微" },
            ] as const).map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 12, height: 3, background: color, borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
              </div>
            ))}
            <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
              枠をクリックで詳細へ
            </span>
          </div>
        </div>

        {/* 右: IssueCard 一覧 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 2 }}>
            ISSUES — 指摘一覧（{result.issues.length}件）
          </div>
          {result.issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isActive={activeId === issue.id}
              onClick={() => setActiveId(activeId === issue.id ? null : issue.id)}
            />
          ))}
        </div>
      </div>

      {/* Next Action */}
      {result.next_action && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `4px solid ${C.red}`, borderRadius: 10,
          padding: "16px 18px", marginTop: 24,
        }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 10, color: C.red, letterSpacing: "0.12em", marginBottom: 8 }}>
            NEXT STEP — 今すぐひとつだけやるなら
          </div>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600, lineHeight: 1.6 }}>
            {result.next_action}
          </div>
        </div>
      )}

      <button onClick={onReset} style={{
        width: "100%", height: 46, background: C.surface,
        border: `1px solid ${C.border}`, color: C.muted,
        borderRadius: 10, fontSize: 13, cursor: "pointer",
        marginTop: 24, transition: "all .15s",
      }}>
        ← 別のLPをレビューする
      </button>
    </div>
  );
}
