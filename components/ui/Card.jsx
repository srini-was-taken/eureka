"use client";
import { CARD, BORDER, TEAL } from "@/lib/theme";

export default function Card({ children, style: s = {}, glow }) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: glow ? `0 0 32px ${TEAL}18` : "0 2px 12px #00000040",
        ...s,
      }}
    >
      {children}
    </div>
  );
}
