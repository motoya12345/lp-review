"use client";
import { C, FONT } from "@/lib/tokens";

interface Props {
  strengths: string[];
}

export default function Strengths({ strengths }: Props) {
  return (
    <div
      style={{
        background: C.greenBg,
        border: `1px solid ${C.greenBd}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontFamily: FONT.mono,
          color: C.green,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 10,
        }}
      >
        ✓ STRENGTHS — 活かせる強み
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {strengths.map((s, i) => (
          <div key={i} style={{ fontSize: 14, color: C.green, lineHeight: 1.5 }}>
            ◆ {s}
          </div>
        ))}
      </div>
    </div>
  );
}
