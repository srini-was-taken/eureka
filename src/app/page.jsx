"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Tokens — clean white aesthetic ──────────────────────────────────────────
const T = {
  bg:      "#FAFAFA",
  bg2:     "#F2F2F2",
  surface: "#FFFFFF",
  border:  "#E4E4E4",
  text:    "#0A0A0A",
  muted:   "#6B6B6B",
  accent:  "#E8610A",
  accentL: "#FDF0E8",
  accentB: "#FBDECA",
  // dark section tokens
  dk:      "#0A0A0A",
  dkSurf:  "rgba(255,255,255,0.05)",
  dkBord:  "rgba(255,255,255,0.10)",
  dkText:  "#F0F0F0",
  dkMuted: "#888",
};

const INTER = "'Inter', system-ui, sans-serif";
const MONO  = "'JetBrains Mono', monospace";

// ─── Scroll-reveal + stagger ──────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      }),
      { threshold: 0.06, rootMargin: "0px 0px -32px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const sio = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(":scope > .sc").forEach((c, i) => {
            setTimeout(() => c.classList.add("visible"), i * 85);
          });
          sio.unobserve(entry.target);
        }
      }),
      { threshold: 0.04, rootMargin: "0px 0px -24px 0px" }
    );
    document.querySelectorAll(".stagger").forEach((el) => sio.observe(el));

    return () => { io.disconnect(); sio.disconnect(); };
  }, []);
}

// ─── Parallax ─────────────────────────────────────────────────────────────────
function useParallax(ref, speed = 0.2) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = () => { el.style.transform = `translateY(${window.scrollY * speed}px)`; };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [ref, speed]);
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
const Chevron = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const TwitterX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FaqItem({ q, a, open, onToggle }) {
  const bodyRef = useRef(null);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: T.text, fontFamily: INTER, lineHeight: 1.4, paddingRight: 24 }}>{q}</span>
        <span style={{ color: T.muted, flexShrink: 0, transition: "transform .28s ease", transform: open ? "rotate(180deg)" : "none", display: "flex" }}><Chevron /></span>
      </button>
      <div style={{ overflow: "hidden", transition: "max-height .32s cubic-bezier(.22,1,.36,1)", maxHeight: open ? (bodyRef.current?.scrollHeight || 400) + "px" : "0" }}>
        <div ref={bodyRef} style={{ paddingBottom: 20, fontSize: 15, color: T.muted, lineHeight: 1.8, fontFamily: INTER }}>{a}</div>
      </div>
    </div>
  );
}

// ─── GIF Placeholder ──────────────────────────────────────────────────────────
function GifPlaceholder({ label = "GIF", aspect = "16/9", style = {} }) {
  return (
    <div style={{
      aspectRatio: aspect,
      background: "rgba(255,255,255,0.03)",
      border: "1.5px dashed rgba(255,255,255,0.18)",
      borderRadius: 10,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
      ...style,
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="3"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
      <span style={{ fontSize: 10, fontFamily: MONO, color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

// ─── Bento Feature Cards ──────────────────────────────────────────────────────
function BentoCard({ children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.055)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 18,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardTag({ children, color = T.accent }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
      fontFamily: MONO,
      color,
      background: color + "18",
      border: `1px solid ${color}30`,
      borderRadius: 5,
      padding: "3px 9px",
      width: "fit-content",
    }}>
      {children}
    </span>
  );
}

// Hero bento card — Socratic Solver
function SocraticBentoCard() {
  return (
    <BentoCard className="sc" style={{ gridColumn: "1", gridRow: "1 / 3" }}>
      <div>
        <CardTag color="#E8610A">Socratic Solver</CardTag>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.dkText, fontFamily: INTER, lineHeight: 1.25, marginBottom: 8 }}>
          Questions that force you to think.
        </div>
        <p style={{ fontSize: 13, color: T.dkMuted, lineHeight: 1.7, fontFamily: INTER }}>
          Upload any JEE Advanced problem. EurekaAI drills your reasoning — not your answer.
        </p>
      </div>
      {/* GIF placeholder — tall format for hero card */}
      <GifPlaceholder label="Socratic Solver Demo" aspect="4/5" style={{ flex: 1, minHeight: 200 }} />
    </BentoCard>
  );
}

// Feynman bento card
function FeynmanBentoCard() {
  return (
    <BentoCard className="sc" style={{ gridColumn: "2 / 4", gridRow: "1" }}>
      <div>
        <CardTag color="#818cf8">Feynman Explainer</CardTag>
      </div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.dkText, fontFamily: INTER, lineHeight: 1.25, marginBottom: 8 }}>
            If you can't explain it simply, you don't know it.
          </div>
          <p style={{ fontSize: 13, color: T.dkMuted, lineHeight: 1.7, fontFamily: INTER }}>
            Explain a concept out loud or in text. AI pinpoints exactly which part of your reasoning is missing.
          </p>
        </div>
        <GifPlaceholder label="Feynman Demo" aspect="4/3" style={{ width: "48%", flexShrink: 0 }} />
      </div>
    </BentoCard>
  );
}

