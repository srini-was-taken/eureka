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

const quickActions = [
  { label: "Start Focus Session", sub: "Upload a PDF and dive in", icon: "eye", color: TEAL, href: "/focus" },
  { label: "Feynman a Concept", sub: "Test your understanding", icon: "feynman", color: "#818cf8", href: "/feynman" },
  { label: "Review Mistakes", sub: "Log and diagnose errors", icon: "mistake", color: "#f472b6", href: "/mistakes" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDaysUntil(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getExamSubtitle(exam) {
  if (!exam || exam === "None / General Use") return "Keep learning";
  if (exam === "JEE Advanced") {
    const days = getDaysUntil(new Date("2026-05-18"));
    return `JEE Advanced · ${days} days left`;
  }
  if (exam === "JEE Mains") {
    const days = getDaysUntil(new Date("2026-04-05"));
    return `JEE Mains · ${days} days left`;
  }
  if (exam === "NEET") {
    const days = getDaysUntil(new Date("2026-05-03"));
    return `NEET 2026 · ${days} days left`;
  }
  return "Keep learning";
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("...");
  const [examSubtitle, setExamSubtitle] = useState("");
  const [solverCount, setSolverCount] = useState(null);
  const [feynmanAvg, setFeynmanAvg] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [unresolvedMistakes, setUnresolvedMistakes] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Load in parallel
      const [profileRes, solverRes, feynmanRes, mistakesRes] = await Promise.all([
        supabase.from("profiles").select("name, exam").eq("id", user.id).single(),
        supabase.from("solver_sessions").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("feynman_attempts").select("score, gaps").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("mistakes").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "unresolved"),
      ]);

      // Profile
      const profile = profileRes.data;
      const fullName = profile?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
      setFirstName(fullName.split(" ")[0]);
      setExamSubtitle(getExamSubtitle(profile?.exam));

      // Solver count
      setSolverCount(solverRes.count ?? 0);

      // Feynman avg + weak topics
      const attempts = feynmanRes.data || [];
      if (attempts.length > 0) {
        const avg = Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length);
        setFeynmanAvg(avg);

        // Flatten all gaps into a topic frequency map
        const gapCount = {};
        attempts.forEach(a => {
          (a.gaps || []).forEach(gap => {
            const key = gap.slice(0, 48); // normalise length
            gapCount[key] = (gapCount[key] || 0) + 1;
          });
        });
        const sorted = Object.entries(gapCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, count]) => ({ name, score: Math.max(10, Math.min(55, 55 - count * 8)) }));
        setWeakTopics(sorted);
      }

      // Unresolved mistakes
      setUnresolvedMistakes(mistakesRes.count ?? 0);
    }
    loadDashboard();
  }, []);

  const stats = [
    { label: "Solver Sessions", val: solverCount !== null ? String(solverCount) : "—", unit: "total", icon: "brain", color: TEAL },
    { label: "Feynman Avg", val: feynmanAvg !== null ? String(feynmanAvg) : "—", unit: "score / 100", icon: "feynman", color: "#818cf8" },
    { label: "Open Mistakes", val: unresolvedMistakes !== null ? String(unresolvedMistakes) : "—", unit: "unresolved", icon: "mistake", color: "#f472b6" },
    { label: "Focus Hours", val: "—", unit: "session data soon", icon: "clock", color: "#fb923c" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
              {getGreeting()}, {firstName}
            </h1>
            <p style={{ color: MUTED, margin: "4px 0 0", fontSize: 14 }}>
              {examSubtitle ? (
                <span style={{ color: TEAL }}>{examSubtitle}</span>
              ) : (
                <span style={{ opacity: 0.5 }}>Loading...</span>
              )}
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
                <Icon name="target" color={TEAL} size={16} />
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
              <Icon name="zap" color="#818cf8" size={16} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Weak Areas</span>
            </div>
            {weakTopics.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <Icon name="feynman" color={MUTED} size={26} />
                </div>
                <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.6 }}>
                  Complete a few Feynman sessions — your weak spots will appear here.
                </p>
                <Btn variant="outline" small style={{ marginTop: 12 }} onClick={() => router.push("/feynman")}>Start Feynman →</Btn>
              </div>
            ) : (
              <>
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
                <Btn variant="outline" small style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={() => router.push("/feynman")}>See all attempts →</Btn>
              </>
            )}
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
