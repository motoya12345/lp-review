"use client";
import { useState, useEffect } from "react";
import type { ReviewHistory } from "@/lib/types";
import { C, FONT } from "@/lib/tokens";

interface Props {
  onSelect: (history: ReviewHistory) => void;
}

export default function HistoryPanel({ onSelect }: Props) {
  const [history, setHistory] = useState<ReviewHistory[]>([]);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/history")
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [open]);

  if (history.length === 0 && !open) return null;

  return (
    <div
      style={{
        border:       `1px solid ${C.border}`,
        borderRadius: 8,
        background:   C.surface,
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
        <span style={{ fontSize: 16 }}>🗂</span>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize:      11,
              fontFamily:    FONT.mono,
              color:         C.sub,
              fontWeight:    700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            過去のレビュー履歴
          </div>
        </div>
        <span style={{ fontSize: 14, color: C.muted }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {history.length === 0 ? (
            <div style={{ padding: "16px", fontSize: 13, color: C.muted, textAlign: "center" }}>
              まだ履歴がありません
            </div>
          ) : (
            <ul style={{ margin: 0, padding: "8px 0", listStyle: "none" }}>
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => onSelect(h)}
                    style={{
                      width:      "100%",
                      padding:    "10px 16px",
                      display:    "flex",
                      flexDirection: "column",
                      gap:        4,
                      background: "none",
                      border:     "none",
                      cursor:     "pointer",
                      textAlign:  "left",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 600, lineHeight: 1.4 }}>
                      {h.result.headline}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT.mono }}>
                        {h.createdAt.slice(0, 10)}
                      </span>
                      {h.lpUrl && (
                        <span style={{ fontSize: 11, color: C.blue, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                          {h.lpUrl}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
