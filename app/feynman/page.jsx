"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";

const TOPICS = [
  "Conservation of Angular Momentum",
  "Electrochemical Cells",
  "Work-Energy Theorem",
  "Ideal Gas Law",
  "Integration by Parts",
];

// Demo feedback — replace with real /api/feynman/evaluate response
const DEMO_FEEDBACK = {
  score: 74,
  strong: ["Correctly identified rotational inertia", "Good use of τ = Iα analogy"],
  gaps: [
    "Didn't mention the condition: no external torque must be present",
    "Missed the vector nature of L — direction matters",
  ],
  followUp: "You said 'the spinning speeds up when arms are pulled in' — but *why* does it speed up? Can you explain that using the formula L = Iω?",
};

export default function FeynmanPage() {
  const router = useRouter();
  const [stage, setStage] = useState("pick"); // pick | explain | feedback
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      {/* Header */}
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn variant="ghost" small onClick={() => router.push("/dashboard")} style={{ padding: "7px 12px" }}>← Back</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <div style={{ width: 36, height: 36, background: "#818cf820", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔬</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Feynman Explainer</div>
          <div style={{ fontSize: 11, color: MUTED }}>Explain it. We'll find the gaps.</div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 28px" }}>
        {/* Stage: Pick topic */}
        {stage === "pick" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔬</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 10 }}>What concept do you want to test?</h2>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6 }}>Pick a topic or upload your notes. Then explain it in your own words — no looking back.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {TOPICS.map((t, i) => (
                <div key={i} onClick={() => setTopic(t)}
                  style={{ background: topic === t ? TEAL + "15" : CARD, border: `1px solid ${topic === t ? TEAL + "60" : BORDER}`, borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .15s" }}>
                  <span style={{ fontWeight: topic === t ? 700 : 400, color: topic === t ? TEAL : TEXT, fontSize: 15 }}>{t}</span>
                  {topic === t && <span style={{ color: TEAL }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ background: CARD2, border: `2px dashed ${BORDER}`, borderRadius: 14, padding: 22, textAlign: "center", marginBottom: 28, cursor: "pointer" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, color: MUTED }}>Or upload your notes / textbook chapter</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>PDF, image — we'll extract the concepts</div>
            </div>
            <Btn style={{ width: "100%", justifyContent: "center", padding: 15, fontSize: 15 }} onClick={() => topic && setStage("explain")}>
              Start Explaining →
            </Btn>
          </>
        )}

        {/* Stage: Write explanation */}
        {stage === "explain" && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
                <Badge color="#818cf8">{topic}</Badge>
                <span style={{ color: MUTED, fontSize: 13 }}>No notes, no looking back.</span>
              </div>
              <Card style={{ padding: 24, background: "#818cf810", border: "1px solid #818cf830" }}>
                <p style={{ color: "#c4b5fd", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  ✦ Imagine you're explaining <strong>{topic}</strong> to a classmate who's never heard of it. Use your own words, examples, intuition. Don't worry about being perfect — that's kind of the point.
                </p>
              </Card>
            </div>
            <textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Start typing your explanation here..."
              style={{ width: "100%", height: 240, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px", color: TEXT, fontSize: 14, lineHeight: 1.8, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ color: MUTED, fontSize: 13 }}>{explanation.length} characters</span>
              {/* TODO: Call /api/feynman/evaluate with explanation + topic */}
              <Btn onClick={() => explanation.length > 20 && setStage("feedback")} style={{ padding: "13px 28px" }}>
                Submit for Evaluation ✦
              </Btn>
            </div>
          </>
        )}

        {/* Stage: Show feedback */}
        {stage === "feedback" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `conic-gradient(${TEAL} ${DEMO_FEEDBACK.score * 3.6}deg, ${CARD2} 0)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: TEAL, lineHeight: 1 }}>{DEMO_FEEDBACK.score}</span>
                  <span style={{ fontSize: 10, color: MUTED }}>/ 100</span>
                </div>
              </div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, margin: "0 0 4px", letterSpacing: -0.5 }}>Pretty solid — but there are gaps.</h2>
                <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Here's what your explanation revealed.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Card style={{ padding: 20, border: `1px solid ${TEAL}30` }}>
                <div style={{ color: TEAL, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>✓ What you nailed</div>
                {DEMO_FEEDBACK.strong.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: TEAL, flexShrink: 0 }}>✓</span> {s}
                  </div>
                ))}
              </Card>
              <Card style={{ padding: 20, border: "1px solid #f4723050" }}>
                <div style={{ color: "#fb923c", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>⚡ Gaps detected</div>
                {DEMO_FEEDBACK.gaps.map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: "#fb923c", flexShrink: 0 }}>!</span> {g}
                  </div>
                ))}
              </Card>
            </div>

            <Card style={{ padding: 22, background: "#818cf810", border: "1px solid #818cf830", marginBottom: 24 }}>
              <div style={{ color: "#818cf8", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>✦ Follow-up question</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: TEXT }}>{DEMO_FEEDBACK.followUp}</p>
              <textarea placeholder="Answer here..." style={{ width: "100%", height: 80, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", color: TEXT, fontSize: 13, resize: "none", outline: "none", marginTop: 14, boxSizing: "border-box" }} />
            </Card>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn style={{ flex: 1, justifyContent: "center" }} onClick={() => setStage("explain")}>Re-explain to improve score ↺</Btn>
              <Btn variant="ghost" onClick={() => setStage("pick")}>Different topic</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
