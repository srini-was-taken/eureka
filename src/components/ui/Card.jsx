"use client";

/**
 * Card — context-aware container with glassmorphism on dark contexts
 * context: "landing" | "dashboard" | "focus" | "test"
 */
export default function Card({
  children,
  context = "dashboard",
  glow,
  accent,
  style: s = {},
  onClick,
}) {
  const CTX = {
    landing:   {
      bg: "rgba(255,255,255,0.72)", blur: "20px",
      border: "rgba(255,255,255,0.85)", shadow: "0 8px 32px rgba(26,23,20,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
      glowColor: "#E8610A",
    },
    dashboard: {
      bg: "rgba(255,255,255,0.06)", blur: "20px",
      border: "rgba(255,255,255,0.09)", shadow: "0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
      glowColor: "#4ADE80",
    },
    focus: {
      bg: "rgba(255,255,255,0.05)", blur: "18px",
      border: "rgba(255,255,255,0.08)", shadow: "0 8px 28px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07)",
      glowColor: "#4CAF72",
    },
    test: {
      bg: "rgba(255,255,255,0.07)", blur: "20px",
      border: "rgba(255,255,255,0.11)", shadow: "0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
      glowColor: "#E8C98A",
    },
  };

  const c = CTX[context] || CTX.dashboard;
  const glowAccent = accent || c.glowColor;

  return (
    <div
      onClick={onClick}
      style={{
        background: c.bg,
        backdropFilter: `blur(${c.blur})`,
        WebkitBackdropFilter: `blur(${c.blur})`,
        border: `1px solid ${glow ? glowAccent + "40" : c.border}`,
        borderRadius: 16,
        padding: 24,
        boxShadow: glow
          ? `${c.shadow}, 0 0 24px ${glowAccent}18`
          : c.shadow,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        ...s,
      }}
    >
      {children}
    </div>
  );
}
