"use client";
import { C, FONT } from "@/lib/tokens";

interface Props {
  onReset?: () => void;
}

export default function NavBar({ onReset }: Props) {
  return (
    <nav
      style={{
        height:       52,
        background:   C.surface,
        borderBottom: `1px solid ${C.border}`,
        display:      "flex",
        alignItems:   "center",
        padding:      "0 24px",
        position:     "sticky",
        top:          0,
        zIndex:       100,
      }}
    >
      <span
        onClick={onReset}
        style={{
          fontFamily:  FONT.mono,
          fontSize:    15,
          fontWeight:  700,
          color:       C.red,
          letterSpacing: "-0.01em",
          cursor:      onReset ? "pointer" : "default",
        }}
      >
        lp/review
      </span>
    </nav>
  );
}
