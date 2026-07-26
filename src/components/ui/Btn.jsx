"use client";

/**
 * Btn — context-aware button component
 * variant: "primary" | "ghost" | "outline" | "dark"
 * context: "landing" | "dashboard" | "focus" | "test"
 */
export default function Btn({
  children,
  onClick,
  variant = "primary",
  context = "dashboard",
  style: s = {},
  small,
  disabled,
  type = "button",
  className = "",
}) {
  const base = {
    border: "none",
    borderRadius: 10,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    fontSize: small ? 13 : 14,
    padding: small ? "9px 20px" : "13px 28px",
    transition: "all .18s cubic-bezier(.16,1,.3,1)",
    letterSpacing: 0.3,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontFamily: "var(--font-dm-sans, inherit)",
    opacity: disabled ? 0.5 : 1,
    position: "relative",
    overflow: "hidden",
  };

  // Context-aware accent colors
  const ACCENTS = {
    landing:   { primary: "#E8610A", dim: "#F4874A", text: "#fff", ghost: "#1A1714", border: "#EAE5DC" },
    dashboard: { primary: "#4ADE80", dim: "#86EFAC", text: "#0D1A12", ghost: "#ECEEF0", border: "rgba(255,255,255,0.15)" },
    focus:     { primary: "#4CAF72", dim: "#6FCF97", text: "#0C1510", ghost: "#C4D9B9", border: "rgba(255,255,255,0.14)" },
    test:      { primary: "#E8C98A", dim: "#F5DFA0", text: "#111016", ghost: "#F0EDE8", border: "rgba(255,255,255,0.15)" },
  };

  const a = ACCENTS[context] || ACCENTS.landing;

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${a.primary}, ${a.dim})`,
      color: a.text,
      boxShadow: `0 4px 14px ${a.primary}30`,
    },
    ghost: {
      background: "transparent",
      color: a.ghost,
      border: `1px solid ${a.border}`,
    },
    outline: {
      background: "transparent",
      color: a.primary,
      border: `1px solid ${a.primary}55`,
    },
    dark: {
      background: a.primary + "18",
      color: a.primary,
      border: `1px solid ${a.primary}30`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...base, ...variants[variant], ...s }}
    >
      {children}
    </button>
  );
}
