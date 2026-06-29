"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const T = {
  bg:      "#F5F0EB",   // warm cream
  bg2:     "#EDE8E2",   // slightly deeper cream for alternating sections
  surface: "#FFFFFF",
  border:  "#DDD8D2",
  text:    "#0F0E0D",
  muted:   "#7A7570",
  accent:  "#E8610A",   // orange
  accentL: "#FDF0E8",   // orange tint bg
  accentB: "#FBDECA",   // orange light border
};

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const TwitterX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const Github = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FaqItem({ q, a, open, onToggle }) {
  const ref = useRef(null);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "22px 0",
          background: "none", border: "none", cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontSize: 17, fontWeight: 600, color: T.text, lineHeight: 1.4, paddingRight: 32 }}>{q}</span>
        <span style={{
          color: T.muted, flexShrink: 0, transition: "transform .3s ease",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          display: "flex",
        }}>
          <ChevronDown />
        </span>
      </button>
      <div style={{ overflow: "hidden", transition: "max-height .35s cubic-bezier(.16,1,.3,1)", maxHeight: open ? (ref.current?.scrollHeight || 400) + "px" : "0" }}>
        <div ref={ref} style={{ paddingBottom: 22, fontSize: 15.5, color: T.muted, lineHeight: 1.8 }}>{a}</div>
      </div>
    </div>
  );
}

