"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TEAL, TEAL_DIM, CARD, CARD2, BORDER, MUTED, TEXT } from "@/lib/theme";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { getExamConfig, DEFAULT_EXAM_KEY } from "@/lib/examConfig";

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
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        // Fetch exam label from profiles table
        const { data: profile } = await supabase.from("profiles").select("exam").eq("id", user.id).single();
        const cfg = getExamConfig(profile?.exam ?? DEFAULT_EXAM_KEY);
        setUser({ ...user, _examLabel: cfg.label });
      } else {
        setUser(null);
      }
    });

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

  const displaySub = user?._examLabel ?? "Loading...";

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
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                background: isActive ? activeColor + "18" : "transparent",
                color: isActive ? activeColor : MUTED,
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                transition: "all .2s ease",
              }}
            >
              <Icon name={item.icon} color={isActive ? activeColor : MUTED} size={16} />
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Profile Section at Bottom */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 1, background: BORDER, margin: "16px 0 16px 0" }} />

        <div
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            background: CARD2,
            border: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36, height: 36, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DIM})`,
              borderRadius: 10, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff",
              flexShrink: 0,
              boxShadow: `0 4px 10px ${TEAL}40`
            }}
          >
            {initials || <Icon name="home" size={14} color="#fff" />}
          </div>

          <div
            onClick={() => router.push("/profile")}
            style={{
              overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", gap: 2,
              cursor: "pointer"
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: TEXT, transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = TEAL}
              onMouseLeave={(e) => e.currentTarget.style.color = TEXT}
            >
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
              {displaySub}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