// Mistake Journal bento card
function MistakeBentoCard() {
  const concepts = [
    { label: "Work-Energy Theorem", w: 3 },
    { label: "Gauss's Law", w: 2 },
    { label: "Electrochemistry", w: 3 },
    { label: "Integral Calculus", w: 2 },
    { label: "SHM", w: 1 },
    { label: "Organic Reactions", w: 3 },
    { label: "Ray Optics", w: 2 },
  ];
  return (
    <BentoCard className="sc" style={{ gridColumn: "2", gridRow: "2" }}>
      <CardTag color="#4ade80">Mistake Journal</CardTag>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.dkText, fontFamily: INTER, lineHeight: 1.3 }}>
        Every error, tracked.
      </div>
      <GifPlaceholder label="Mistake Journal Demo" aspect="16/9" />
    </BentoCard>
  );
}

// Focus Mode bento card
function FocusBentoCard() {
  return (
    <BentoCard className="sc" style={{ gridColumn: "3", gridRow: "2" }}>
      <CardTag color="#fb923c">Focus Mode</CardTag>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.dkText, fontFamily: INTER, lineHeight: 1.3 }}>
        Timed. Locked. No shortcuts.
      </div>
      <GifPlaceholder label="Focus Mode Demo" aspect="16/9" />
    </BentoCard>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const stats = [
  { n: "87%",  body: "of JEE aspirants who fail say they understood the concept before the exam." },
  { n: "2.4×", body: "more likely to retain knowledge through active recall vs passive reading.", cite: "Karpicke & Roediger, 2008 — Science" },
  { n: "0",    body: "marks awarded for almost-correct reasoning in JEE Advanced. Partial is nothing." },
];

const faqs = [
  { q: "Is this just another AI solver?", a: "No — and that's the entire point. EurekaAI refuses to give you the answer until you've genuinely attempted the problem. It asks Socratic questions that expose where your reasoning breaks down." },
  { q: "What topics does it cover?", a: "Full JEE Advanced syllabus across Physics, Chemistry, and Mathematics — mechanics, electrostatics, organic chemistry, integral calculus. The archive covers 20+ years of past JEE Advanced papers." },
  { q: "How is this different from Doubtnut or PhysicsWallah AI?", a: "Doubtnut and PhysicsWallah show you the solution. EurekaAI doesn't. Passive reading of solutions produces shallow encoding. Active retrieval — what EurekaAI forces — produces knowledge that survives exam day." },
  { q: "Is it free?", a: "Yes. The core Socratic Solver and Feynman Explainer are free. Advanced features — the full 20-year archive, Concept Graph, and adaptive mistake surfacing — are part of the full plan." },
];

