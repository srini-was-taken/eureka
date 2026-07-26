"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  D_BG, D_SURFACE, D_BORDER, D_TEXT, D_MUTED, D_ACCENT, D_ACCENT2, D_CARD2
} from "@/lib/theme";
import Sidebar from "@/components/layout/Sidebar";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

const quickActions = [
  { label: "Start Focus Session",  sub: "Upload a PDF and dive in",    icon: "eye",     color: D_ACCENT,   href: "/focus"    },
  { label: "Feynman a Concept",    sub: "Test your understanding",      icon: "feynman", color: "#E8C98A",  href: "/feynman"  },
  { label: "Review Mistakes",      sub: "Log and diagnose errors",      icon: "mistake", color: "#F87171",  href: "/mistakes" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getDaysUntil(targetDate) {
  const diff = targetDate - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getExamSubtitle(exam) {
  if (!exam) return "Keep learning";
  const map = {
    jee_adv:   { label: "JEE Advanced", date: "2026-05-18" },
    jee_mains: { label: "JEE Mains",    date: "2026-04-05" },
    bitsat:    { label: "BITSAT",        date: "2026-05-25" },
    neet:      { label: "NEET 2026",     date: "2026-05-03" },
  };
  const found = map[exam];
  if (!found) return "Keep learning";
  return `${found.label} · ${getDaysUntil(new Date(found.date))} days left`;
}

export default function DashboardPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName]                   = useState("...");
  const [examSubtitle, setExamSubtitle]             = useState("");
  const [solverCount, setSolverCount]               = useState(null);
  const [feynmanAvg, setFeynmanAvg]                 = useState(null);
  const [weakTopics, setWeakTopics]                 = useState([]);
  const [unresolvedMistakes, setUnresolvedMistakes] = useState(null);
  const [dailyProblem, setDailyProblem]             = useState(null);
  const [dailyProblemLoaded, setDailyProblemLoaded] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [profileRes, solverRes, feynmanRes, mistakesRes, problemsRes] = await Promise.all([
        supabase.from("profiles").select("name, exam").eq("id", user.id).single(),
        supabase.from("solver_sessions").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("feynman_attempts").select("score, gaps").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("mistakes").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "unresolved"),
        supabase.from("problem_attempts").select("id, title, subject, difficulty, statement").eq("user_id", user.id),
      ]);

      const profile  = profileRes.data;
      const fullName = profile?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
      setFirstName(fullName.split(" ")[0]);
      setExamSubtitle(getExamSubtitle(profile?.exam));
      setSolverCount(solverRes.count ?? 0);

      const attempts = feynmanRes.data || [];
      if (attempts.length > 0) {
        const avg = Math.round(attempts.reduce((s, a) => s + (a.score || 0), 0) / attempts.length);
        setFeynmanAvg(avg);
        const gapCount = {};
        attempts.forEach(a => (a.gaps || []).forEach(g => {
          const k = g.slice(0, 48);
          gapCount[k] = (gapCount[k] || 0) + 1;
        }));
        setWeakTopics(
          Object.entries(gapCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({ name, score: Math.max(10, Math.min(55, 55 - count * 8)) }))
        );
      }

      setUnresolvedMistakes(mistakesRes.count ?? 0);
      const allP = problemsRes.data || [];
      if (allP.length > 0) setDailyProblem(allP[Math.floor(Math.random() * allP.length)]);
      setDailyProblemLoaded(true);
    }
    loadDashboard();
  }, []);

  const stats = [
    { label: "Solver Sessions", val: solverCount !== null ? String(solverCount) : "—", unit: "total",        icon: "brain",   color: D_ACCENT  },
    { label: "Feynman Avg",     val: feynmanAvg  !== null ? String(feynmanAvg)  : "—", unit: "score / 100",  icon: "feynman", color: "#E8C98A" },
    { label: "Open Mistakes",   val: unresolvedMistakes !== null ? String(unresolvedMistakes) : "—", unit: "unresolved", icon: "mistake", color: "#F87171" },
    { label: "Focus Hours",     val: "—",                                                unit: "coming soon",  icon: "clock",   color: D_ACCENT2 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: D_BG, color: D_TEXT, display: "flex", position: "relative", overflow: "hidden" }}>

      {/* Subtle ambient shimmer — neutral, not green */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "20%", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(255,255,255,0.025) 0%, transparent 60%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "0", right: "5%", width: 400, height: 400, background: "radial-gradient(ellipse, rgba(74,222,128,0.04) 0%, transparent 65%)", borderRadius: "50%" }} />
      </div>

      <Sidebar />

      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto", maxWidth: 1100, position: "relative", zIndex: 1 }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 36,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                margin: 0,
                letterSpacing: -0.6,
                fontFamily: "var(--font-syne, inherit)",
                color: D_TEXT,
              }}
            >
              {getGreeting()},{" "}
              <span style={{ color: D_ACCENT }}>{firstName}</span>
            </h1>
            <p style={{ color: D_MUTED, margin: "5px 0 0", fontSize: 13.5 }}>
              {examSubtitle ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: D_ACCENT + "12",
                    color: D_ACCENT,
                    border: `1px solid ${D_ACCENT}25`,
                    borderRadius: 20,
                    padding: "3px 11px",
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  ⏳ {examSubtitle}
                </span>
              ) : (
                <span style={{ opacity: 0.5 }}>Loading...</span>
              )}
            </p>
          </div>
          <Btn
            context="dashboard"
            small
            onClick={() => router.push("/solver")}
            style={{ borderRadius: 10 }}
          >
            Solve with AI ✦
          </Btn>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: D_SURFACE,
                border: `1px solid ${D_BORDER}`,
                borderRadius: 16,
                padding: "20px 22px",
                borderTop: `3px solid ${s.color}50`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      color: D_MUTED,
                      fontSize: 11,
                      marginBottom: 10,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: s.color,
                      fontFamily: "var(--font-syne, inherit)",
                    }}
                  >
                    {s.val}
                  </div>
                  <div style={{ color: D_MUTED, fontSize: 11.5, marginTop: 5 }}>{s.unit}</div>
                </div>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    background: s.color + "15",
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={s.icon} color={s.color} size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Problem of Day + Weak Areas ──────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          {/* Problem of the Day */}
          <div
            style={{
              background: D_SURFACE,
              border: `1px solid ${D_BORDER}`,
              borderRadius: 18,
              padding: 28,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
              borderLeft: `3px solid ${D_ACCENT}60`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="target" color={D_ACCENT} size={15} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: D_TEXT,
                    fontFamily: "var(--font-syne, inherit)",
                  }}
                >
                  Problem of the Day
                </span>
              </div>
              {dailyProblem && (
                <Badge context="dashboard" color={D_ACCENT}>
                  {dailyProblem.subject || "Problem"} · {dailyProblem.difficulty || ""}
                </Badge>
              )}
            </div>

            {!dailyProblemLoaded ? (
              <p style={{ color: D_MUTED, fontSize: 13.5 }}>Loading...</p>
            ) : dailyProblem ? (
              <>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.8,
                    color: D_TEXT,
                    marginBottom: 20,
                    fontFamily: "var(--font-mono, monospace)",
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  {dailyProblem.title && (
                    <strong style={{ display: "block", marginBottom: 6, color: D_TEXT }}>
                      {dailyProblem.title}
                    </strong>
                  )}
                  {dailyProblem.statement?.slice(0, 280)}
                  {dailyProblem.statement?.length > 280 ? "..." : ""}
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn
                    context="dashboard"
                    small
                    onClick={() =>
                      router.push(`/solver?problemText=${encodeURIComponent(dailyProblem.statement)}`)
                    }
                  >
                    Solve with AI Tutor
                  </Btn>
                  <Btn
                    context="dashboard"
                    variant="ghost"
                    small
                    onClick={() => router.push("/problems")}
                  >
                    View Bank
                  </Btn>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13.5, color: D_MUTED, lineHeight: 1.75, marginBottom: 18 }}>
                  No problems in your bank yet. Add some to see daily challenges here.
                </p>
                <Btn
                  context="dashboard"
                  small
                  onClick={() => router.push("/problems")}
                >
                  Go to Problem Bank
                </Btn>
              </>
            )}
          </div>

          {/* Weak Areas */}
          <div
            style={{
              background: D_SURFACE,
              border: `1px solid ${D_BORDER}`,
              borderRadius: 18,
              padding: 24,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Icon name="zap" color="#818cf8" size={15} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14.5,
                  color: D_TEXT,
                  fontFamily: "var(--font-syne, inherit)",
                }}
              >
                Weak Areas
              </span>
            </div>

            {weakTopics.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <Icon name="feynman" color={D_MUTED} size={28} />
                <p style={{ color: D_MUTED, fontSize: 12.5, lineHeight: 1.65, marginTop: 10 }}>
                  Complete a few Feynman sessions — your weak spots will appear here.
                </p>
                <Btn
                  context="dashboard"
                  variant="outline"
                  small
                  style={{ marginTop: 14 }}
                  onClick={() => router.push("/feynman")}
                >
                  Start Feynman →
                </Btn>
              </div>
            ) : (
              <>
                {weakTopics.map((t, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: D_TEXT }}>
                        {t.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          color: t.score < 35 ? "#f87171" : D_ACCENT,
                          fontWeight: 700,
                        }}
                      >
                        {t.score}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: D_CARD2,
                        borderRadius: 99,
                        height: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${t.score}%`,
                          background: t.score < 35 ? "#f87171" : D_ACCENT,
                          borderRadius: 99,
                          height: "100%",
                          transition: "width .8s cubic-bezier(.16,1,.3,1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Btn
                  context="dashboard"
                  variant="outline"
                  small
                  style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
                  onClick={() => router.push("/feynman")}
                >
                  See all attempts →
                </Btn>
              </>
            )}
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {quickActions.map((a, i) => (
            <div
              key={i}
              onClick={() => router.push(a.href)}
              style={{
                background: D_SURFACE,
                border: `1px solid ${D_BORDER}`,
                borderRadius: 16,
                padding: "18px 20px",
                cursor: "pointer",
                display: "flex",
                gap: 14,
                alignItems: "center",
                transition: "all .2s ease",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = a.color + "60";
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${a.color}18, inset 0 1px 0 rgba(255,255,255,0.10)`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = D_BORDER;
                e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  background: a.color + "15",
                  borderRadius: 11,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={a.icon} color={a.color} size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3, color: D_TEXT }}>
                  {a.label}
                </div>
                <div style={{ color: D_MUTED, fontSize: 11.5 }}>{a.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
