"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { D_BG, D_SURFACE, D_BORDER, D_TEXT, D_MUTED, D_ACCENT, D_ACCENT2 } from "@/lib/theme";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";
import { getExamConfig, DEFAULT_EXAM_KEY } from "@/lib/examConfig";

const NAV_ITEMS = [
  { label: "Dashboard",      icon: "home",    href: "/dashboard" },
  { label: "Socratic Solver",icon: "brain",   href: "/solver"    },
  { label: "Feynman Mode",   icon: "feynman", href: "/feynman"   },
  { label: "Focus Mode",     icon: "eye",     href: "/focus"     },
  { label: "Mistake Journal",icon: "mistake", href: "/mistakes"  },
  { label: "Problem Bank",   icon: "book",    href: "/problems"  },
];

export default function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("exam")
          .eq("id", user.id)
          .single();
        const cfg = getExamConfig(profile?.exam ?? DEFAULT_EXAM_KEY);
        setUser({ ...user, _examLabel: cfg.label });
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").slice(0, 2).join(" ")
    : user?.email?.split("@")[0] ?? "User";

  const displaySub = user?._examLabel ?? "Loading...";

  const initials = displayName
    .split(" ")
    .map(w => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <div
      style={{
        width: 228,
        background: "rgba(255,255,255,0.04)",
        borderRight: `1px solid rgba(255,255,255,0.08)`,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        padding: "20px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        position: "sticky",
        top: 0,
        height: "100vh",
        flexShrink: 0,
        zIndex: 2,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => router.push("/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "10px 12px",
          marginBottom: 20,
          cursor: "pointer",
          borderRadius: 10,
          transition: "background .15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = D_ACCENT + "0D")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        {/* Logo mark — orange spark in green sidebar: intentional contrast */}
        <div
          style={{
            width: 30,
            height: 30,
            background: "linear-gradient(135deg, #E8610A, #F4874A)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#fff",
            fontWeight: 800,
            boxShadow: "0 3px 10px #E8610A30",
          }}
        >
          ✦
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: 16,
            color: D_TEXT,
            fontFamily: "var(--font-syne, inherit)",
            letterSpacing: -0.3,
          }}
        >
          EurekaAI
        </span>
      </div>

      {/* Nav section label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.2,
          color: D_MUTED,
          padding: "0 12px",
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        Navigation
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          return (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 9,
                cursor: "pointer",
                background: isActive ? D_ACCENT + "15" : "transparent",
                color: isActive ? D_ACCENT : D_MUTED,
                fontWeight: isActive ? 600 : 400,
                fontSize: 13.5,
                transition: "all .15s ease",
                borderLeft: isActive ? `2px solid ${D_ACCENT}` : "2px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = D_ACCENT + "0A";
                  e.currentTarget.style.color = D_TEXT;
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = D_MUTED;
                }
              }}
            >
              <Icon
                name={item.icon}
                color={isActive ? D_ACCENT : D_MUTED}
                size={15}
                strokeWidth={isActive ? 2 : 1.6}
              />
              {item.label}
            </div>
          );
        })}
      </div>

      {/* Profile / bottom section */}
      <div style={{ marginTop: "auto" }}>
        <div style={{ height: 1, background: D_BORDER, margin: "14px 0" }} />

        {/* User card */}
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 11,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid rgba(255,255,255,0.10)`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              background: `linear-gradient(135deg, ${D_ACCENT}, ${D_ACCENT2})`,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
              boxShadow: `0 3px 10px ${D_ACCENT}30`,
            }}
          >
            {initials || <Icon name="home" size={13} color="#fff" />}
          </div>

          <div
            onClick={() => router.push("/profile")}
            style={{
              overflow: "hidden",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: D_TEXT,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = D_ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.color = D_TEXT)}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: D_MUTED,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
            >
              {displaySub}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: 6,
              color: D_MUTED,
              display: "flex",
              alignItems: "center",
              transition: "color .15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={e => (e.currentTarget.style.color = D_MUTED)}
          >
            <Icon name="back" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
