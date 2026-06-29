"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Btn from "@/components/ui/Btn";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";

// ─── Scroll-reveal hook ──────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ─── Token shorthand ─────────────────────────────────────────────────────────
const C = {
  bg:      "#FAFAF8",
  surface: "#FFFFFF",
  border:  "#EAE5DC",
  text:    "#1A1714",
  muted:   "#7A736B",
  accent:  "#E8610A",
  accent2: "#F4874A",
};

// ─── Feature data ────────────────────────────────────────────────────────────
const features = [
  {
    icon: "brain",
    tag: "CORE",
    title: "Socratic Solver",
    italicWord: "Earns",
    desc: "The AI never hands you the answer. It leads you to it — question by question. Calibrated from NEET basics to JEE Advanced's deepest reasoning.",
    accent: "#E8610A",
    stat: "6×",
    statLabel: "deeper understanding vs. showing answers",
  },
  {
    icon: "feynman",
    tag: "CORE",
    title: "Feynman Mode",
    italicWord: "Exposes",
    desc: "Explain the concept in your own words. The AI grades your understanding against your material and shows you exactly where you fall apart.",
    accent: "#818cf8",
    stat: "89%",
    statLabel: "of students find gaps they didn't know existed",
  },
  {
    icon: "eye",
    tag: "DEEP WORK",
    title: "Focus Mode",
    italicWord: "Immerses",
    desc: "A distraction-free PDF reader that goes fullscreen the moment you hit start. Built-in Pomodoro keeps your sessions sharp, not endless.",
    accent: "#4CAF72",
    stat: "∞",
    statLabel: "minutes of uninterrupted deep work",
  },
  {
    icon: "mistake",
    tag: "RETENTION",
    title: "Mistake Journal",
    italicWord: "Diagnoses",
    desc: "Every stumble gets logged. The AI tells you not just what went wrong — but why your thinking broke down. Subjects adapt to your exam.",
    accent: "#f472b6",
    stat: "3×",
    statLabel: "better retention vs. passive review",
  },
];

