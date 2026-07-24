"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Btn from "@/components/ui/Btn";

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function FocusPage() {
  const router = useRouter();
  const [stage, setStage] = useState("upload"); // upload | session
  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pct = ((25 * 60 - timer) / (25 * 60)) * 100;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTimer(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [running]);

  if (stage === "upload") {
    return (
      <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
          <Btn variant="ghost" small onClick={() => router.push("/dashboard")} style={{ padding: "7px 12px" }}>← Back</Btn>
          <div style={{ width: 1, height: 24, background: BORDER }} />
          <span style={{ fontWeight: 700 }}>Focus Mode</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ fontSize: 42, marginBottom: 20 }}>👁</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5 }}>Upload your study material</h2>
          <p style={{ color: MUTED, fontSize: 15, marginBottom: 40 }}>PDF, PowerPoint, or any document. We'll render it distraction-free.</p>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); setStage("session"); }}
            onClick={() => setStage("session")}
            style={{ width: 500, border: `2px dashed ${dragging ? TEAL : BORDER}`, borderRadius: 18, padding: "52px 40px", textAlign: "center", cursor: "pointer", background: dragging ? TEAL + "08" : CARD, transition: "all .2s" }}
          >
            <div style={{ fontSize: 36, marginBottom: 16 }}>⬆</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Click to upload or drag & drop</div>
            <div style={{ color: MUTED, fontSize: 13 }}>PDF · PowerPoint · Google Slides</div>
          </div>

          {/* Recent files */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {["JEE 2024 Paper.pdf", "HC Verma Ch.9.pdf", "Arihant Maths.pdf"].map(f => (
              <div key={f} onClick={() => setStage("session")} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer", display: "flex", gap: 7, alignItems: "center" }}>
                <span>📄</span>{f}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ padding: "10px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 16, background: CARD }}>
        <Btn variant="ghost" small onClick={() => setStage("upload")} style={{ padding: "6px 12px" }}>← Exit</Btn>
        <span style={{ fontSize: 13, color: MUTED }}>Rotational Dynamics · Chapter 9 · HC Verma</span>

        {/* Pomodoro */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", width: 48, height: 48 }}>
            <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="24" cy="24" r="20" fill="none" stroke={BORDER} strokeWidth="3" />
              <circle cx="24" cy="24" r="20" fill="none" stroke={TEAL} strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: TEAL }}>
              {fmt(timer).split(":")[0]}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{fmt(timer)}</div>
            <div style={{ fontSize: 10, color: MUTED }}>Focus session · Pomodoro 1 of 4</div>
          </div>
          <Btn small variant={running ? "ghost" : "primary"} onClick={() => setRunning(r => !r)}>
            {running ? "⏸ Pause" : "▶ Start"}
          </Btn>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" small>🖊 Highlight</Btn>
          <Btn variant="ghost" small>🗒 Note</Btn>
          {/* TODO: open AI side drawer */}
          <Btn variant="outline" small onClick={() => router.push("/solver")}>Ask AI ✦</Btn>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* PDF viewer — replace with PDF.js in production */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 60px", background: "#0a0c0f" }}>
          <div style={{ width: 680, background: "#fff", borderRadius: 6, padding: "56px 72px", color: "#111", boxShadow: "0 8px 60px #00000060", minHeight: 900 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Chapter 10: Rotational Mechanics</h2>
            <h3 style={{ fontSize: 14, textAlign: "center", color: "#444", fontWeight: 400, marginBottom: 32 }}>H.C. Verma · Concepts of Physics Vol. 1</h3>
            <p style={{ fontSize: 14, lineHeight: 1.9, marginBottom: 18, color: "#222" }}>
              When a rigid body rotates about a fixed axis, each particle of the body moves in a circle. The plane of the circle is perpendicular to the axis of rotation and the centre of the circle is on the axis.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.9, marginBottom: 18, color: "#222" }}>
              The <span style={{ background: "#fef08a", padding: "0 2px" }}>torque of a force about the axis of rotation</span> is defined as τ = r × F. The net torque equals the rate of change of angular momentum:
              <span style={{ display: "block", textAlign: "center", margin: "16px 0", fontSize: 16, fontWeight: 700 }}>τ_net = dL/dt = Iα</span>
            </p>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "14px 18px", marginBottom: 18, fontSize: 13, lineHeight: 1.7, color: "#14532d" }}>
              <strong>Note:</strong> When no external torque acts, angular momentum L = Iω is conserved.
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 260, borderLeft: `1px solid ${BORDER}`, padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1 }}>SESSION STATS</div>
          {[["Blocks Done", "1 / 4"], ["Time Spent", fmt(25 * 60 - timer)], ["Highlights", "3"], ["Notes", "1"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: MUTED }}>{k}</span>
              <span style={{ fontWeight: 700, color: TEAL }}>{v}</span>
            </div>
          ))}
          <div style={{ height: 1, background: BORDER, margin: "4px 0" }} />
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1 }}>HIGHLIGHTS</div>
          {["torque of a force about the axis", "angular momentum is conserved"].map((h, i) => (
            <div key={i} style={{ background: "#fef08a15", border: "1px solid #fef08a30", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#fef08a" }}>"{h}..."</div>
          ))}
          <Btn variant="outline" small style={{ marginTop: 4 }} onClick={() => router.push("/feynman")}>✦ Test understanding</Btn>
          <Btn variant="ghost" small>Generate flashcards</Btn>
        </div>
      </div>
    </div>
  );
}
