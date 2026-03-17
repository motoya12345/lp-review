"use client";

import type { AgentStep } from "@/lib/types";
import { C, FONT } from "@/lib/tokens";

/* ── ステップ定義 ─────────────────────────────────── */
const STEP_ORDER = ["memory", "fetch", "research", "ux", "copy", "cro", "synthesis"];

const STEP_META: Record<string, { label: string; icon: string }> = {
  memory:    { label: "過去レビューを確認",       icon: "🗂"  },
  fetch:     { label: "LPを取得",                icon: "🌐"  },
  research:  { label: "競合・事例を調査",          icon: "🔍"  },
  ux:        { label: "UX・視線誘導を分析",        icon: "🎨"  },
  copy:      { label: "コピーライティングを分析",   icon: "✍️" },
  cro:       { label: "CVR・CTAを分析",           icon: "🎯"  },
  synthesis: { label: "全結果を統合・座標を推定",   icon: "🧠"  },
};

const DEVICE_LABEL: Record<string, string> = { pc: "PC版", sp: "SP版" };

/* ── ステップIDをデバイスと基底IDに分解 ──────────── */
function parseId(id: string): { device: "pc" | "sp" | null; baseId: string } {
  if (id.startsWith("pc:")) return { device: "pc", baseId: id.slice(3) };
  if (id.startsWith("sp:")) return { device: "sp", baseId: id.slice(3) };
  return { device: null, baseId: id };
}

/* ── 色ヘルパー ──────────────────────────────────── */
function statusColor(s: AgentStep["status"]) {
  if (s === "running") return { bg: C.amberBg, bd: C.amberBd, fg: C.amber };
  if (s === "done")    return { bg: C.greenBg, bd: C.greenBd, fg: C.green };
  if (s === "error")   return { bg: C.redBg,   bd: C.redBorder, fg: C.red };
  return { bg: C.surfaceAlt, bd: C.border, fg: C.muted };
}

interface Props { steps: AgentStep[] }

