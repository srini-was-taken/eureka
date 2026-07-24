"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TEAL, TEAL_DIM, CARD, CARD2, BORDER, MUTED, TEXT } from "@/lib/theme";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "home", href: "/dashboard" },
  { label: "Socratic Solver", icon: "brain", href: "/solver" },
  { label: "Feynman Mode", icon: "feynman", href: "/feynman" },
  { label: "Focus Mode", icon: "eye", href: "/focus" },
  { label: "Mistake Journal", icon: "mistake", href: "/mistakes" },
  { label: "Problem Bank", icon: "book", href: "/problems" },
];

const ACTIVE_COLORS = {
  "/dashboard": TEAL,
  "/solver": TEAL,
  "/feynman": "#818cf8",
  "/focus": "#fb923c",
  "/mistakes": "#f472b6",
  "/problems": "#fb923c",
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const activeColor = ACTIVE_COLORS[pathname] || TEAL;
  const supabase = createClient();

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current session user
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Subscribe to auth changes (e.g. token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Derive display name from user metadata or email
  const displayName = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").slice(0, 2).join(" ")
    : user?.email?.split("@")[0] ?? "User";

  const displaySub = user?.user_metadata?.target_exam ?? "JEE Advanced '26";

  // Initials avatar
  const initials = displayName
    .split(" ")
    .map(w => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

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
        onClick={handleLogout}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 10, cursor: "pointer",
          color: "#f87171", fontSize: 14, fontWeight: 500,
          transition: "all .15s",
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
            width: 32, height: 32, background: TEAL + "30",
            borderRadius: "50%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 13, fontWeight: 700, color: TEAL,
            flexShrink: 0,
          }}
        >
          {initials || "👤"}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displaySub}
          </div>
        </div>
      </div>
    </div>
  );
}
