"use client";
import { C, FONT } from "@/lib/tokens";

export default function NavBar() {
  return (
    <nav
      style={{
        height: 52,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
      }}
    >
      <span
        style={{
          fontFamily: FONT.mono,
          fontSize: 15,
          fontWeight: 700,
          color: C.red,
          letterSpacing: "-0.01em",
        }}
      >
        lp/review
      </span>
    </nav>
  );
}
