"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Btn from "@/components/ui/Btn";

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function FocusPage() {
  const router = useRouter();
  const [stage, setStage] = useState("upload");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);

  // Pomodoro
  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const pct = ((25 * 60 - timer) / (25 * 60)) * 100;

  // Highlights & Notes
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showHighlightInput, setShowHighlightInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [highlightText, setHighlightText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [activeTab, setActiveTab] = useState("stats"); // stats | highlights | notes

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTimer(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [running]);

  function handleFile(file) {
    if (!file || file.type !== "application/pdf") return;
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setFileName(file.name);
    setStage("session");
  }

  function addHighlight() {
    if (!highlightText.trim()) return;
    setHighlights(h => [...h, { id: Date.now(), text: highlightText.trim(), color: "yellow" }]);
    setHighlightText("");
    setShowHighlightInput(false);
    setActiveTab("highlights");
  }

  function addNote() {
    if (!noteText.trim()) return;
    setNotes(n => [...n, { id: Date.now(), text: noteText.trim() }]);
    setNoteText("");
    setShowNoteInput(false);
    setActiveTab("notes");
  }

  // ── UPLOAD STAGE ──────────────────────────────────────────
  if (stage === "upload") return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn variant="ghost" small onClick={() => router.push("/dashboard")} style={{ padding: "7px 12px" }}>← Back</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <span style={{ fontWeight: 700 }}>Focus Mode</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ fontSize: 42, marginBottom: 20 }}>👁</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5 }}>Upload your study material</h2>
        <p style={{ color: MUTED, fontSize: 15, marginBottom: 40 }}>Drop a PDF and study it distraction-free with a built-in Pomodoro timer.</p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("pdf-input").click()}
          style={{ width: 500, border: `2px dashed ${dragging ? TEAL : BORDER}`, borderRadius: 18, padding: "52px 40px", textAlign: "center", cursor: "pointer", background: dragging ? TEAL + "08" : CARD, transition: "all .2s" }}
        >
          <div style={{ fontSize: 36, marginBottom: 16 }}>⬆</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Click to upload or drag & drop</div>
          <div style={{ color: MUTED, fontSize: 13 }}>PDF files only</div>
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  );

  // ── SESSION STAGE ─────────────────────────────────────────
  return (
    <div style={{ height: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <div style={{ padding: "10px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 16, background: CARD, flexShrink: 0 }}>
        <Btn variant="ghost" small onClick={() => { setStage("upload"); setPdfUrl(null); setRunning(false); setTimer(25*60); }} style={{ padding: "6px 12px" }}>← Exit</Btn>
        <span style={{ fontSize: 13, color: MUTED, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>

        {/* Pomodoro — center */}
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
            <div style={{ fontSize: 10, color: MUTED }}>Pomodoro · 25 min focus</div>
          </div>
          <Btn small variant={running ? "ghost" : "primary"} onClick={() => setRunning(r => !r)}>
            {running ? "⏸ Pause" : "▶ Start"}
          </Btn>
          <Btn small variant="ghost" onClick={() => { setTimer(25*60); setRunning(false); }}>↺ Reset</Btn>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" small onClick={() => { setShowHighlightInput(h => !h); setShowNoteInput(false); }}>🖊 Highlight</Btn>
          <Btn variant="ghost" small onClick={() => { setShowNoteInput(n => !n); setShowHighlightInput(false); }}>🗒 Note</Btn>
          <Btn variant="outline" small onClick={() => router.push("/solver")}>Ask AI ✦</Btn>
        </div>
      </div>

      {/* Inline input bars */}
      {showHighlightInput && (
        <div style={{ padding: "10px 24px", background: "#fef08a10", borderBottom: `1px solid #fef08a30`, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#fef08a", fontWeight: 600, flexShrink: 0 }}>🖊 Add highlight:</span>
          <input
            autoFocus
            value={highlightText}
            onChange={e => setHighlightText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addHighlight()}
            placeholder="Type or paste the text you want to highlight..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, fontFamily: "inherit" }}
          />
          <Btn small onClick={addHighlight}>Save</Btn>
          <span onClick={() => setShowHighlightInput(false)} style={{ cursor: "pointer", color: MUTED, fontSize: 18 }}>✕</span>
        </div>
      )}

      {showNoteInput && (
        <div style={{ padding: "10px 24px", background: TEAL + "0a", borderBottom: `1px solid ${TEAL}20`, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: TEAL, fontWeight: 600, flexShrink: 0 }}>🗒 Add note:</span>
          <input
            autoFocus
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addNote()}
            placeholder="Write your note..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, fontFamily: "inherit" }}
          />
          <Btn small onClick={addNote}>Save</Btn>
          <span onClick={() => setShowNoteInput(false)} style={{ cursor: "pointer", color: MUTED, fontSize: 18 }}>✕</span>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* PDF viewer */}
        <div style={{ flex: 1, overflow: "hidden", background: "#0a0c0f" }}>
          <iframe
            src={pdfUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="PDF Viewer"
          />
        </div>

        {/* Right panel */}
        <div style={{ width: 260, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", background: CARD, flexShrink: 0 }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
            {[
              { key: "stats", label: "Stats" },
              { key: "highlights", label: `Highlights ${highlights.length > 0 ? `(${highlights.length})` : ""}` },
              { key: "notes", label: `Notes ${notes.length > 0 ? `(${notes.length})` : ""}` },
            ].map(tab => (
              <div key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ flex: 1, padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, cursor: "pointer", color: activeTab === tab.key ? TEAL : MUTED, borderBottom: `2px solid ${activeTab === tab.key ? TEAL : "transparent"}`, transition: "all .15s" }}>
                {tab.label}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Stats tab */}
            {activeTab === "stats" && (
              <>
                {[
                  ["Time Spent", fmt(25 * 60 - timer)],
                  ["Highlights", highlights.length],
                  ["Notes", notes.length],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 14px", background: CARD2, borderRadius: 10 }}>
                    <span style={{ color: MUTED }}>{k}</span>
                    <span style={{ fontWeight: 700, color: TEAL }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: BORDER, margin: "4px 0" }} />
                <Btn variant="outline" small style={{ justifyContent: "center" }} onClick={() => router.push("/feynman")}>✦ Test understanding</Btn>
                <Btn variant="ghost" small style={{ justifyContent: "center" }}>Generate flashcards</Btn>
              </>
            )}

            {/* Highlights tab */}
            {activeTab === "highlights" && (
              <>
                <Btn small onClick={() => { setShowHighlightInput(true); setShowNoteInput(false); }} style={{ justifyContent: "center" }}>+ Add highlight</Btn>
                {highlights.length === 0 ? (
                  <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 20 }}>
                    No highlights yet.<br />Select text and click 🖊 Highlight.
                  </div>
                ) : (
                  highlights.map(h => (
                    <div key={h.id} style={{ background: "#fef08a12", border: "1px solid #fef08a30", borderRadius: 10, padding: "10px 12px", position: "relative" }}>
                      <p style={{ fontSize: 13, color: "#fef08a", lineHeight: 1.6, margin: 0 }}>"{h.text}"</p>
                      <span onClick={() => setHighlights(hs => hs.filter(x => x.id !== h.id))}
                        style={{ position: "absolute", top: 8, right: 10, cursor: "pointer", color: MUTED, fontSize: 14 }}>✕</span>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Notes tab */}
            {activeTab === "notes" && (
              <>
                <Btn small onClick={() => { setShowNoteInput(true); setShowHighlightInput(false); }} style={{ justifyContent: "center" }}>+ Add note</Btn>
                {notes.length === 0 ? (
                  <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 20 }}>
                    No notes yet.<br />Click 🗒 Note to add one.
                  </div>
                ) : (
                  notes.map(n => (
                    <div key={n.id} style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", position: "relative" }}>
                      <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, margin: 0 }}>{n.text}</p>
                      <span onClick={() => setNotes(ns => ns.filter(x => x.id !== n.id))}
                        style={{ position: "absolute", top: 8, right: 10, cursor: "pointer", color: MUTED, fontSize: 14 }}>✕</span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
