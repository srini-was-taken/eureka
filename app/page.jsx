"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEAL, TEAL_DIM, BG, CARD, BORDER, TEXT, MUTED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";

const features = [
  { icon: "brain", title: "Socratic Solver", tag: "AI Core", desc: "Never get handed an answer. The AI adapts its depth to your exam — deep multi-step reasoning for JEE Advanced & BITSAT, sharp focused hints for Mains & NEET.", accent: TEAL },
  { icon: "feynman", title: "Feynman Explainer", tag: "AI Core", desc: "Explain a concept in your own words. The AI evaluates your understanding against your uploaded material and pinpoints exactly where you break down.", accent: "#818cf8" },
  { icon: "clock", title: "Focus Mode + Pomodoro", tag: "Deep Work", desc: "Distraction-free PDF reader with a built-in Pomodoro timer. Every session goes fullscreen automatically when you start.", accent: "#fb923c" },
  { icon: "mistake", title: "Mistake Journal", tag: "Retention", desc: "Every problem you struggle on gets logged. AI diagnoses why you got it wrong. Subjects adapt to your exam — Biology for NEET, Aptitude for BITSAT.", accent: "#f472b6" },
  { icon: "target", title: "Weak Area Tracker", tag: "Analytics", desc: "Not just 'you solved 40 problems'. Granular topic-level confidence scores that update after every AI interaction.", accent: "#34d399" },
  { icon: "cal", title: "Problem of the Day", tag: "Habit", desc: "One problem every morning from your personal weak areas. The best way to build a daily study habit before exam season.", accent: "#facc15" },
];

export default function LandingPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 60px", borderBottom: `1px solid ${BORDER}`,
        position: "sticky", top: 0, background: BG + "ee",
        backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: `linear-gradient(135deg,${TEAL},${TEAL_DIM})`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>EurekaAI</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" small onClick={() => router.push("/login")}>Log in</Btn>
          <Btn small onClick={() => router.push("/login")}>Get Started →</Btn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "100px 40px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(ellipse at center, ${TEAL}12 0%, transparent 70%)`, pointerEvents: "none" }} />
        <Badge>✦ Your AI Study Companion for Competitive Exams</Badge>
        <h1 style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.05, margin: "24px auto 0", maxWidth: 900, letterSpacing: -2 }}>
          Stop getting answers.<br />
          <span style={{ color: TEAL }}>Start building understanding.</span>
        </h1>
        <p style={{ fontSize: 19, color: MUTED, maxWidth: 580, margin: "24px auto 16px", lineHeight: 1.7 }}>
          The AI tutor that refuses to hand you the solution — until you've earned it.
          Scales from NEET and JEE Mains all the way up to JEE Advanced, where deep reasoning is everything.
        </p>
        {/* Exam badges */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {[
            { label: "JEE Advanced", note: "Deep Reasoning", color: "#818cf8" },
            { label: "JEE Mains", note: "Focused Hints", color: "#fb923c" },
            { label: "BITSAT", note: "Speed + Aptitude", color: "#34d399" },
            { label: "NEET", note: "PCB + NCERT", color: "#f472b6" },
          ].map(e => (
            <div key={e.label} style={{ display: "flex", alignItems: "center", gap: 6, background: e.color + "12", border: `1px solid ${e.color}40`, borderRadius: 20, padding: "6px 14px" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: e.color }}>{e.label}</span>
              <span style={{ fontSize: 11, color: e.color, opacity: 0.7 }}>· {e.note}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn onClick={() => router.push("/login")} style={{ fontSize: 16, padding: "15px 36px" }}>Try the Solver ✦</Btn>
          <Btn variant="ghost" onClick={() => router.push("/login")} style={{ fontSize: 16, padding: "15px 36px" }}>Feynman Mode</Btn>
        </div>

        {/* Hero mockup */}
        <div style={{ margin: "60px auto 0", maxWidth: 780, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "28px 32px", textAlign: "left", boxShadow: `0 0 80px ${TEAL}12` }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 12, marginBottom: 8 }}>PROBLEM</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT }}>A block of mass m is placed on a rough inclined plane at angle θ. Find the minimum force required to prevent sliding...</p>
            </div>
            <div style={{ width: 1, background: BORDER }} />
            <div style={{ flex: 1.2 }}>
              <div style={{ color: TEAL, fontSize: 12, marginBottom: 8 }}>✦ SOCRATIC TUTOR</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT }}>Good start! Before we apply any formula — tell me, how many forces are acting on this block right now, and in what directions?</p>
              <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Normal force", "Friction", "Weight", "Applied"].map(t => (
                  <span key={t} style={{ background: TEAL + "15", color: TEAL, border: `1px solid ${TEAL}30`, borderRadius: 6, padding: "3px 9px", fontSize: 12 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div style={{ padding: "60px 60px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Badge>Everything you need</Badge>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginTop: 16, letterSpacing: -1 }}>Built around how you actually learn</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push("/login")}
              style={{
                background: CARD, border: `1px solid ${hovered === i ? f.accent + "55" : BORDER}`,
                borderRadius: 16, padding: "28px 24px", cursor: "pointer",
                transition: "all .2s", transform: hovered === i ? "translateY(-3px)" : "none",
                boxShadow: hovered === i ? `0 8px 32px ${f.accent}18` : "none",
              }}
            >
              <div style={{ width: 44, height: 44, background: f.accent + "18", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>
                <Icon name={f.icon} color={f.accent} size={22} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</span>
                <span style={{ background: f.accent + "18", color: f.accent, borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>{f.tag}</span>
              </div>
              <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              {(i === 0 || i === 1) && <div style={{ marginTop: 16, color: f.accent, fontSize: 13, fontWeight: 600 }}>Try it →</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "60px 40px 100px" }}>
        <div style={{ background: `linear-gradient(135deg, ${TEAL}18, #818cf818)`, border: `1px solid ${TEAL}30`, borderRadius: 24, padding: "60px 40px", maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, marginBottom: 16, letterSpacing: -1 }}>Calibrated to your exam. From day one.</h2>
          <p style={{ color: MUTED, fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
            JEE Advanced demands the deepest conceptual reasoning of any entrance exam in the world — EurekaAI matches that with enhanced AI models and Socratic depth.
            Preparing for Mains, BITSAT, or NEET? The same system adapts — switching subjects, adjusting hint style, and tuning difficulty to your target.
          </p>
          <Btn onClick={() => router.push("/login")} style={{ fontSize: 16, padding: "15px 40px" }}>Start for free ✦</Btn>
        </div>
      </div>
    </div>
  );
}
