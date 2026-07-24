"use client";
import { useRouter, usePathname } from "next/navigation";
import { TEAL, TEAL_DIM, CARD, CARD2, BORDER, MUTED, TEXT } from "@/lib/theme";
import Icon from "@/components/ui/Icon";

const NAV_ITEMS = [
  { label: "Dashboard",      icon: "home",    href: "/dashboard" },
  { label: "Socratic Solver",icon: "brain",   href: "/solver" },
  { label: "Feynman Mode",   icon: "feynman", href: "/feynman" },
  { label: "Focus Mode",     icon: "eye",     href: "/focus" },
  { label: "Mistake Journal",icon: "mistake", href: "/mistakes" },
  { label: "Problem Bank",   icon: "book",    href: "/problems" },
];

const ACTIVE_COLORS = {
  "/dashboard": TEAL,
  "/solver":    TEAL,
  "/feynman":   "#818cf8",
  "/focus":     "#fb923c",
  "/mistakes":  "#f472b6",
  "/problems":  "#fb923c",
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const activeColor = ACTIVE_COLORS[pathname] || TEAL;

  return (
    <div
      style={{
        width: 220,
        background: CARD,
        borderRight: `1px solid ${BORDER}`,
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => router.push("/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px", marginBottom: 24, cursor: "pointer" }}
      >
        <div
          style={{
            width: 30, height: 30,
            background: `linear-gradient(135deg,${TEAL},${TEAL_DIM})`,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}
        >
          ✦
        </div>
        <span style={{ fontWeight: 800, fontSize: 16 }}>EurekaAI</span>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <div
            key={item.href}
            onClick={() => router.push(item.href)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10, cursor: "pointer",
              background: isActive ? activeColor + "18" : "transparent",
              color: isActive ? activeColor : MUTED,
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: "all .15s",
            }}
          >
            <Icon name={item.icon} color={isActive ? activeColor : MUTED} size={15} />
            {item.label}
          </div>
        );
      })}

      {/* Divider + Logout */}
      <div style={{ height: 1, background: BORDER, margin: "8px 0" }} />
      <div
        onClick={() => router.push("/")}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 10, cursor: "pointer",
          color: "#f87171", fontSize: 14, fontWeight: 500,
        }}
      >
        <span style={{ fontSize: 15 }}>⎋</span> Log out
      </div>

      {/* User card */}
      <div
        style={{
          marginTop: "auto", padding: "12px 14px",
          borderRadius: 10, background: CARD2,
          display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <div
          style={{
            width: 30, height: 30, background: TEAL + "30",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 14,
          }}
        >
          👤
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Arjun S.</div>
          <div style={{ fontSize: 11, color: MUTED }}>JEE Advanced '26</div>
        </div>
      </div>
    </div>
  );
}