const steps = [
  { n: "01", title: "Pick a problem", body: "From the 20-year JEE Advanced archive, or paste anything you're stuck on. Physics, Chemistry, Math — any chapter." },
  { n: "02", title: "Work through it", body: "EurekaAI questions your reasoning, not your answer. Every hint must be earned. No shortcuts." },
  { n: "03", title: "Know it cold", body: "Concepts get reinforced until they're automatic. The Mistake Journal surfaces your blind spots at the right moment." },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const heroBlobRef = useRef(null);

  useScrollReveal();
  useParallax(heroBlobRef, 0.18);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, overflowX: "hidden", fontFamily: INTER }}>

      <style>{`
        /* ── Reveal ── */
        .reveal {
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.4s cubic-bezier(.22,1,.36,1), transform 0.4s cubic-bezier(.22,1,.36,1);
        }
        .reveal.slide-left  { transform: translateX(-32px); }
        .reveal.slide-right { transform: translateX(32px); }
        .reveal.scale-in    { transform: scale(0.94) translateY(14px); }
        .reveal.visible     { opacity: 1; transform: none; }
        .reveal-d1 { transition-delay: .06s; }
        .reveal-d2 { transition-delay: .12s; }
        .reveal-d3 { transition-delay: .18s; }
        .reveal-d4 { transition-delay: .24s; }

        /* ── Stagger children (.sc inside .stagger) ── */
        .stagger > .sc {
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.36s cubic-bezier(.22,1,.36,1), transform 0.36s cubic-bezier(.22,1,.36,1);
        }
        .stagger > .sc.visible { opacity: 1; transform: none; }

        /* ── Hero text entrance ── */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: none; }
        }
        .he { animation: slide-up 0.55s cubic-bezier(.22,1,.36,1) both; }
        .he1 { animation-delay: .04s; }
        .he2 { animation-delay: .12s; }
        .he3 { animation-delay: .20s; }
        .he4 { animation-delay: .28s; }

        /* ── CTA button ── */
        .cta {
          transition: transform .18s ease, box-shadow .18s ease;
          position: relative; overflow: hidden;
        }
        .cta::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.16) 50%, transparent 62%);
          background-size: 200% 100%; opacity: 0; transition: opacity .2s;
        }
        .cta:hover::after { opacity: 1; animation: shimmer .65s ease; }
        @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
        .cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,97,10,.4); }
        .cta:active { transform: none; }

        /* ── Nav link underline ── */
        .nl { position: relative; text-decoration: none; transition: color .15s; }
        .nl::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:1.5px; background:${T.accent}; transform:scaleX(0); transform-origin:left; transition:transform .2s cubic-bezier(.22,1,.36,1); }
        .nl:hover::after { transform: scaleX(1); }
        .nl:hover { color: ${T.text} !important; }

        /* ── Bento card hover ── */
        .bento-hover {
          transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s ease;
        }
        .bento-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 60px rgba(0,0,0,0.45); }

        /* ── Stat pop ── */
        @keyframes stat-pop {
          from { opacity: 0; transform: scale(0.78) translateY(12px); }
          to   { opacity: 1; transform: none; }
        }

        @media (max-width: 900px) {
          .hero-grid   { grid-template-columns: 1fr !important; }
          .bento-grid  { grid-template-columns: 1fr !important; grid-template-rows: auto !important; }
          .bento-grid > * { grid-column: 1 !important; grid-row: auto !important; }
          .steps-grid  { grid-template-columns: 1fr !important; }
          .steps-grid > div { border-right: none !important; padding-left: 0 !important; padding-right: 0 !important; border-bottom: 1px solid ${T.border}; }
          .stats-grid  { grid-template-columns: 1fr !important; }
          .stats-grid > div { border-right: none !important; padding-left: 0 !important; padding-right: 0 !important; border-bottom: 1px solid ${T.border}; }
        }
      `}</style>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(250,250,250,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        transition: "all .3s cubic-bezier(.22,1,.36,1)",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 36px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.transform = "rotate(12deg) scale(1.08)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 12 }}>✦</span>
            </div>
            <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", color: T.text }}>EurekaAI</span>
          </div>

          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {[["#features", "Features"], ["#how-it-works", "How it works"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="nl" style={{ fontSize: 13, fontWeight: 500, color: T.muted, fontFamily: INTER }}>{label}</a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => router.push("/login")}
              style={{ fontSize: 13, fontWeight: 500, color: T.muted, background: "none", border: "none", cursor: "pointer", fontFamily: INTER, padding: "7px 12px", borderRadius: 8, transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}>
              Log in
            </button>
            <button onClick={() => router.push("/login")} className="cta"
              style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: T.accent, border: "none", borderRadius: 9, padding: "8px 18px", cursor: "pointer", fontFamily: INTER }}>
              Get started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "60px 36px 80px", position: "relative", overflow: "hidden" }}>
        {/* Soft parallax blob */}
        <div ref={heroBlobRef} style={{
          position: "absolute", top: "-15%", right: "-8%", width: 520, height: 520,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${T.accentB} 0%, transparent 68%)`,
          pointerEvents: "none", willChange: "transform",
        }} />

        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", position: "relative", zIndex: 1 }} className="hero-grid">
          <div>
            <div className="he he1" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 22, padding: "5px 13px 5px 7px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 999, boxShadow: "0 1px 4px rgba(10,10,10,.06)" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>✦</span>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted, fontFamily: INTER }}>The anti-cheat study tool</span>
            </div>

            <h1 className="he he2" style={{ fontFamily: INTER, fontSize: "clamp(34px, 3.8vw, 52px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.03em", color: T.text, marginBottom: 20 }}>
              Stop getting<br />answers. Start<br />
              <span style={{ color: T.accent }}>understanding.</span>
            </h1>

            <p className="he he3" style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.75, maxWidth: 440, marginBottom: 28, fontWeight: 400, fontFamily: INTER }}>
              EurekaAI uses the Socratic method and Feynman technique — the same systems used by Nobel laureates — to help JEE Advanced aspirants actually understand physics, chemistry, and math.
            </p>

            <div className="he he4" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => router.push("/login")} className="cta"
                style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: T.accent, border: "none", borderRadius: 10, padding: "13px 28px", cursor: "pointer", fontFamily: INTER }}>
                Start for free ✦
              </button>
              <a href="#how-it-works" style={{
                fontSize: 14, fontWeight: 600, color: T.text, background: T.surface,
                border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 22px",
                textDecoration: "none", display: "inline-flex", alignItems: "center",
                fontFamily: INTER, transition: "all .18s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.bg2; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.surface; }}>
                See how it works
              </a>
            </div>
          </div>

          {/* Hero right — mini feature preview cards */}
          <div style={{ position: "relative", height: 420 }}>
            {/* Back card */}
            <div style={{
              position: "absolute", top: 20, left: 8, width: "87%",
              background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
              boxShadow: "0 4px 24px rgba(10,10,10,.08)", padding: "18px 20px", zIndex: 1,
              transform: "rotate(2.5deg)",
              animation: "slide-up 0.65s cubic-bezier(.22,1,.36,1) 0.18s both",
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              </div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#818CF8", marginBottom: 10, fontFamily: MONO }}>✦ Feynman Explainer</p>
              <div style={{ background: "#F0EFFF", borderRadius: 8, padding: "10px 12px", marginBottom: 10, border: "1px solid #C7D2FE" }}>
                <p style={{ fontSize: 11, color: "#3730A3", lineHeight: 1.7, fontStyle: "italic", margin: 0, fontFamily: INTER }}>"Explain Gauss's Law like I'm 15, using only everyday objects."</p>
              </div>
              <p style={{ fontSize: 11, color: T.muted, lineHeight: 1.65, fontFamily: INTER }}>Good attempt. You described the surface correctly — but you haven't explained <em>why</em> charge outside doesn't contribute. Gap found ↓</p>
            </div>

            {/* Front card — Socratic */}
            <div style={{
              position: "absolute", bottom: 8, right: 0, width: "87%", zIndex: 2,
              background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
              boxShadow: "0 4px 32px rgba(10,10,10,.10)", padding: "18px 20px",
              transform: "rotate(-1.5deg)",
              animation: "slide-up 0.65s cubic-bezier(.22,1,.36,1) 0.34s both",
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />)}
              </div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.accent, marginBottom: 10, fontFamily: MONO }}>✦ Socratic Solver</p>
              <div style={{ fontFamily: MONO, fontSize: 11, background: "#FAF9F7", borderRadius: 8, padding: "10px 12px", marginBottom: 10, border: `1px solid ${T.border}`, lineHeight: 1.75, color: T.text }}>
                A block of mass <em>m</em> on a rough inclined plane at angle θ — find the minimum force to prevent sliding.
              </div>
              <p style={{ fontSize: 11, color: T.accent, fontWeight: 600, fontFamily: INTER }}>Before we touch a formula — how many forces act on the block, and in which directions?</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM / STATS ────────────────────────────────────────────────── */}
      <section style={{ background: T.bg2, padding: "72px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, marginBottom: 10, fontFamily: INTER }}>The problem</p>
            <h2 style={{ fontFamily: INTER, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.12, color: T.text, maxWidth: 500 }}>
              Understanding and memorisation are not the same thing.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid ${T.border}` }} className="stats-grid stagger">
            {stats.map((s, i) => (
              <div key={i} className="sc" style={{ padding: "48px 36px 48px 0", borderRight: i < 2 ? `1px solid ${T.border}` : "none", paddingLeft: i > 0 ? 36 : 0 }}>
                <div style={{ fontFamily: INTER, fontSize: "clamp(44px, 5vw, 62px)", fontWeight: 900, color: T.text, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 14 }}>{s.n}</div>
                <p style={{ fontSize: 14.5, color: T.muted, lineHeight: 1.7, maxWidth: 260, fontFamily: INTER }}>{s.body}</p>
                {s.cite && (
                  <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, background: T.accentL, border: `1px solid ${T.accentB}`, borderRadius: 999, padding: "4px 11px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.accent, fontFamily: INTER }}>{s.cite}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES SECTION ─────────────────────────────────────────── */}
      <section id="features" style={{ background: T.dk, padding: "88px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 56, textAlign: "center" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12, fontFamily: INTER }}>Everything you need</p>
            <h2 style={{ fontFamily: INTER, fontSize: "clamp(26px, 3.2vw, 42px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1, color: T.dkText, marginBottom: 14 }}>
              A complete system, not a chatbot.
            </h2>
            <p style={{ fontSize: 15, color: T.dkMuted, lineHeight: 1.7, maxWidth: 440, margin: "0 auto", fontFamily: INTER }}>
              Every tool built around one idea: passive reading doesn't work. Struggle does.
            </p>
          </div>

          {/* Bento grid */}
          <div
            className="stagger bento-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr",
              gridTemplateRows: "auto auto",
              gap: 14,
            }}
          >
            {/* Hero card — Socratic Solver */}
            <BentoCard className="sc bento-hover" style={{ gridColumn: "1", gridRow: "1 / 3", gap: 22 }}>
              <CardTag color="#E8610A">Socratic Solver</CardTag>
              <div>
                <div style={{ fontSize: 21, fontWeight: 800, color: T.dkText, fontFamily: INTER, lineHeight: 1.2, marginBottom: 8 }}>
                  Questions that force you to think.
                </div>
                <p style={{ fontSize: 13, color: T.dkMuted, lineHeight: 1.7, fontFamily: INTER }}>
                  Upload any JEE Advanced problem. EurekaAI asks targeted questions that expose exactly where your reasoning breaks down — never just giving the answer.
                </p>
              </div>
              {/* GIF placeholder — tall */}
              <GifPlaceholder label="Socratic Solver · GIF" aspect="3/4" style={{ flex: 1, minHeight: 220 }} />
            </BentoCard>

            {/* Feynman Explainer — wide top right */}
            <BentoCard className="sc bento-hover" style={{ gridColumn: "2 / 4", gridRow: "1", flexDirection: "row", alignItems: "flex-start", gap: 24 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                <CardTag color="#818cf8">Feynman Explainer</CardTag>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: T.dkText, fontFamily: INTER, lineHeight: 1.25, marginBottom: 8 }}>
                    If you can't explain it simply, you don't know it.
                  </div>
                  <p style={{ fontSize: 12.5, color: T.dkMuted, lineHeight: 1.7, fontFamily: INTER }}>
                    Speak or type your explanation. AI highlights the exact gap in your understanding — not vague feedback, but precise misses.
                  </p>
                </div>
              </div>
              <GifPlaceholder label="Feynman · GIF" aspect="4/3" style={{ width: "46%", flexShrink: 0 }} />
            </BentoCard>

            {/* Mistake Journal */}
            <BentoCard className="sc bento-hover" style={{ gridColumn: "2", gridRow: "2", gap: 16 }}>
              <CardTag color="#4ade80">Mistake Journal</CardTag>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.dkText, fontFamily: INTER, lineHeight: 1.25 }}>Every error, tracked & resurface.</div>
              <GifPlaceholder label="Mistake Journal · GIF" aspect="16/9" />
            </BentoCard>

            {/* Focus Mode */}
            <BentoCard className="sc bento-hover" style={{ gridColumn: "3", gridRow: "2", gap: 16 }}>
              <CardTag color="#fb923c">Focus Mode</CardTag>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.dkText, fontFamily: INTER, lineHeight: 1.25 }}>Timed. Locked. No shortcuts.</div>
              <GifPlaceholder label="Focus Mode · GIF" aspect="16/9" />
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: T.bg, padding: "72px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 60 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, marginBottom: 10, fontFamily: INTER }}>How it works</p>
            <h2 style={{ fontFamily: INTER, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.12, color: T.text }}>
              Three steps to knowing it cold.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: `1px solid ${T.border}` }} className="steps-grid stagger">
            {steps.map((s, i) => (
              <div key={i} className="sc" style={{ padding: "44px 36px 44px 0", borderRight: i < 2 ? `1px solid ${T.border}` : "none", paddingLeft: i > 0 ? 36 : 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500, color: T.muted, marginBottom: 18, letterSpacing: "0.06em" }}>{s.n}</div>
                <h3 style={{ fontFamily: INTER, fontSize: "clamp(17px, 1.6vw, 21px)", fontWeight: 800, color: T.text, letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.2 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: T.muted, lineHeight: 1.75, fontFamily: INTER }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: T.bg2, padding: "72px 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="reveal" style={{ marginBottom: 44 }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, marginBottom: 10, fontFamily: INTER }}>FAQ</p>
            <h2 style={{ fontFamily: INTER, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.12, color: T.text }}>
              Frequently asked questions.
            </h2>
          </div>
          <div className="reveal reveal-d1" style={{ borderTop: `1px solid ${T.border}` }}>
            {faqs.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section style={{ background: T.bg, padding: "72px 36px" }}>
        <div className="reveal scale-in" style={{
          maxWidth: 720, margin: "0 auto", textAlign: "center",
          padding: "64px 48px", background: T.surface,
          borderRadius: 22, border: `1px solid ${T.border}`,
          boxShadow: "0 4px 40px rgba(10,10,10,.06)",
        }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>✦</span>
          </div>
          <h2 style={{ fontFamily: INTER, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 900, letterSpacing: "-0.03em", color: T.text, marginBottom: 12, lineHeight: 1.1 }}>
            Ready to actually understand?
          </h2>
          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, marginBottom: 30, maxWidth: 420, margin: "0 auto 30px", fontFamily: INTER }}>
            Stop consuming solutions. Start building the kind of understanding that survives exam day.
          </p>
          <button onClick={() => router.push("/login")} className="cta"
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: T.accent, border: "none", borderRadius: 11, padding: "14px 34px", cursor: "pointer", fontFamily: INTER }}>
            Start for free — no card required ✦
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{ background: T.bg, borderTop: `1px solid ${T.border}`, padding: "36px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 9 }}>✦</span>
              </div>
              <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 13.5, color: T.text }}>EurekaAI</span>
            </div>
            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, maxWidth: 260, fontFamily: INTER }}>Made for JEE Advanced aspirants who want to actually understand.</p>
            <p style={{ fontSize: 11.5, color: T.muted, marginTop: 10, fontFamily: INTER }}>© {new Date().getFullYear()} EurekaAI. All rights reserved.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {[["https://twitter.com", <TwitterX key="tw" />], ["https://github.com", <GithubIcon key="gh" />]].map(([href, icon]) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.muted, display: "flex", transition: "color .15s" }}
                onMouseEnter={e => e.currentTarget.style.color = T.text}
                onMouseLeave={e => e.currentTarget.style.color = T.muted}>{icon}</a>
            ))}
            <a href="mailto:hello@eurekaai.app" style={{ fontSize: 12.5, color: T.muted, textDecoration: "none", fontFamily: INTER, transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.muted}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