// ─── Socratic sample card ─────────────────────────────────────────────────────
function SocraticCard({ style = {} }) {
  return (
    <div style={{
      background: T.surface,
      borderRadius: 18,
      padding: "24px 26px",
      boxShadow: "0 2px 8px rgba(15,14,13,.06), 0 12px 48px rgba(15,14,13,.10)",
      border: `1px solid ${T.border}`,
      maxWidth: 460,
      ...style,
    }}>
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 7, marginBottom: 20 }}>
        {["#FF5F57","#FEBC2E","#28C840"].map(c => (
          <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
        ))}
      </div>

      {/* Problem */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.muted, textTransform: "uppercase", marginBottom: 10 }}>Problem</p>
      <div style={{ background: "#F7F4F0", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, lineHeight: 1.75, color: T.text, border: `1px solid ${T.border}` }}>
        A block of mass <em>m</em> on a rough inclined plane at angle θ — find the minimum force to prevent sliding.
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: T.border, margin: "0 0 16px" }} />

      {/* Tutor response */}
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.accent, textTransform: "uppercase", marginBottom: 10 }}>✦ Socratic Tutor</p>
      <p style={{ fontSize: 13.5, lineHeight: 1.8, color: T.text, marginBottom: 14 }}>
        Good start. Before we touch a formula — how many forces are acting on this block right now, and in which directions?
      </p>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {["Normal force ↑","Friction ←","Weight ↓","Applied →"].map(t => (
          <span key={t} style={{ background: T.accentL, color: T.accent, border: `1px solid ${T.accentB}`, borderRadius: 6, padding: "4px 10px", fontSize: 11.5, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Mock phone frame ─────────────────────────────────────────────────────────
function PhoneFrame({ label, children, style = {} }) {
  return (
    <div style={{
      width: 240, flexShrink: 0,
      background: "#0F0E0D",
      borderRadius: 36,
      padding: "10px 8px",
      boxShadow: "0 24px 64px rgba(15,14,13,.22)",
      ...style,
    }}>
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <div style={{ width: 80, height: 6, background: "#1C1B1A", borderRadius: 3 }} />
      </div>
      <div style={{ borderRadius: 28, overflow: "hidden", background: T.bg, minHeight: 440, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        {children || (
          <>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>✦</span>
            </div>
            <p style={{ fontSize: 11, color: T.muted, textAlign: "center", lineHeight: 1.5, maxWidth: 160 }}>{label}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Screenshot placeholder ───────────────────────────────────────────────────
function ScreenPlaceholder({ label, aspect = "16/9", style = {} }) {
  return (
    <div style={{
      width: "100%",
      aspectRatio: aspect,
      background: T.bg2,
      borderRadius: 14,
      border: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      boxShadow: "0 2px 12px rgba(15,14,13,.06)",
      ...style,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: T.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
      </div>
      <p style={{ fontSize: 11, color: T.muted, textAlign: "center", maxWidth: 180, lineHeight: 1.5 }}>{label}</p>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { n: "87%",  body: "of JEE aspirants who fail say they understood the concept before the exam." },
  { n: "2.4×", body: "more likely to retain knowledge through active recall vs passive reading.", cite: "Karpicke & Roediger, 2008 — Science" },
  { n: "0",    body: "marks awarded for almost-correct reasoning in JEE Advanced. Partial is nothing." },
];

const features = [
  {
    tag: "Socratic Solver",
    heading: "Questions that force you to think.",
    body: "Upload any JEE Advanced problem. EurekaAI asks targeted questions that expose exactly where your reasoning breaks down — based on decades of research showing that generative struggle produces deeper encoding than passive review.",
    cite: "Chi et al., 2001 — Learning from Human Tutoring",
    imgLabel: "[Screenshot — Socratic Solver interface]",
    flip: false,
  },
  {
    tag: "Feynman Explainer",
    heading: "If you can't explain it simply, you don't understand it.",
    body: "Explain any concept in plain language. EurekaAI identifies gaps in your explanation and surfaces exactly what you don't know. The act of retrieval and articulation is the learning event.",
    cite: "Brown, Roediger & McDaniel — Make It Stick (2014)",
    imgLabel: "[Screenshot — Feynman Explainer interface]",
    flip: true,
  },
  {
    tag: "Mistake Journal",
    heading: "Every error is a data point, not a defeat.",
    body: "Every wrong attempt is logged, tagged by concept, and resurfaces at the right interval. The system knows which weaknesses need revisiting before they cost you on exam day.",
    cite: "Ebbinghaus Forgetting Curve — optimised spaced repetition",
    imgLabel: "[Screenshot — Mistake Journal interface]",
    flip: false,
  },
];

const steps = [
  { n: "01", title: "Pick a problem", body: "From the 20-year JEE Advanced archive, or paste any problem you're stuck on. Physics, Chemistry, Math — any chapter, any difficulty." },
  { n: "02", title: "Work through it", body: "EurekaAI questions your reasoning, not your answer. Every hint must be earned. Every step must be justified. No shortcuts." },
  { n: "03", title: "Know it cold", body: "Concepts get reinforced until they're automatic. The Mistake Journal surfaces your blind spots at precisely the right moment." },
];

const faqs = [
  { q: "Is this just another AI solver?", a: "No — and that's the entire point. EurekaAI refuses to give you the answer until you've genuinely attempted the problem. It asks Socratic questions that expose where your reasoning breaks down. You'll never see a direct solution until you've earned it." },
  { q: "What topics does it cover?", a: "Full JEE Advanced syllabus across Physics, Chemistry, and Mathematics — from mechanics and electrostatics to organic chemistry and integral calculus. The archive covers 20+ years of past JEE Advanced papers with structured walkthrough explanations." },
  { q: "How is this different from Doubtnut or PhysicsWallah AI?", a: "Doubtnut and PhysicsWallah show you the solution. EurekaAI doesn't. Passive reading of solutions produces shallow encoding. Active retrieval through generative struggle — what EurekaAI forces — produces knowledge that lasts through exam day." },
  { q: "Is it free?", a: "Yes, EurekaAI is free to start. The core Socratic Solver and Feynman Explainer are available without payment. Advanced features — the full 20-year archive, Concept Graph, and adaptive mistake surfacing — are part of the full plan." },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, overflowX: "hidden", fontFamily: "var(--font-dm-sans, system-ui, sans-serif)" }}>

      {/* ─── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(245,240,235,.90)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        transition: "all .3s ease",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 40px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>✦</span>
            </div>
            <span style={{ fontFamily: "var(--font-syne, inherit)", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em", color: T.text }}>EurekaAI</span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <a href="#features" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>Features</a>
            <a href="#how-it-works" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>How it works</a>
            <a href="#faq" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>FAQ</a>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => router.push("/login")} style={{ fontSize: 13, fontWeight: 500, color: T.muted, background: "none", border: "none", cursor: "pointer" }}>Log in</button>
            <button onClick={() => router.push("/login")} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: T.accent, border: "none", borderRadius: 10, padding: "9px 20px", cursor: "pointer" }}>
              Get started →
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "52px 40px 64px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="hero-grid">

          {/* ── Left: text ── */}
          <div>
            {/* Eyebrow */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "6px 14px 6px 8px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 999, boxShadow: "0 1px 4px rgba(15,14,13,.06)" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 9, fontWeight: 800 }}>✦</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>The anti-cheat study tool</span>
            </div>

            <h1 style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(34px, 3.8vw, 50px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.025em", color: T.text, marginBottom: 20 }}>
              Stop getting answers.<br />
              Start building{" "}
              <span style={{ color: T.accent }}>understanding.</span>
            </h1>

            <p style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.75, maxWidth: 460, marginBottom: 28, fontWeight: 400 }}>
              EurekaAI uses the Socratic method and Feynman technique — the same learning systems used by Nobel laureates — to help JEE Advanced aspirants actually understand physics, chemistry, and math.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => router.push("/login")} style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: T.accent, border: "none", borderRadius: 10, padding: "12px 28px", cursor: "pointer", boxShadow: `0 4px 16px ${T.accent}40` }}>
                Start for free ✦
              </button>
              <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 600, color: T.text, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 24px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                See how it works
              </a>
            </div>
          </div>

          {/* ── Right: two stacked postcard screenshots ── */}
          <div style={{ position: "relative", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>

            {/* Back card — Feynman snapshot, rotated slightly */}
            <div style={{
              position: "absolute",
              top: 24, left: 12,
              width: "88%",
              transform: "rotate(2.5deg)",
              background: T.surface,
              borderRadius: 16,
              border: `1px solid ${T.border}`,
              boxShadow: "0 4px 24px rgba(15,14,13,.10)",
              padding: "18px 20px",
              zIndex: 1,
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              </div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#818CF8", marginBottom: 10 }}>✦ Feynman Explainer</p>
              <div style={{ background: "#F0EFFF", borderRadius: 8, padding: "10px 12px", marginBottom: 12, border: "1px solid #C7D2FE" }}>
                <p style={{ fontSize: 11.5, color: "#3730A3", lineHeight: 1.7, fontStyle: "italic" }}>"Explain Gauss's Law like I'm 15, using only everyday objects."</p>
              </div>
              <p style={{ fontSize: 11.5, color: T.muted, lineHeight: 1.65 }}>Good attempt. You described the surface correctly — but you haven't explained <em>why</em> charge outside the surface doesn't contribute. Try again.</p>
              <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                {["Flux ∝ enclosed charge","Surface is arbitrary"].map(t => (
                  <span key={t} style={{ background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE", borderRadius: 6, padding: "3px 9px", fontSize: 10, fontWeight: 500 }}>{t}</span>
                ))}
              </div>
              <p style={{ marginTop: 16, fontSize: 10, color: T.muted, opacity: 0.7 }}>[App Screenshot — Feynman Explainer]</p>
            </div>

            {/* Front card — Socratic solver */}
            <div style={{
              position: "absolute",
              bottom: 12, right: 0,
              width: "88%",
              transform: "rotate(-1.5deg)",
              zIndex: 2,
            }}>
              <SocraticCard style={{ width: "100%", maxWidth: "100%" }} />
              <p style={{ fontSize: 10, color: T.muted, marginTop: 8, textAlign: "right", opacity: 0.7 }}>[App Screenshot — Socratic Solver]</p>
            </div>
          </div>

        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .hero-grid > div:last-child { height: 340px !important; }
          }
        `}</style>
      </section>



      {/* ─── THE PROBLEM ──────────────────────────────────────────────────────── */}
      <section style={{ background: T.bg2, padding: "64px 40px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>The problem</p>
            <h2 style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: T.text, maxWidth: 520 }}>
              Understanding and memorisation are not the same thing.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid ${T.border}` }}
            className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1}`} style={{
                padding: "48px 40px 48px 0",
                borderRight: i < 2 ? `1px solid ${T.border}` : "none",
                paddingLeft: i > 0 ? 40 : 0,
              }}>
                <div style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(44px, 5vw, 60px)", fontWeight: 700, color: T.text, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: 16 }}>{s.n}</div>
                <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, maxWidth: 280 }}>{s.body}</p>
                {s.cite && (
                  <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6, background: T.accentL, border: `1px solid ${T.accentB}`, borderRadius: 999, padding: "4px 12px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.accent }}>{s.cite}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr !important; }
            .stats-grid > div { border-right: none !important; padding-left: 0 !important; padding-right: 0 !important; border-bottom: 1px solid ${T.border}; }
          }
        `}</style>
      </section>

      {/* ─── FEATURES (alternating full-width rows) ───────────────────────────── */}
      <section id="features">
        {features.map((f, i) => (
          <div
            key={i}
            style={{ background: i % 2 === 0 ? T.bg : T.bg2, padding: "64px 40px" }}
          >
            <div style={{
              maxWidth: 1120, margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 80,
              alignItems: "center",
              direction: f.flip ? "rtl" : "ltr",
            }}
              className="feature-grid">
              {/* Text */}
              <div className={`reveal reveal-delay-1`} style={{ direction: "ltr" }}>
                <div style={{ display: "inline-block", background: T.accentL, border: `1px solid ${T.accentB}`, borderRadius: 999, padding: "4px 14px", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, letterSpacing: "0.06em", textTransform: "uppercase" }}>{f.tag}</span>
                </div>
                <h2 style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(22px, 2.4vw, 30px)", fontWeight: 700, letterSpacing: "-0.018em", lineHeight: 1.18, color: T.text, marginBottom: 16 }}>
                  {f.heading}
                </h2>
                <p style={{ fontSize: 16, color: T.muted, lineHeight: 1.8, marginBottom: 24, maxWidth: 480 }}>{f.body}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 999, padding: "6px 14px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{f.cite}</span>
                </div>
              </div>

              {/* Image */}
              <div className={`reveal reveal-delay-2`} style={{ direction: "ltr" }}>
                <ScreenPlaceholder label={f.imgLabel} aspect="4/3" />
              </div>
            </div>
          </div>
        ))}

        <style>{`
          @media (max-width: 768px) {
            .feature-grid { grid-template-columns: 1fr !important; direction: ltr !important; gap: 40px !important; }
          }
        `}</style>
      </section>

      {/* ─── ALL FEATURES GRID ────────────────────────────────────────────────── */}
      <section style={{ background: T.bg2, padding: "64px 40px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>Everything you need</p>
            <h2 style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: T.text }}>
              A complete system, not a chatbot.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: T.border }}
            className="feat-grid">
            {[
              { title: "Socratic Solver", desc: "Upload any JEE Advanced problem. Get questions, not answers. Every hint must be earned.", tag: null },
              { title: "Feynman Explainer", desc: "Explain a concept out loud or in text. Get precise feedback on every gap.", tag: null },
              { title: "Mistake Journal", desc: "Every wrong attempt logged and tagged. Resurfaces at the right time via spaced repetition.", tag: null },
              { title: "Focus Mode", desc: "Timed problem sessions. No hints unless you've genuinely attempted the problem.", tag: null },
              { title: "JEE Advanced Archive", desc: "20+ years of past papers with walkthrough explanations — not just answer keys.", tag: null },
              { title: "Concept Graph", desc: "See how topics connect across Physics, Chemistry, and Math.", tag: "Coming soon" },
            ].map((item, i) => (
              <div key={i} className={`reveal reveal-delay-${(i % 3) + 1}`} style={{ background: T.bg, padding: "36px 32px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "var(--font-syne, inherit)", fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>{item.title}</h3>
                  {item.tag && <span style={{ fontSize: 10, fontWeight: 600, color: T.muted, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 999, padding: "3px 10px", flexShrink: 0, marginLeft: 8, marginTop: 2 }}>{item.tag}</span>}
                </div>
                <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .feat-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: T.bg, padding: "64px 40px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: T.text }}>
              Three steps to knowing it cold.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid ${T.border}` }}
            className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1}`} style={{
                padding: "48px 40px 48px 0",
                borderRight: i < 2 ? `1px solid ${T.border}` : "none",
                paddingLeft: i > 0 ? 40 : 0,
              }}>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12, fontWeight: 500, color: T.muted, marginBottom: 20, letterSpacing: "0.05em" }}>{s.n}</div>
                <h3 style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(17px, 1.6vw, 20px)", fontWeight: 700, color: T.text, letterSpacing: "-0.015em", marginBottom: 12, lineHeight: 1.2 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.75 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .steps-grid { grid-template-columns: 1fr !important; }
            .steps-grid > div { border-right: none !important; padding-left: 0 !important; padding-right: 0 !important; border-bottom: 1px solid ${T.border}; }
          }
        `}</style>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: T.bg2, padding: "64px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, color: T.text }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="reveal reveal-delay-1" style={{ borderTop: `1px solid ${T.border}` }}>
            {faqs.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: T.bg, borderTop: `1px solid ${T.border}`, padding: "40px 40px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          {/* Left */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 10 }}>✦</span>
              </div>
              <span style={{ fontFamily: "var(--font-syne, inherit)", fontWeight: 700, fontSize: 14, color: T.text }}>EurekaAI</span>
            </div>
            <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5, maxWidth: 280 }}>Made for JEE Advanced aspirants who want to actually understand.</p>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 12 }}>© {new Date().getFullYear()} EurekaAI. All rights reserved.</p>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: T.muted, display: "flex" }}><TwitterX /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: T.muted, display: "flex" }}><Github /></a>
            <a href="mailto:hello@eurekaai.app" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
