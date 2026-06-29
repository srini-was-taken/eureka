"use client";
import { TEAL } from "@/lib/theme";

export default function Badge({ children, color = TEAL }) {
  return (
    <span
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 999,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1,
      }}
    >
      {children}
    </span>
  );
}
