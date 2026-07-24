"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Sidebar from "@/components/layout/Sidebar";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

const weakTopics = [
  { name: "Rotational Dynamics", score: 28, subject: "Physics" },
  { name: "Electrochemistry", score: 34, subject: "Chemistry" },
  { name: "Integration by Parts", score: 41, subject: "Maths" },
  { name: "Thermodynamics", score: 45, subject: "Physics" },
];

const stats = [
  { label: "Study Streak", val: "12", unit: "days", icon: "streak", color: "#fb923c" },
  { label: "Problems Solved", val: "247", unit: "total", icon: "check", color: TEAL },
  { label: "Focus Hours", val: "38", unit: "this week", icon: "clock", color: "#818cf8" },
  { label: "Avg Hint Rate", val: "1.4", unit: "hints/prob", icon: "hint", color: "#f472b6" },
];

const quickActions = [
  { label: "Start Focus Session", sub: "Upload a PDF and dive in", icon: "eye", color: TEAL, href: "/focus" },
  { label: "Feynman a Concept", sub: "Test your understanding", icon: "feynman", color: "#818cf8", href: "/feynman" },
  { label: "Review Mistakes", sub: "7 unresolved · 3 due today", icon: "mistake", color: "#f472b6", href: "/mistakes" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [firstName, setFirstName] = useState("Arjun");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Arjun";
      setFirstName(fullName.split(" ")[0]);
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
              {getGreeting()}, {firstName} ☀️
            </h1>
            <p style={{ color: MUTED, margin: "4px 0 0", fontSize: 14 }}>
              Your JEE Advanced target: <span style={{ color: TEAL }}>218 days away</span>
            </p>
          </div>
          <Btn small onClick={() => router.push("/solver")}>Today's Problem ✦</Btn>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <Card key={i} style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: MUTED, fontSize: 12, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: s.color }}>{s.val}</div>
                  <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>{s.unit}</div>
                </div>
                <div style={{ width: 36, height: 36, background: s.color + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  <Icon name={s.icon} color={s.color} size={18} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Problem of day + weak areas */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 20 }}>
          <Card glow style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Problem of the Day</span>
              </div>
              <Badge>Physics · Hard</Badge>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#cdd0d8", marginBottom: 20 }}>
              Two particles of masses m₁ and m₂ are connected by a string over a frictionless pulley on an inclined plane. If m₁ slides down at constant velocity, find the coefficient of kinetic friction between m₂ and the surface...
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn small onClick={() => router.push("/solver")}>Solve with AI Tutor ✦</Btn>
              <Btn variant="ghost" small>Skip</Btn>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>⚡</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Weak Areas</span>
            </div>
            {weakTopics.map((t, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</span>
                  <span style={{ fontSize: 12, color: t.score < 35 ? "#f87171" : "#fb923c", fontWeight: 700 }}>{t.score}%</span>
                </div>
                <div style={{ background: CARD2, borderRadius: 99, height: 5 }}>
                  <div style={{ width: `${t.score}%`, background: t.score < 35 ? "#f87171" : "#fb923c", borderRadius: 99, height: "100%", transition: "width .8s" }} />
                </div>
              </div>
            ))}
            <Btn variant="outline" small style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>See full report →</Btn>
          </Card>
        </div>

        {/* Quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {quickActions.map((a, i) => (
            <div key={i} onClick={() => router.push(a.href)}
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 20, cursor: "pointer", display: "flex", gap: 14, alignItems: "center", transition: "all .15s" }}>
              <div style={{ width: 44, height: 44, background: a.color + "18", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                <Icon name={a.icon} color={a.color} size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{a.label}</div>
                <div style={{ color: MUTED, fontSize: 12 }}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