const exams = [
  { label: "JEE Advanced", note: "Deep Reasoning", color: "#818cf8" },
  { label: "JEE Mains",    note: "Focused Hints",  color: "#E8610A" },
  { label: "BITSAT",       note: "Speed + Aptitude", color: "#4CAF72" },
  { label: "NEET",         note: "PCB + NCERT",    color: "#f472b6" },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, overflowX: "hidden" }}>

      {/* ─── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 64px",
          height: 64,
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: scrolled ? "rgba(250,250,248,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #E8610A, #F4874A)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              color: "#fff",
              fontWeight: 800,
              boxShadow: "0 3px 12px #E8610A35",
            }}
          >
            ✦
          </div>
          <span
            style={{
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: -0.4,
              fontFamily: "var(--font-syne, inherit)",
              color: C.text,
            }}
          >
            EurekaAI
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn variant="ghost" context="landing" small onClick={() => router.push("/login")}>
            Log in
          </Btn>
          <Btn context="landing" small onClick={() => router.push("/login")}>
            Get started →
          </Btn>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "32px 64px 48px",
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1.1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        {/* Left col — headline */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              padding: "6px 14px 6px 8px",
              background: "#fff",
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              boxShadow: "0 1px 4px #1A17140C",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E8610A, #F4874A)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#fff",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ✦
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.muted,
                letterSpacing: 0.2,
              }}
            >
              The anti-cheat study tool
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(44px, 5.5vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontFamily: "var(--font-syne, inherit)",
              marginBottom: 8,
              color: C.text,
            }}
          >
            You{" "}
            <em
              style={{
                fontFamily: "var(--font-playfair, inherit)",
                fontStyle: "italic",
                fontWeight: 700,
                color: C.accent,
              }}
            >
              think
            </em>{" "}
            you<br />
            understand.
          </h1>
          <h1
            style={{
              fontSize: "clamp(44px, 5.5vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -2,
              fontFamily: "var(--font-syne, inherit)",
              color: C.muted,
              marginBottom: 28,
            }}
          >
            We prove if<br />you actually do.
          </h1>

          <p
            style={{
              fontSize: 17,
              color: C.muted,
              lineHeight: 1.75,
              maxWidth: 460,
              marginBottom: 28,
              fontWeight: 400,
            }}
          >
            The AI tutor built for Indian competitive exams — Socratic, not
            spoon-feeding. Scales from NEET to JEE Advanced without blinking.
          </p>



          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              context="landing"
              onClick={() => router.push("/login")}
              style={{ fontSize: 15, padding: "14px 30px" }}
            >
              Try the Solver ✦
            </Btn>
            <Btn
              context="landing"
              variant="ghost"
              onClick={() => router.push("/login")}
              style={{ fontSize: 15, padding: "14px 30px" }}
            >
              Feynman Mode
            </Btn>
          </div>
        </div>

        {/* Right col — mockup card, centered */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          className="glass-warm"
          style={{
            borderRadius: 20,
            padding: "28px 28px",
            position: "relative",
            width: "100%",
            maxWidth: 440,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 7, marginBottom: 18 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(c => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
            ))}
          </div>

          {/* Problem label */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: C.muted,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Problem
          </div>

          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.75,
              color: C.text,
              marginBottom: 18,
              fontFamily: "var(--font-mono, monospace)",
              background: "#F5F3EF",
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            A block of mass m on a rough inclined plane at angle θ — find the minimum force
            to prevent sliding.
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: C.border, margin: "0 0 16px" }} />

          {/* AI response */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: C.accent,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            ✦ Socratic Tutor
          </div>

          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.75,
              color: C.text,
              marginBottom: 14,
            }}
          >
            Good start. Before we touch a formula — how many forces are acting on this block
            right now, and in which directions?
          </p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Normal force ↑", "Friction ←", "Weight ↓", "Applied →"].map(t => (
              <span
                key={t}
                style={{
                  background: C.accent + "12",
                  color: C.accent,
                  border: `1px solid ${C.accent}28`,
                  borderRadius: 6,
                  padding: "3px 9px",
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Orange glow blob behind card */}
          <div
            style={{
              position: "absolute",
              bottom: -40,
              right: -40,
              width: 200,
              height: 200,
              background: "radial-gradient(ellipse, #E8610A18 0%, transparent 70%)",
              pointerEvents: "none",
              borderRadius: "50%",
            }}
          />
        </div>
        </div>
      </section>



      {/* ─── Features — alternating narrative layout ─────────────────────── */}
      <section style={{ padding: "80px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 72 }}>
          <Badge context="landing" style={{ marginBottom: 16 }}>
            How it works
          </Badge>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.1,
              fontFamily: "var(--font-syne, inherit)",
              color: C.text,
              marginTop: 12,
            }}
          >
            Built around how you{" "}
            <em
              style={{
                fontFamily: "var(--font-playfair, inherit)",
                fontStyle: "italic",
                color: C.accent,
              }}
            >
              actually
            </em>{" "}
            learn.
          </h2>
          <p style={{ color: C.muted, maxWidth: 480, margin: "16px auto 0", fontSize: 16, lineHeight: 1.7 }}>
            Not features. A complete study system — Socratic, reflective, focused.
          </p>
        </div>

        {/* Feature cards — alternating L/R */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {features.map((f, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${(i % 3) + 1} hover-lift`}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              onClick={() => router.push("/login")}
              style={{
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "1fr 1.6fr" : "1.6fr 1fr",
                gap: 40,
                alignItems: "center",
                background: C.surface,
                border: `1px solid ${hoveredFeature === i ? f.accent + "45" : C.border}`,
                borderRadius: 20,
                padding: "36px 40px",
                cursor: "pointer",
                boxShadow: hoveredFeature === i
                  ? `0 12px 40px ${f.accent}14, 0 2px 8px #1A171408`
                  : "0 2px 8px #1A171406",
                transition: "all 0.25s ease",
              }}
            >
              {/* Stat side */}
              <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: f.accent + "15",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Icon name={f.icon} color={f.accent} size={24} />
                </div>

                <Badge color={f.accent} style={{ marginBottom: 14 }}>
                  {f.tag}
                </Badge>

                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    fontFamily: "var(--font-syne, inherit)",
                    color: C.text,
                    marginBottom: 10,
                  }}
                >
                  {f.title}
                </h3>

                <p style={{ color: C.muted, lineHeight: 1.75, fontSize: 15, marginBottom: 20 }}>
                  {f.desc}
                </p>

                <span style={{ color: f.accent, fontWeight: 700, fontSize: 13 }}>
                  Try it →
                </span>
              </div>

              {/* Stat callout side */}
              <div
                style={{
                  order: i % 2 === 0 ? 2 : 1,
                  background: f.accent + "0A",
                  border: `1px solid ${f.accent}20`,
                  borderRadius: 16,
                  padding: "36px 32px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(52px, 6vw, 72px)",
                    fontWeight: 900,
                    color: f.accent,
                    lineHeight: 1,
                    fontFamily: "var(--font-syne, inherit)",
                    marginBottom: 10,
                  }}
                >
                  {f.stat}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: C.muted,
                    lineHeight: 1.5,
                    maxWidth: 160,
                    margin: "0 auto",
                  }}
                >
                  {f.statLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="reveal" style={{ padding: "60px 64px 100px" }}>
        <div
          style={{
            background: C.accent,
            borderRadius: 24,
            padding: "64px 56px",
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 48,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background texture layer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 80% 50%, #FFFFFF12 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: -60,
              width: 280,
              height: 280,
              background: "radial-gradient(ellipse, #00000018, transparent 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -1,
                color: "#fff",
                fontFamily: "var(--font-syne, inherit)",
                marginBottom: 12,
              }}
            >
              Calibrated to your exam.<br />
              <em style={{ fontFamily: "var(--font-playfair, inherit)", fontStyle: "italic", fontWeight: 400 }}>
                From day one.
              </em>
            </h2>
            <p
              style={{
                fontSize: 15.5,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.7,
                maxWidth: 440,
              }}
            >
              JEE Advanced. JEE Mains. BITSAT. NEET. One system — infinite depth.
              The AI adjusts its reasoning mode, subjects, and depth to match your target.
            </p>
          </div>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <Btn
              onClick={() => router.push("/login")}
              style={{
                background: "#fff",
                color: C.accent,
                fontSize: 15,
                padding: "15px 32px",
                fontWeight: 800,
                boxShadow: "0 8px 24px #00000020",
              }}
            >
              Start for free ✦
            </Btn>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "24px 64px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 22,
              height: 22,
              background: "linear-gradient(135deg, #E8610A, #F4874A)",
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              color: "#fff",
              fontWeight: 800,
            }}
          >
            ✦
          </div>
          <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "var(--font-syne, inherit)" }}>
            EurekaAI
          </span>
          <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>
            · Built for Indian competitive exam aspirants
          </span>
        </div>
        <span style={{ color: C.muted, fontSize: 12 }}>
          © {new Date().getFullYear()} EurekaAI
        </span>
      </footer>
    </div>
  );
}
