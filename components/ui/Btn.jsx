"use client";
import { TEAL, TEAL_DIM, TEXT, BORDER } from "@/lib/theme";

export default function Btn({ children, onClick, variant = "primary", style: s = {}, small }) {
  const base = {
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: small ? 13 : 14,
    padding: small ? "8px 18px" : "13px 28px",
    transition: "all .18s",
    letterSpacing: 0.3,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontFamily: "inherit",
  };

  const variants = {
    primary: { background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DIM})`, color: "#000" },
    ghost: { background: "transparent", color: TEXT, border: `1px solid ${BORDER}` },
    outline: { background: "transparent", color: TEAL, border: `1px solid ${TEAL}44` },
  };

  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant], ...s }}>
      {children}
    </button>
  );
}
