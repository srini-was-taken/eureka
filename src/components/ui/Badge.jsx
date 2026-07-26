"use client";

/**
 * Badge — small label pill
 * context: "landing" | "dashboard" | "focus" | "test"
 */
export default function Badge({ children, color, context = "landing", style: s = {} }) {
  const DEFAULTS = {
    landing:   "#E8610A",
    dashboard: "#3D7A5C",
    focus:     "#4CAF72",
    test:      "#555555",
  };

  const c = color || DEFAULTS[context];

  return (
    <span
      style={{
        background: c + "18",
        color: c,
        border: `1px solid ${c}35`,
        borderRadius: 999,
        padding: "3px 11px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.8,
        fontFamily: "var(--font-dm-sans, inherit)",
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        ...s,
      }}
    >
      {children}
    </span>
  );
}
