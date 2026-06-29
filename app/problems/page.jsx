"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED, SUBJECT_COLORS, DIFF_COLORS } from "@/lib/theme";
import Sidebar from "@/components/layout/Sidebar";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";

const STATUS_CONFIG = {
  solved: { color: "#34d399", label: "✓ Solved" },
  hinted: { color: "#fb923c", label: "⚡ Hinted" },
  failed: { color: "#f87171", label: "✗ Failed" },
};

const PROBLEMS = [
  { id: 1, title: "Inclined plane with friction",     subject: "Physics",   topic: "Newton's Laws",       difficulty: "Medium", source: "JEE 2023",     status: "solved", hintsUsed: 1, statement: "A block of mass m is placed on a rough inclined plane (angle θ, μ = 0.4). Find the minimum force parallel to the plane required to push it upward." },
  { id: 2, title: "Rolling disc — acceleration",      subject: "Physics",   topic: "Rotational Dynamics", difficulty: "Hard",   source: "JEE Adv 2022", status: "hinted", hintsUsed: 3, statement: "A uniform disc of radius R rolls without slipping on a rough horizontal surface. A horizontal force F is applied at its centre. Find the acceleration and friction force." },
  { id: 3, title: "Nernst equation cell EMF",         subject: "Chemistry", topic: "Electrochemistry",    difficulty: "Medium", source: "JEE 2024",     status: "failed", hintsUsed: 5, statement: "Calculate the EMF of: Zn | Zn²⁺(0.1M) || Cu²⁺(0.01M) | Cu. Given E°cell = 1.10V, T = 298K." },
  { id: 4, title: "Integration — IBP twice",          subject: "Maths",     topic: "Integral Calculus",   difficulty: "Easy",   source: "Practice",     status: "solved", hintsUsed: 0, statement: "Evaluate ∫ x² · eˣ dx using integration by parts." },
  { id: 5, title: "Adiabatic expansion — TV relation",subject: "Chemistry", topic: "Thermodynamics",      difficulty: "Hard",   source: "JEE Adv 2021", status: "failed", hintsUsed: 5, statement: "Derive the relation between T and V for an ideal gas undergoing reversible adiabatic expansion." },
  { id: 6, title: "Spring-mass on rough surface",     subject: "Physics",   topic: "Work-Energy Theorem", difficulty: "Medium", source: "HC Verma",     status: "solved", hintsUsed: 2, statement: "A spring (k = 200 N/m) compressed by 0.1m. A 1kg block on surface with μ = 0.3. Find velocity when spring reaches natural length." },
  { id: 7, title: "Complex number argument",          subject: "Maths",     topic: "Complex Numbers",     difficulty: "Hard",   source: "JEE Adv 2023", status: "hinted", hintsUsed: 2, statement: "If z₁, z₂ are complex numbers such that |z₁ + z₂| = |z₁ - z₂|, find the angle between them in the Argand plane." },
  { id: 8, title: "Reaction quotient vs Keq",         subject: "Chemistry", topic: "Equilibrium",         difficulty: "Easy",   source: "NCERT",        status: "solved", hintsUsed: 0, statement: "For N₂ + 3H₂ ⇌ 2NH₃, Kc = 0.5 at 400°C. If [N₂]=2M, [H₂]=3M, [NH₃]=1M, predict direction of reaction." },
];

