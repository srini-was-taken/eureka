"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Btn from "@/components/ui/Btn";

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

// ── Flashcard Modal ───────────────────────────────────────────
function FlashcardModal({ onSave, onClose }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const inputStyle = {
    width: "100%", background: CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: "12px 14px", color: TEXT, fontSize: 14,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    resize: "none",
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 32, width: 460, boxShadow: `0 0 60px #00000080` }}>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24, letterSpacing: -0.5 }}>Create Flashcard</h3>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 7, letterSpacing: 0.4 }}>FRONT (question / term)</div>
          <textarea value={front} onChange={e => setFront(e.target.value)} rows={3} placeholder="e.g. What is conservation of angular momentum?" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 7, letterSpacing: 0.4 }}>BACK (answer / definition)</div>
          <textarea value={back} onChange={e => setBack(e.target.value)} rows={3} placeholder="e.g. In the absence of external torques, total angular momentum L = Iω remains constant." style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={() => { if (front.trim() && back.trim()) onSave({ front: front.trim(), back: back.trim() }); }} style={{ flex: 1, justifyContent: "center" }}>Save Card ✦</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Note Popup ────────────────────────────────────────────────
function NotePopup({ note, onClose, onDelete, style: s }) {
  return (
    <div style={{ position: "absolute", zIndex: 50, background: CARD, border: `1px solid ${TEAL}40`, borderRadius: 12, padding: "14px 16px", width: 240, boxShadow: "0 8px 32px #00000060", ...s }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: TEAL, fontWeight: 700 }}>🗒 NOTE · Page {note.page}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span onClick={onDelete} style={{ fontSize: 12, color: "#f87171", cursor: "pointer" }}>Delete</span>
          <span onClick={onClose} style={{ cursor: "pointer", color: MUTED }}>✕</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, margin: 0 }}>{note.text}</p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function FocusPage() {
  const router = useRouter();
  const [stage, setStage] = useState("upload");
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);

  // PDF.js state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]); // array of { canvas, pageNum }
  const [totalPages, setTotalPages] = useState(0);
  const pdfContainerRef = useRef();

  // Annotation mode
  const [mode, setMode] = useState(null); // null | "highlight" | "note"
  const [pendingNotePos, setPendingNotePos] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  // Annotations
  const [highlights, setHighlights] = useState([]); // { id, page, x, y, w, h, color }
  const [notes, setNotes] = useState([]);             // { id, page, x, y, text }
  const [activeNote, setActiveNote] = useState(null);

  // Drag-to-highlight
  const dragStart = useRef(null);
  const [draggingHighlight, setDraggingHighlight] = useState(null);

  // Pomodoro
  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const pct = ((25 * 60 - timer) / (25 * 60)) * 100;

  // Panel
  const [activeTab, setActiveTab] = useState("stats");
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTimer(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Load PDF.js and render
  useEffect(() => {
    if (!pdfFile || stage !== "session") return;

    async function loadPDF() {
      // Load pdfjs from CDN to avoid webpack/worker conflicts
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const pdfjsLib = window.pdfjsLib;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);

      const rendered = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        rendered.push({ canvas, pageNum: i, width: viewport.width, height: viewport.height });
      }
      setPages(rendered);
    }

    loadPDF();
  }, [pdfFile, stage]);

  function handleFile(file) {
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
    setFileName(file.name);
    setStage("session");
  }

  // ── Annotation handlers ───────────────────────────────────
  function getRelativePos(e, el) {
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onOverlayMouseDown(e, pageNum, overlayEl) {
    if (mode === "highlight") {
      const pos = getRelativePos(e, overlayEl);
      dragStart.current = { x: pos.x, y: pos.y, pageNum };
      setDraggingHighlight({ x: pos.x, y: pos.y, w: 0, h: 0, pageNum });
    }
  }

  function onOverlayMouseMove(e, pageNum, overlayEl) {
    if (mode === "highlight" && dragStart.current && dragStart.current.pageNum === pageNum) {
      const pos = getRelativePos(e, overlayEl);
      setDraggingHighlight({
        pageNum,
        x: Math.min(pos.x, dragStart.current.x),
        y: Math.min(pos.y, dragStart.current.y),
        w: Math.abs(pos.x - dragStart.current.x),
        h: Math.abs(pos.y - dragStart.current.y),
      });
    }
  }

  function onOverlayMouseUp(e, pageNum, overlayEl) {
    if (mode === "highlight" && dragStart.current && draggingHighlight) {
      if (draggingHighlight.w > 10 && draggingHighlight.h > 5) {
        setHighlights(h => [...h, { id: Date.now(), ...draggingHighlight }]);
      }
      dragStart.current = null;
      setDraggingHighlight(null);
    } else if (mode === "note") {
      const pos = getRelativePos(e, overlayEl);
      setPendingNotePos({ x: pos.x, y: pos.y, pageNum });
      setNoteInput("");
    }
  }

  function saveNote() {
    if (!noteInput.trim() || !pendingNotePos) return;
    setNotes(n => [...n, { id: Date.now(), ...pendingNotePos, text: noteInput.trim() }]);
    setPendingNotePos(null);
    setNoteInput("");
    setMode(null);
  }

  function reset() {
    setStage("upload");
    setPdfFile(null);
    setPages([]);
    setPdfDoc(null);
    setRunning(false);
    setTimer(25 * 60);
    setHighlights([]);
    setNotes([]);
    setMode(null);
    setFlashcards([]);
  }

  // ── UPLOAD ────────────────────────────────────────────────
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
        <p style={{ color: MUTED, fontSize: 15, marginBottom: 40 }}>Drop a PDF — render it distraction-free, highlight and annotate directly on the page.</p>
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
          <input id="pdf-input" type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      </div>
    </div>
  );

  // ── SESSION ───────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>

      {showFlashcardModal && (
        <FlashcardModal
          onSave={card => { setFlashcards(f => [...f, { id: Date.now(), ...card }]); setShowFlashcardModal(false); setActiveTab("flashcards"); }}
          onClose={() => setShowFlashcardModal(false)}
        />
      )}

      {/* Pending note input popup */}
      {pendingNotePos && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", background: CARD, border: `1px solid ${TEAL}50`, borderRadius: 14, padding: 20, width: 360, pointerEvents: "all", boxShadow: "0 8px 40px #00000080" }}>
            <div style={{ fontSize: 13, color: TEAL, fontWeight: 700, marginBottom: 12 }}>🗒 Add note — Page {pendingNotePos.pageNum}</div>
            <textarea
              autoFocus
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.metaKey && saveNote()}
              placeholder="Type your note here..."
              rows={3}
              style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small onClick={saveNote} style={{ flex: 1, justifyContent: "center" }}>Save Note</Btn>
              <Btn small variant="ghost" onClick={() => { setPendingNotePos(null); setMode(null); }}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ padding: "10px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, background: CARD, flexShrink: 0 }}>
        <Btn variant="ghost" small onClick={reset} style={{ padding: "6px 12px" }}>← Exit</Btn>
        <span style={{ fontSize: 12, color: MUTED, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>

        {/* Pomodoro */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", width: 44, height: 44 }}>
            <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="22" cy="22" r="18" fill="none" stroke={BORDER} strokeWidth="3" />
              <circle cx="22" cy="22" r="18" fill="none" stroke={TEAL} strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: TEAL }}>{fmt(timer).split(":")[0]}</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{fmt(timer)}</div>
            <div style={{ fontSize: 10, color: MUTED }}>Pomodoro · 25 min</div>
          </div>
          <Btn small variant={running ? "ghost" : "primary"} onClick={() => setRunning(r => !r)}>{running ? "⏸" : "▶ Start"}</Btn>
          <Btn small variant="ghost" onClick={() => { setTimer(25 * 60); setRunning(false); }}>↺</Btn>
        </div>

        {/* Annotation mode buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small variant={mode === "highlight" ? "primary" : "ghost"} onClick={() => setMode(m => m === "highlight" ? null : "highlight")}>
            🖊 {mode === "highlight" ? "Highlighting..." : "Highlight"}
          </Btn>
          <Btn small variant={mode === "note" ? "outline" : "ghost"} onClick={() => setMode(m => m === "note" ? null : "note")}>
            🗒 {mode === "note" ? "Click PDF..." : "Note"}
          </Btn>
          <Btn variant="outline" small onClick={() => router.push("/solver")}>Ask AI ✦</Btn>
        </div>
      </div>

      {/* Mode hint bar */}
      {mode && (
        <div style={{ padding: "8px 24px", background: mode === "highlight" ? "#fef08a12" : TEAL + "10", borderBottom: `1px solid ${mode === "highlight" ? "#fef08a30" : TEAL + "25"}`, fontSize: 12, color: mode === "highlight" ? "#fef08a" : TEAL, fontWeight: 600 }}>
          {mode === "highlight" ? "🖊 Click and drag on the PDF to highlight a region. Press Escape to cancel." : "🗒 Click anywhere on the PDF to drop a note. Press Escape to cancel."}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* PDF canvas area */}
        <div
          ref={pdfContainerRef}
          style={{ flex: 1, overflowY: "auto", background: "#0a0c0f", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
          onKeyDown={e => e.key === "Escape" && setMode(null)}
          tabIndex={0}
        >
          {pages.length === 0 && (
            <div style={{ color: MUTED, fontSize: 14, marginTop: 80 }}>Rendering PDF...</div>
          )}

          {pages.map(({ canvas, pageNum, width, height }) => {
            const pageHighlights = highlights.filter(h => h.page === pageNum);
            const pageNotes = notes.filter(n => n.page === pageNum);
            const isDraggingThisPage = draggingHighlight?.pageNum === pageNum;

            return (
              <div key={pageNum} style={{ position: "relative", boxShadow: "0 8px 60px #00000080", isolation: "isolate" }}>
                {/* Rendered PDF canvas */}
                <img
                  src={canvas.toDataURL()}
                  style={{ display: "block", width: Math.min(width, 780), height: "auto" }}
                  draggable={false}
                  alt={`Page ${pageNum}`}
                />

                {/* Annotation overlay */}
                <div
                  style={{ position: "absolute", inset: 0, zIndex: 20, cursor: mode === "highlight" ? "crosshair" : mode === "note" ? "cell" : "default", userSelect: "none" }}
                  onMouseDown={e => onOverlayMouseDown(e, pageNum, e.currentTarget)}
                  onMouseMove={e => onOverlayMouseMove(e, pageNum, e.currentTarget)}
                  onMouseUp={e => onOverlayMouseUp(e, pageNum, e.currentTarget)}
                >
                  {/* Saved highlights */}
                  {pageHighlights.map(h => {
                    const scaleX = Math.min(width, 780) / width;
                    return (
                      <div key={h.id}
                        onClick={() => setHighlights(hs => hs.filter(x => x.id !== h.id))}
                        title="Click to remove"
                        style={{ position: "absolute", left: h.x * scaleX, top: h.y * scaleX, width: h.w * scaleX, height: h.h * scaleX, background: "#fef08a50", border: "1px solid #fef08a80", cursor: "pointer", borderRadius: 2 }} />
                    );
                  })}

                  {/* Live drag preview */}
                  {isDraggingThisPage && draggingHighlight.w > 5 && (
                    <div style={{ position: "absolute", left: draggingHighlight.x, top: draggingHighlight.y, width: draggingHighlight.w, height: draggingHighlight.h, background: "#fef08a40", border: "2px dashed #fef08a", borderRadius: 2, pointerEvents: "none" }} />
                  )}

                  {/* Note pins */}
                  {pageNotes.map(n => {
                    const scaleX = Math.min(width, 780) / width;
                    return (
                      <div key={n.id}
                        onClick={e => { e.stopPropagation(); setActiveNote(activeNote?.id === n.id ? null : n); }}
                        style={{ position: "absolute", left: n.x * scaleX - 12, top: n.y * scaleX - 12, width: 24, height: 24, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", boxShadow: `0 2px 8px ${TEAL}60`, zIndex: 10 }}
                        title={n.text}>
                        🗒
                      </div>
                    );
                  })}
                </div>

                {/* Page number label */}
                <div style={{ position: "absolute", bottom: -22, left: 0, right: 0, textAlign: "center", fontSize: 11, color: MUTED }}>Page {pageNum} of {totalPages}</div>
              </div>
            );
          })}
        </div>

        {/* Active note popup — rendered outside canvas to avoid clipping */}
        {activeNote && (
          <div style={{ position: "fixed", bottom: 80, right: 280, zIndex: 100 }}>
            <NotePopup
              note={activeNote}
              onClose={() => setActiveNote(null)}
              onDelete={() => { setNotes(ns => ns.filter(n => n.id !== activeNote.id)); setActiveNote(null); }}
              style={{}}
            />
          </div>
        )}

        {/* Right panel */}
        <div style={{ width: 260, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", background: CARD, flexShrink: 0 }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            {[
              { key: "stats", label: "Stats" },
              { key: "highlights", label: `🖊 ${highlights.length}` },
              { key: "notes", label: `🗒 ${notes.length}` },
              { key: "flashcards", label: `✦ ${flashcards.length}` },
            ].map(tab => (
              <div key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ flex: 1, padding: "10px 4px", textAlign: "center", fontSize: 11, fontWeight: 600, cursor: "pointer", color: activeTab === tab.key ? TEAL : MUTED, borderBottom: `2px solid ${activeTab === tab.key ? TEAL : "transparent"}`, transition: "all .15s" }}>
                {tab.label}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Stats */}
            {activeTab === "stats" && (
              <>
                {[["Time Spent", fmt(25 * 60 - timer)], ["Highlights", highlights.length], ["Notes", notes.length], ["Flashcards", flashcards.length], ["Pages", totalPages]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 14px", background: CARD2, borderRadius: 10 }}>
                    <span style={{ color: MUTED }}>{k}</span>
                    <span style={{ fontWeight: 700, color: TEAL }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: BORDER, margin: "4px 0" }} />
                <Btn variant="outline" small style={{ justifyContent: "center" }} onClick={() => router.push("/feynman")}>✦ Test understanding</Btn>
              </>
            )}

            {/* Highlights */}
            {activeTab === "highlights" && (
              <>
                <Btn small onClick={() => setMode("highlight")} style={{ justifyContent: "center" }}>+ Highlight region</Btn>
                <p style={{ fontSize: 11, color: MUTED, textAlign: "center", margin: 0 }}>Click and drag on the PDF to highlight. Click a highlight to remove it.</p>
                {highlights.length === 0
                  ? <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 16 }}>No highlights yet.</div>
                  : highlights.map((h, i) => (
                    <div key={h.id} style={{ background: "#fef08a12", border: "1px solid #fef08a30", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#fef08a" }}>Highlight · Page {h.page}</span>
                      <span onClick={() => setHighlights(hs => hs.filter(x => x.id !== h.id))} style={{ cursor: "pointer", color: MUTED, fontSize: 14 }}>✕</span>
                    </div>
                  ))
                }
              </>
            )}

            {/* Notes */}
            {activeTab === "notes" && (
              <>
                <Btn small onClick={() => setMode("note")} style={{ justifyContent: "center" }}>+ Add note pin</Btn>
                <p style={{ fontSize: 11, color: MUTED, textAlign: "center", margin: 0 }}>Click anywhere on the PDF to drop a note pin. Click the pin to read it.</p>
                {notes.length === 0
                  ? <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 16 }}>No notes yet.</div>
                  : notes.map(n => (
                    <div key={n.id} onClick={() => setActiveNote(activeNote?.id === n.id ? null : n)}
                      style={{ background: CARD2, border: `1px solid ${activeNote?.id === n.id ? TEAL + "60" : BORDER}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
                      <div style={{ fontSize: 11, color: TEAL, fontWeight: 700, marginBottom: 4 }}>Page {n.page}</div>
                      <p style={{ fontSize: 12, color: TEXT, lineHeight: 1.5, margin: 0 }}>{n.text.length > 60 ? n.text.slice(0, 60) + "..." : n.text}</p>
                    </div>
                  ))
                }
              </>
            )}

            {/* Flashcards */}
            {activeTab === "flashcards" && (
              <>
                <Btn small onClick={() => setShowFlashcardModal(true)} style={{ justifyContent: "center" }}>+ Create Flashcard</Btn>
                {flashcards.length === 0
                  ? <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 16 }}>No flashcards yet. Create your first one.</div>
                  : flashcards.map(card => (
                    <div key={card.id}
                      onClick={() => setFlippedCards(f => ({ ...f, [card.id]: !f[card.id] }))}
                      style={{ background: flippedCards[card.id] ? TEAL + "12" : CARD2, border: `1px solid ${flippedCards[card.id] ? TEAL + "40" : BORDER}`, borderRadius: 12, padding: "14px 14px", cursor: "pointer", transition: "all .2s", position: "relative" }}>
                      <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
                        {flippedCards[card.id] ? "ANSWER" : "QUESTION"} · tap to flip
                      </div>
                      <p style={{ fontSize: 13, color: flippedCards[card.id] ? TEAL : TEXT, lineHeight: 1.5, margin: 0 }}>
                        {flippedCards[card.id] ? card.back : card.front}
                      </p>
                      <span onClick={e => { e.stopPropagation(); setFlashcards(f => f.filter(c => c.id !== card.id)); }} style={{ position: "absolute", top: 8, right: 10, cursor: "pointer", color: MUTED, fontSize: 13 }}>✕</span>
                    </div>
                  ))
                }
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}