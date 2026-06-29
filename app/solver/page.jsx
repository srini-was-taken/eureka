"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEAL, TEAL_DIM, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";

const INITIAL_MESSAGES = [
  { role: "ai", text: "Hey! Drop a problem in — paste it, type it, or upload an image of it. I won't solve it for you, but I'll make sure *you* do. 🧠" },
];

// Demo conversation flow (replace with real API call)
const DEMO_FLOW = [
  { role: "ai", text: "Interesting problem! Before jumping to equations — let's think conceptually first. What type of motion is the block undergoing? Is there net acceleration, or is it in equilibrium?" },
  { role: "user", text: "it's sliding at constant velocity so... equilibrium? net force is zero" },
  { role: "ai", text: "Exactly right — constant velocity means zero acceleration, which means net force = 0. 🎯\n\nNow, draw the forces in your head. How many forces act on the block, and in which direction does each one point?" },
  { role: "user", text: "gravity downward, normal force perpendicular to incline, friction up the incline, and the applied force" },
  { role: "ai", text: "Perfect — you've got all four. Now here's the key step: since the surface is inclined, we need to resolve these along two axes. Which two axes would make this problem cleanest to solve?" },
];

const QUICK_PROMPTS = ["I'm stuck", "Give me a small hint", "What concept is this?", "Show the approach"];

export default function SolverPage() {
  const router = useRouter();
  const [msgs, setMsgs] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState(0);
  const [imageUploaded, setImageUploaded] = useState(false);
  const chatRef = useRef();

  function send() {
    if (!input.trim() && !imageUploaded) return;
    const userMsg = { role: "user", text: imageUploaded ? (input || "[Problem image uploaded]") : input };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setImageUploaded(false);

    // TODO: Replace this demo flow with a real call to /api/solver
    if (stage < DEMO_FLOW.length - 1) {
      const nextAI = DEMO_FLOW[Math.min(stage + 1, DEMO_FLOW.length - 1)];
      setTimeout(() => {
        setMsgs(m => [...m, { role: "ai", text: nextAI.text }]);
        setStage(s => s + 1);
      }, 900);
    }
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  return (
    <div style={{ height: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn variant="ghost" small onClick={() => router.push("/dashboard")} style={{ padding: "7px 12px" }}>← Back</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <div style={{ width: 36, height: 36, background: TEAL + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Socratic Solver</div>
          <div style={{ fontSize: 11, color: MUTED }}>Guided problem-solving · JEE Advanced mode</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Badge>Mechanics</Badge>
          <Badge color="#818cf8">Hard</Badge>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Chat */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
                {m.role === "ai" && (
                  <div style={{ width: 34, height: 34, background: TEAL + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>✦</div>
                )}
                <div style={{
                  maxWidth: "65%", padding: "14px 18px",
                  borderRadius: m.role === "ai" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                  background: m.role === "ai" ? CARD2 : `linear-gradient(135deg,${TEAL},${TEAL_DIM})`,
                  color: m.role === "user" ? "#000" : TEXT,
                  fontSize: 14, lineHeight: 1.7, fontWeight: m.role === "user" ? 600 : 400,
                  border: m.role === "ai" ? `1px solid ${BORDER}` : "none",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div style={{ padding: "16px 28px 24px", borderTop: `1px solid ${BORDER}`, background: CARD }}>
            {imageUploaded && (
              <div style={{ background: TEAL + "15", border: `1px solid ${TEAL}30`, borderRadius: 10, padding: "8px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span>🖼</span>
                <span style={{ color: TEAL }}>problem_image.jpg attached</span>
                <span onClick={() => setImageUploaded(false)} style={{ marginLeft: "auto", cursor: "pointer", color: MUTED }}>✕</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Type your thinking, or upload an image of the problem..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14 }}
                />
                <div onClick={() => setImageUploaded(true)} style={{ cursor: "pointer", opacity: 0.6, fontSize: 18 }} title="Upload image">🖼</div>
              </div>
              <Btn onClick={send} style={{ padding: "14px 20px" }}>➤</Btn>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {QUICK_PROMPTS.map(q => (
                <div key={q} onClick={() => setInput(q)} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: MUTED, cursor: "pointer" }}>{q}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 280, borderLeft: `1px solid ${BORDER}`, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 12, letterSpacing: 0.5 }}>HINT PROGRESS</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{ flex: 1, height: 6, borderRadius: 3, background: n <= 2 ? TEAL : CARD2 }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>2 of 5 hints used</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 12, letterSpacing: 0.5 }}>CONCEPTS IN PLAY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {["Newton's 2nd Law", "Free body diagram", "Inclined plane geometry", "Static equilibrium"].map((c, i) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: i < 2 ? TEAL : BORDER }} />
                  <span style={{ color: i < 2 ? TEXT : MUTED }}>{c}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>SESSION</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: TEAL }}>07:42</div>
            <div style={{ fontSize: 12, color: MUTED }}>time on problem</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