export default function AgentProgress({ steps }: Props) {
  /* ── データ整理 ──────────────────────────────── */
  // device ごとのステップマップ { "pc" | "sp" | "none" → Map<baseId, step> }
  const deviceMaps: Record<string, Map<string, AgentStep>> = {};

  for (const step of steps) {
    const { device, baseId } = parseId(step.id);
    const key = device ?? "none";
    if (!deviceMaps[key]) deviceMaps[key] = new Map();
    deviceMaps[key].set(baseId, step);
  }

  // どのデバイスが存在するか（表示順: pc → sp → none）
  const deviceKeys = (["pc", "sp", "none"] as const).filter((k) => deviceMaps[k]);
  const hasBothDevices = deviceMaps["pc"] && deviceMaps["sp"];

  /* ── 全体進捗計算 ──────────────────────────── */
  const totalExpected = deviceKeys.length * STEP_ORDER.length;
  const totalDone = steps.filter((s) => s.status === "done").length;
  const pct = totalExpected > 0 ? Math.round((totalDone / totalExpected) * 100) : 0;

  // 現在実行中のラベル
  const runningStep = steps.find((s) => s.status === "running");
  const runningLabel = runningStep?.label ?? (totalDone > 0 ? "処理中..." : "準備中...");

  /* ── レンダー ────────────────────────────────── */
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "20px",
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      {/* ヘッダー + プログレスバー */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.sub, fontFamily: FONT.mono, letterSpacing: "0.06em" }}>
            AGENT PIPELINE
          </span>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: FONT.mono }}>
            {totalDone} / {totalExpected} ステップ完了
          </span>
        </div>
        {/* バー */}
        <div style={{ height: 6, background: C.surfaceAlt, borderRadius: 99, overflow: "hidden", border: `1px solid ${C.border}` }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${pct}%`,
            background: pct === 100 ? C.green : C.amber,
            transition: "width 0.4s ease",
          }} />
        </div>
        {/* 現在のステップ名 */}
        <div style={{ fontSize: 12, color: C.amber, marginTop: 6, minHeight: 18, fontWeight: 600 }}>
          {pct < 100 ? `⚙ ${runningLabel}` : "✓ すべてのステップ完了"}
        </div>
      </div>

      {/* デバイスごとのステップ一覧 */}
      {deviceKeys.map((dk) => {
        const map = deviceMaps[dk];
        return (
          <div key={dk}>
            {hasBothDevices && (
              <div style={{
                fontSize: 11, fontWeight: 700, fontFamily: FONT.mono,
                color: dk === "pc" ? C.blue : C.green,
                letterSpacing: "0.08em", marginBottom: 6,
                paddingBottom: 4, borderBottom: `1px solid ${C.border}`,
              }}>
                {dk === "pc" ? "💻 PC版レビュー" : dk === "sp" ? "📱 SP版レビュー" : "レビュー"}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {STEP_ORDER.map((baseId, idx) => {
                const step   = map.get(baseId);
                const meta   = STEP_META[baseId];
                const status = step?.status ?? "idle";
                const msg    = step?.message;
                const { bg, bd, fg } = statusColor(status);

                // 前ステップが done/error なら waiting ではなく次へ
                const prevDone = idx === 0 || map.get(STEP_ORDER[idx - 1])?.status === "done" || map.get(STEP_ORDER[idx - 1])?.status === "error";
                const isPending = status === "idle" && !prevDone;

                return (
                  <div key={baseId} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 7,
                    background: bg, border: `1px solid ${bd}`,
                    opacity: isPending ? 0.45 : 1,
                    transition: "all 0.3s ease",
                  }}>
                    {/* アイコン */}
                    <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1 }}>{meta.icon}</span>

                    {/* テキスト */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: status === "idle" ? 400 : 600,
                        color: fg,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {step?.label
                          ? (hasBothDevices ? step.label.replace(/^\[PC\] |\[SP\] /, "") : step.label)
                          : meta.label}
                      </div>
                      {msg && (
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {msg}
                        </div>
                      )}
                    </div>

                    {/* ステータスバッジ */}
                    <StatusBadge status={status} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* デバイスがまだ1つも来ていない場合 */}
      {deviceKeys.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STEP_ORDER.map((baseId) => {
            const meta = STEP_META[baseId];
            return (
              <div key={baseId} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 7,
                background: C.surfaceAlt, border: `1px solid ${C.border}`,
                opacity: 0.4,
              }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{meta.icon}</span>
                <div style={{ flex: 1, fontSize: 13, color: C.muted }}>{meta.label}</div>
                <StatusBadge status="idle" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── ステータスバッジ ──────────────────────────────── */
function StatusBadge({ status }: { status: AgentStep["status"] }) {
  if (status === "done") {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, color: C.green,
        background: C.greenBg, border: `1px solid ${C.greenBd}`,
        borderRadius: 4, padding: "1px 7px", flexShrink: 0,
      }}>
        完了
      </span>
    );
  }
  if (status === "error") {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, color: C.red,
        background: C.redBg, border: `1px solid ${C.redBorder}`,
        borderRadius: 4, padding: "1px 7px", flexShrink: 0,
      }}>
        エラー
      </span>
    );
  }
  if (status === "running") {
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <span style={{
          width: 12, height: 12,
          border: `2px solid ${C.amberBd}`,
          borderTop: `2px solid ${C.amber}`,
          borderRadius: "50%", display: "inline-block",
          animation: "spin 0.7s linear infinite",
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, color: C.amber,
          background: C.amberBg, border: `1px solid ${C.amberBd}`,
          borderRadius: 4, padding: "1px 7px",
        }}>
          実行中
        </span>
      </span>
    );
  }
  return (
    <span style={{
      fontSize: 11, color: C.muted,
      background: "transparent", border: `1px solid ${C.border}`,
      borderRadius: 4, padding: "1px 7px", flexShrink: 0,
    }}>
      待機
    </span>
  );
}