export default function ProblemBankPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = PROBLEMS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "All" || p.subject === filterSubject;
    const matchDiff = filterDiff === "All" || p.difficulty === filterDiff;
    return matchSearch && matchSubject && matchDiff;
  });

  const sel = selected !== null ? PROBLEMS.find(p => p.id === selected) : null;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Problem Bank 📖</h1>
            <p style={{ color: MUTED, fontSize: 14 }}>Your personal collection of JEE problems, tagged and tracked.</p>
          </div>
          <Btn small onClick={() => router.push("/solver")}>+ Add Problem</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, margin: "24px 0" }}>
          {[
            { label: "Total Problems",   val: PROBLEMS.length,                                                   color: TEAL },
            { label: "Solved Clean",     val: PROBLEMS.filter(p => p.status === "solved" && p.hintsUsed === 0).length, color: "#34d399" },
            { label: "Need Revisit",     val: PROBLEMS.filter(p => p.status === "failed").length,                color: "#f87171" },
            { label: "JEE Adv Source",   val: PROBLEMS.filter(p => p.source.includes("Adv")).length,             color: "#818cf8" },
          ].map((s, i) => (
            <Card key={i} style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Search + filter bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ color: MUTED, fontSize: 16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by topic or title..."
              style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14, flex: 1 }} />
          </div>
          {["All", "Physics", "Chemistry", "Maths"].map(s => (
            <div key={s} onClick={() => setFilterSubject(s)}
              style={{ padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: filterSubject === s ? TEAL + "20" : CARD, border: `1px solid ${filterSubject === s ? TEAL + "50" : BORDER}`, color: filterSubject === s ? TEAL : MUTED, transition: "all .15s" }}>
              {s}
            </div>
          ))}
          <div style={{ width: 1, height: 24, background: BORDER }} />
          {["All", "Easy", "Medium", "Hard"].map(d => (
            <div key={d} onClick={() => setFilterDiff(d)}
              style={{ padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: filterDiff === d ? (DIFF_COLORS[d] || TEAL) + "20" : CARD, border: `1px solid ${filterDiff === d ? (DIFF_COLORS[d] || TEAL) + "50" : BORDER}`, color: filterDiff === d ? (DIFF_COLORS[d] || TEAL) : MUTED, transition: "all .15s" }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: sel ? "1fr 1.1fr" : "1fr", gap: 20 }}>
          {/* Problem list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelected(selected === p.id ? null : p.id)}
                style={{ background: CARD, border: `1px solid ${selected === p.id ? "#fb923c50" : BORDER}`, borderRadius: 13, padding: "17px 20px", cursor: "pointer", transition: "all .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{p.title}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Badge color={SUBJECT_COLORS[p.subject]}>{p.subject}</Badge>
                      <Badge color="#6b7280">{p.topic}</Badge>
                      <span style={{ background: DIFF_COLORS[p.difficulty] + "20", color: DIFF_COLORS[p.difficulty], borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{p.difficulty}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ background: STATUS_CONFIG[p.status].color + "20", color: STATUS_CONFIG[p.status].color, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>{STATUS_CONFIG[p.status].label}</span>
                    <span style={{ color: MUTED, fontSize: 11 }}>{p.source}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: p.hintsUsed === 0 ? "#34d399" : "#fb923c" }}>
                    {p.hintsUsed === 0 ? "✦ No hints used" : `💡 ${p.hintsUsed} hints used`}
                  </span>
                  <span style={{ fontSize: 12, color: "#fb923c", fontWeight: 600 }}>{selected === p.id ? "↑ Close" : "Open →"}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 600 }}>No problems match this filter</div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          {sel && (
            <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
              <Card style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
                  <Badge color={SUBJECT_COLORS[sel.subject]}>{sel.subject}</Badge>
                  <Badge color="#6b7280">{sel.topic}</Badge>
                  <span style={{ background: DIFF_COLORS[sel.difficulty] + "20", color: DIFF_COLORS[sel.difficulty], borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{sel.difficulty}</span>
                  <Badge color="#6b7280">{sel.source}</Badge>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16, letterSpacing: -0.3 }}>{sel.title}</h3>
                <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>PROBLEM STATEMENT</div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: TEXT, padding: "14px 16px", background: CARD2, borderRadius: 10, marginBottom: 20 }}>{sel.statement}</p>
                <div style={{ display: "flex", gap: 10, marginBottom: 16, padding: "12px 16px", background: CARD2, borderRadius: 10 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: STATUS_CONFIG[sel.status].color }}>{STATUS_CONFIG[sel.status].label}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>Status</div>
                  </div>
                  <div style={{ width: 1, background: BORDER }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: sel.hintsUsed === 0 ? "#34d399" : "#fb923c" }}>{sel.hintsUsed}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>Hints Used</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn small onClick={() => router.push("/solver")} style={{ flex: 1, justifyContent: "center" }}>
                    {sel.status === "solved" ? "Solve Again ↺" : "Solve with AI ✦"}
                  </Btn>
                  {sel.status === "failed" && (
                    <Btn small variant="outline" onClick={() => router.push("/mistakes")}>View in Journal</Btn>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
