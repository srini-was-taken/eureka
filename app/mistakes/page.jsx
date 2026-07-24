"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED, SUBJECT_COLORS } from "@/lib/theme";
import Sidebar from "@/components/layout/Sidebar";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";

const MISTAKES = [
  { id: 1, topic: "Rotational Dynamics", subject: "Physics", date: "Feb 26", status: "unresolved", hintsUsed: 4, problem: "A disc of radius R and mass M rolls without slipping. Find the acceleration of its centre.", userNote: "I forgot to include the rotational KE term and treated it like a sliding block.", aiDiagnosis: "You applied Newton's 2nd law for translation only. For rolling motion, you need both F=ma AND τ=Iα simultaneously. The missing piece was the rolling constraint: a = αR.", concepts: ["Rolling without slipping", "Rotational KE", "Newton's 2nd Law"] },
  { id: 2, topic: "Electrochemistry", subject: "Chemistry", date: "Feb 25", status: "unresolved", hintsUsed: 3, problem: "Calculate the EMF of the cell: Zn | Zn²⁺ (0.1M) || Cu²⁺ (0.01M) | Cu", userNote: "Got the sign of concentration cell wrong.", aiDiagnosis: "You applied Nernst equation but mixed up which species is reduced vs oxidised. Remember: Q = [products]/[reactants] where products are at cathode.", concepts: ["Nernst equation", "Cell EMF", "Reduction potential"] },
  { id: 3, topic: "Integration by Parts", subject: "Maths", date: "Feb 24", status: "resolved", hintsUsed: 2, problem: "Evaluate ∫ x²·eˣ dx", userNote: "Had to apply IBP twice, kept getting the sign wrong.", aiDiagnosis: "Error was in the second application — you correctly identified u=x but flipped the sign on the remaining integral. Tabular method would have prevented this.", concepts: ["Integration by Parts", "Tabular method"] },
  { id: 4, topic: "Work-Energy Theorem", subject: "Physics", date: "Feb 23", status: "resolved", hintsUsed: 1, problem: "A spring (k) is compressed by x. Block placed against it released on rough surface. Find velocity at natural length.", userNote: "", aiDiagnosis: "You applied WET correctly but forgot friction acts over the compression distance too, not just the subsequent motion.", concepts: ["Work-Energy Theorem", "Spring PE", "Friction work"] },
  { id: 5, topic: "Thermodynamics", subject: "Chemistry", date: "Feb 22", status: "unresolved", hintsUsed: 5, problem: "For an ideal gas undergoing adiabatic expansion, derive the relation between T and V.", userNote: "Completely blanked on where to start.", aiDiagnosis: "Entry point is dU = -dW (no heat transfer). Then dU = nCᵥdT and dW = PdV. Combining with PV = nRT gives the standard derivation.", concepts: ["Adiabatic process", "First law", "Ideal gas"] },
];

const FILTERS = ["all", "unresolved", "resolved", "Physics", "Chemistry", "Maths"];

export default function MistakeJournalPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = MISTAKES.filter(m => {
    if (filter === "all") return true;
    if (filter === "unresolved" || filter === "resolved") return m.status === filter;
    return m.subject === filter;
  });

  const detail = selected !== null ? MISTAKES.find(x => x.id === selected) : null;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Mistake Journal 📝</h1>
            <p style={{ color: MUTED, fontSize: 14 }}>Every struggle, logged and diagnosed. Your fastest path to improvement.</p>
          </div>
          <div style={{ background: "#f8717118", border: "1px solid #f8717130", borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#f87171", fontWeight: 600 }}>
            3 unresolved due for review
          </div>
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, margin: "24px 0" }}>
          {[
            { label: "Total Logged", val: "47", color: "#f472b6" },
            { label: "Unresolved",   val: "12", color: "#f87171" },
            { label: "Resolved",     val: "35", color: "#34d399" },
            { label: "Avg Hints",    val: "2.8", color: TEAL },
          ].map((s, i) => (
            <Card key={i} style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <div key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: filter === f ? TEAL + "20" : CARD, border: `1px solid ${filter === f ? TEAL + "50" : BORDER}`, color: filter === f ? TEAL : MUTED, transition: "all .15s", textTransform: "capitalize" }}>
              {f}
            </div>
          ))}
        </div>

        {/* List + detail split */}
        <div style={{ display: "grid", gridTemplateColumns: detail ? "1fr 1.2fr" : "1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(m => (
              <div key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
                style={{ background: CARD, border: `1px solid ${selected === m.id ? "#f472b650" : BORDER}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all .15s", boxShadow: selected === m.id ? "0 0 20px #f472b612" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{m.topic}</span>
                    <Badge color={SUBJECT_COLORS[m.subject]}>{m.subject}</Badge>
                    <span style={{ background: m.status === "resolved" ? "#34d39920" : "#f8717120", color: m.status === "resolved" ? "#34d399" : "#f87171", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                      {m.status === "resolved" ? "✓ Resolved" : "⚠ Unresolved"}
                    </span>
                  </div>
                  <span style={{ color: MUTED, fontSize: 12, flexShrink: 0 }}>{m.date}</span>
                </div>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: "0 0 10px" }}>
                  {m.problem.length > 90 ? m.problem.slice(0, 90) + "..." : m.problem}
                </p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#fb923c" }}>💡 {m.hintsUsed} hints used</span>
                  {m.userNote && <span style={{ fontSize: 12, color: MUTED }}>· Note added</span>}
                  <span style={{ marginLeft: "auto", fontSize: 12, color: TEAL, fontWeight: 600 }}>
                    {selected === m.id ? "↑ Close" : "View details →"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {detail && (
            <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
              <Card glow style={{ padding: 28 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <Badge color={SUBJECT_COLORS[detail.subject]}>{detail.subject}</Badge>
                  <Badge color="#f472b6">{detail.topic}</Badge>
                  <span style={{ background: detail.status === "resolved" ? "#34d39920" : "#f8717120", color: detail.status === "resolved" ? "#34d399" : "#f87171", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                    {detail.status === "resolved" ? "✓ Resolved" : "⚠ Unresolved"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>PROBLEM</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT, marginBottom: 20, padding: "14px 16px", background: CARD2, borderRadius: 10 }}>{detail.problem}</p>

                {detail.userNote && (
                  <>
                    <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>YOUR NOTE</div>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: "#fbbf24", marginBottom: 20, padding: "12px 14px", background: "#fbbf2410", border: "1px solid #fbbf2420", borderRadius: 10 }}>"{detail.userNote}"</p>
                  </>
                )}

                <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>✦ AI DIAGNOSIS</div>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: TEXT, marginBottom: 20, padding: "14px 16px", background: TEAL + "0d", border: `1px solid ${TEAL}25`, borderRadius: 10 }}>{detail.aiDiagnosis}</p>

                <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>CONCEPTS TO REVISIT</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22 }}>
                  {detail.concepts.map(c => <Badge key={c} color="#818cf8">{c}</Badge>)}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Btn small onClick={() => router.push("/solver")} style={{ flex: 1, justifyContent: "center" }}>Re-attempt ✦</Btn>
                  <Btn small variant="outline" onClick={() => router.push("/feynman")}>Feynman it</Btn>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
