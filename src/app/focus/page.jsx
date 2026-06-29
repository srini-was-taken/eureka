"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { F_ACCENT as TEAL, F_BG as BG, F_SURFACE as CARD, F_BORDER as CARD2, F_BORDER as BORDER, F_TEXT as TEXT, F_MUTED as MUTED } from "@/lib/theme";
import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

const INTER = "'Inter', system-ui, sans-serif";

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function FlashcardModal({ onSave, onClose }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const inputStyle = { width: "100%", background: "#0F1A14", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none", fontFamily: INTER, boxSizing: "border-box", resize: "none" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0F0F0F", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 32, width: 460, boxShadow: "0 0 60px #00000080" }}>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24, letterSpacing: -0.5, fontFamily: INTER }}>Create Flashcard</h3>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 7, letterSpacing: 0.4, fontFamily: INTER }}>FRONT (question / term)</div>
          <textarea value={front} onChange={e => setFront(e.target.value)} rows={3} placeholder="e.g. What is conservation of angular momentum?" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 7, letterSpacing: 0.4, fontFamily: INTER }}>BACK (answer / definition)</div>
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

function NotePopup({ note, onClose, onDelete, style: s }) {
  return (
    <div style={{ position: "absolute", zIndex: 50, background: CARD, border: `1px solid ${TEAL}40`, borderRadius: 12, padding: "14px 16px", width: 240, boxShadow: "0 8px 32px #00000060", ...s }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: TEAL, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, fontFamily: INTER }}>
          <Icon name="note" color={TEAL} size={11} /> NOTE · Page {note.page}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <span onClick={onDelete} style={{ fontSize: 12, color: "#f87171", cursor: "pointer" }}>Delete</span>
          <span onClick={onClose} style={{ cursor: "pointer", color: MUTED }}>✕</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, margin: 0, fontFamily: INTER }}>{note.text}</p>
    </div>
  );
}

export default function FocusPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stage, setStage] = useState("upload");
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pdfId, setPdfId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const pdfContainerRef = useRef();

  const [mode, setMode] = useState(null);
  const [pendingNotePos, setPendingNotePos] = useState(null);
  const [noteInput, setNoteInput] = useState("");

  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

  const dragStart = useRef(null);
  const [draggingHighlight, setDraggingHighlight] = useState(null);

  const [timer, setTimer] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const pct = ((25 * 60 - timer) / (25 * 60)) * 100;

  const [activeTab, setActiveTab] = useState("note");
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [deckIdx, setDeckIdx] = useState(0);

  const [questions, setQuestions] = useState([]);
  const [genQLoading, setGenQLoading] = useState(false);
  const [genQError, setGenQError] = useState("");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [pdfText, setPdfText] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  async function loadAnnotations(pid) {
    const { data } = await supabase.from("annotations").select("*").eq("pdf_id", pid);
    if (data) {
      setHighlights(data.filter(a => a.type === "highlight").map(a => ({ id: a.id, page: a.page, x: a.x, y: a.y, w: a.w, h: a.h, pageNum: a.page })));
      setNotes(data.filter(a => a.type === "note").map(a => ({ id: a.id, page: a.page, x: a.x, y: a.y, text: a.text, pageNum: a.page })));
    }
  }

  async function saveAnnotations(pid, currentHighlights, currentNotes) {
    if (!pid) return;
    await supabase.from("annotations").delete().eq("pdf_id", pid);
    const rows = [
      ...currentHighlights.map(h => ({ pdf_id: pid, user_id: userId, type: "highlight", page: h.pageNum || h.page, x: h.x, y: h.y, w: h.w, h: h.h, text: null })),
      ...currentNotes.map(n => ({ pdf_id: pid, user_id: userId, type: "note", page: n.pageNum || n.page, x: n.x, y: n.y, w: null, h: null, text: n.text })),
    ];
    if (rows.length > 0) await supabase.from("annotations").insert(rows);
  }

  useEffect(() => {
    if (!running) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return;
    }
    const enterFullscreen = async () => {
      try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); }
      catch (e) { console.warn("Fullscreen request failed:", e); }
    };
    enterFullscreen();
    const t = setInterval(() => setTimer(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!pdfFile || stage !== "session") return;
    async function loadPDF() {
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = resolve; script.onerror = reject;
          document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const pdfjsLib = window.pdfjsLib;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      const rendered = [];
      let extractedText = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        const tc = await page.getTextContent();
        extractedText += tc.items.map(i => i.str).join(" ") + "\n";
        rendered.push({ canvas, pageNum: i, width: viewport.width, height: viewport.height });
      }
      setPages(rendered);
      setPdfText(extractedText);
    }
    loadPDF();
  }, [pdfFile, stage]);

  async function handleFile(file) {
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
    setFileName(file.name);
    setStage("session");
    if (userId) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("filename", file.name);
        const res = await fetch("/api/pdf", { method: "POST", body: form });
        if (res.ok) {
          const { pdf_id } = await res.json();
          setPdfId(pdf_id);
          await loadAnnotations(pdf_id);
        }
      } catch (e) { console.warn("PDF upload to cloud failed:", e); }
    }
  }

  async function generateQuestions() {
    if (!pdfText || genQLoading) return;
    setGenQLoading(true); setGenQError(""); setQuestions([]); setRevealedAnswers({});
    try {
      const res = await fetch("/api/pdf/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pdfText, topic: fileName }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuestions(data.questions || []);
      if (!data.questions?.length) setGenQError("Couldn't generate questions. Try a PDF with more text.");
      else setActiveTab("quiz");
    } catch { setGenQError("Something went wrong generating questions."); }
    setGenQLoading(false);
  }

  function getRelativePos(e, el) {
    const rect = el.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
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
      setDraggingHighlight({ pageNum, x: Math.min(pos.x, dragStart.current.x), y: Math.min(pos.y, dragStart.current.y), w: Math.abs(pos.x - dragStart.current.x), h: Math.abs(pos.y - dragStart.current.y) });
    }
  }

  function onOverlayMouseUp(e, pageNum, overlayEl) {
    if (mode === "highlight" && dragStart.current && draggingHighlight) {
      if (draggingHighlight.w > 0.005 && draggingHighlight.h > 0.003) setHighlights(h => [...h, { id: Date.now(), ...draggingHighlight }]);
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
    setPendingNotePos(null); setNoteInput(""); setMode(null);
  }

  async function exitSession() {
    if (pdfId) await saveAnnotations(pdfId, highlights, notes);
    setStage("upload"); setPdfFile(null); setPages([]); setPdfDoc(null);
    setRunning(false); setTimer(25 * 60); setHighlights([]); setNotes([]);
    setMode(null); setFlashcards([]); setPdfId(null);
  }

  // ── UPLOAD STAGE ──────────────────────────────────────────
  if (stage === "upload") return (
    <div className="focus-mode" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: INTER }}>
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn context="focus" variant="ghost" small onClick={() => router.push("/dashboard")} style={{ padding: "7px 12px" }}>← Dashboard</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="eye" color={TEAL} size={15} />
          <span style={{ fontWeight: 700, color: TEXT, fontFamily: INTER }}>Focus Mode</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, background: "radial-gradient(ellipse, #4CAF7210, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 250, height: 250, background: "radial-gradient(ellipse, #2D6B4015, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "relative", textAlign: "center", maxWidth: 520 }}>
          <div style={{ width: 72, height: 72, background: `${TEAL}18`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", border: `1px solid ${TEAL}25`, boxShadow: `0 0 40px ${TEAL}18` }}>
            <Icon name="eye" color={TEAL} size={32} />
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5, fontFamily: INTER, color: TEXT }}>Enter the forest.</h2>
          <p style={{ color: MUTED, fontSize: 15, marginBottom: 40, lineHeight: 1.75, fontFamily: INTER }}>Drop a PDF — render it distraction-free, highlight and annotate directly on the page.</p>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => document.getElementById("pdf-input").click()}
            style={{ border: `2px dashed ${dragging ? TEAL : BORDER}`, borderRadius: 18, padding: "48px 40px", cursor: uploading ? "wait" : "pointer", background: dragging ? TEAL + "10" : "#0F1A14", transition: "all .2s", boxShadow: dragging ? `0 0 30px ${TEAL}20` : "none" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Icon name="upload" color={dragging ? TEAL : MUTED} size={32} /></div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: TEXT, fontFamily: INTER }}>{uploading ? "Uploading..." : "Click to upload or drag & drop"}</div>
            <div style={{ color: MUTED, fontSize: 12, fontFamily: INTER }}>PDF files only · Your session stays private</div>
            <input id="pdf-input" type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
      </div>
    </div>
  );

  // ── SESSION STAGE ─────────────────────────────────────────
  return (
    <div className="focus-mode" style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: INTER }}>
      <style>{`
        @media (max-width: 768px) {
          .focus-topbar { padding: 8px 12px !important; flex-wrap: wrap !important; }
          .focus-fname { display: none !important; }
        }
      `}</style>

      {showFlashcardModal && (
        <FlashcardModal
          onSave={card => { setFlashcards(f => [...f, { id: Date.now(), ...card }]); setShowFlashcardModal(false); setActiveTab("flashcards"); }}
          onClose={() => setShowFlashcardModal(false)}
        />
      )}

      {pendingNotePos && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", background: CARD, border: `1px solid ${TEAL}50`, borderRadius: 14, padding: 20, width: 360, pointerEvents: "all", boxShadow: "0 8px 40px #00000080" }}>
            <div style={{ fontSize: 13, color: TEAL, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: INTER }}>
              <Icon name="note" color={TEAL} size={13} /> Add note — Page {pendingNotePos.pageNum}
            </div>
            <textarea autoFocus value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === "Enter" && e.metaKey && saveNote()} placeholder="Type your note here..." rows={3}
              style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", color: TEXT, fontSize: 13, outline: "none", fontFamily: INTER, resize: "none", boxSizing: "border-box", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small onClick={saveNote} style={{ flex: 1, justifyContent: "center" }}>Save Note</Btn>
              <Btn small variant="ghost" onClick={() => { setPendingNotePos(null); setMode(null); }}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="focus-topbar" style={{ padding: "10px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, background: CARD, flexShrink: 0 }}>
        <Btn context="focus" variant="ghost" small onClick={exitSession} style={{ padding: "6px 12px", opacity: 0.6 }}>← Exit</Btn>
        <span className="focus-fname" style={{ fontSize: 11.5, color: MUTED, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
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
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, color: TEXT, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(timer)}</div>
            <div style={{ fontSize: 10, color: MUTED }}>Pomodoro · 25 min</div>
          </div>
          <Btn context="focus" small variant={running ? "ghost" : "primary"} onClick={() => setRunning(r => !r)}>{running ? "⏸" : "▶ Start"}</Btn>
          <Btn context="focus" small variant="ghost" onClick={() => { setTimer(25 * 60); setRunning(false); }}>↺</Btn>
        </div>
      </div>

      {mode && (
        <div style={{ padding: "6px 24px", background: mode === "highlight" ? "#fef08a08" : TEAL + "0A", borderBottom: `1px solid ${mode === "highlight" ? "#fef08a20" : TEAL + "18"}`, fontSize: 11.5, color: mode === "highlight" ? "#fef08a" : TEAL, fontWeight: 600, fontFamily: INTER }}>
          {mode === "highlight" ? "Drag to highlight · Esc to cancel" : "Click on PDF to pin a note · Esc to cancel"}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Full-width tab bar */}
        <div style={{ display: "flex", justifyContent: "center", borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0, overflowX: "auto" }}>
          {[
            { key: "note",       label: "Note"       },
            { key: "quiz",       label: "Quiz",       badge: questions.length || null },
            { key: "flashcards", label: "Flashcards", badge: flashcards.length || null },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <div key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "16px 32px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                  fontFamily: "var(--font-syne, inherit)", fontSize: 15, fontWeight: isActive ? 700 : 600,
                  color: isActive ? TEAL : MUTED,
                  background: isActive ? TEAL + "08" : "transparent",
                  borderBottom: `2px solid ${isActive ? TEAL : "transparent"}`,
                  transition: "all .15s", whiteSpace: "nowrap", flexShrink: 0
                }}>
                {tab.label}
                {tab.badge ? <span style={{ fontSize: 10, fontWeight: 800, background: isActive ? TEAL + "25" : "rgba(255,255,255,0.1)", color: isActive ? TEAL : MUTED, borderRadius: 999, padding: "2px 8px" }}>{tab.badge}</span> : null}
              </div>
            );
          })}
        </div>

        {/* Tab content area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── NOTE TAB — PDF viewer ── */}
          {activeTab === "note" && (
            <div ref={pdfContainerRef} style={{ flex: 1, overflowY: "auto", background: "#080F0B", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
              onKeyDown={e => e.key === "Escape" && setMode(null)} tabIndex={0}>
              {pages.length === 0 && <div style={{ color: MUTED, fontSize: 14, marginTop: 80, fontFamily: INTER }}>Rendering PDF...</div>}
              {pages.map(({ canvas, pageNum, width }) => {
                const pageHighlights = highlights.filter(h => (h.pageNum || h.page) === pageNum);
                const pageNotes = notes.filter(n => (n.pageNum || n.page) === pageNum);
                const isDraggingThisPage = draggingHighlight?.pageNum === pageNum;
                return (
                  <div key={pageNum} style={{ position: "relative", boxShadow: "0 8px 60px #00000080", isolation: "isolate" }}>
                    <img src={canvas.toDataURL()} style={{ display: "block", width: Math.min(width, 860), height: "auto", maxWidth: "calc(100vw - 32px)" }} draggable={false} alt={`Page ${pageNum}`} />
                    <div style={{ position: "absolute", inset: 0, zIndex: 20, cursor: mode === "highlight" ? "crosshair" : mode === "note" ? "cell" : "default", userSelect: "none" }}
                      onMouseDown={e => onOverlayMouseDown(e, pageNum, e.currentTarget)}
                      onMouseMove={e => onOverlayMouseMove(e, pageNum, e.currentTarget)}
                      onMouseUp={e => onOverlayMouseUp(e, pageNum, e.currentTarget)}>
                      {pageHighlights.map(h => (
                        <div key={h.id} onClick={() => setHighlights(hs => hs.filter(x => x.id !== h.id))} title="Click to remove"
                          style={{ position: "absolute", left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%`, background: "#fef08a50", border: "1px solid #fef08a80", cursor: "pointer", borderRadius: 2 }} />
                      ))}
                      {isDraggingThisPage && draggingHighlight.w > 0.002 && (
                        <div style={{ position: "absolute", left: `${draggingHighlight.x * 100}%`, top: `${draggingHighlight.y * 100}%`, width: `${draggingHighlight.w * 100}%`, height: `${draggingHighlight.h * 100}%`, background: "#fef08a40", border: "2px dashed #fef08a", borderRadius: 2, pointerEvents: "none" }} />
                      )}
                      {pageNotes.map(n => (
                        <div key={n.id} onClick={e => { e.stopPropagation(); setActiveNote(activeNote?.id === n.id ? null : n); }}
                          style={{ position: "absolute", left: `calc(${n.x * 100}% - 12px)`, top: `calc(${n.y * 100}% - 12px)`, width: 24, height: 24, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, cursor: "pointer", boxShadow: `0 2px 8px ${TEAL}60`, zIndex: 10 }} title={n.text}>🗒</div>
                      ))}
                    </div>
                    <div style={{ position: "absolute", bottom: -22, left: 0, right: 0, textAlign: "center", fontSize: 11, color: MUTED, fontFamily: INTER }}>Page {pageNum} of {totalPages}</div>
                  </div>
                );
              })}
              {activeNote && (
                <div style={{ position: "fixed", bottom: 80, right: 32, zIndex: 100 }}>
                  <NotePopup note={activeNote} onClose={() => setActiveNote(null)} onDelete={() => { setNotes(ns => ns.filter(n => n.id !== activeNote.id)); setActiveNote(null); }} style={{}} />
                </div>
              )}
            </div>
          )}

          {/* ── QUIZ TAB ── */}
          {activeTab === "quiz" && (
            <div style={{ flex: 1, overflowY: "auto", background: "#080F0B", padding: "40px clamp(16px,5vw,80px)" }}>
              {genQError && <p style={{ color: "#f87171", fontSize: 13, fontFamily: INTER, marginBottom: 16 }}>{genQError}</p>}
              {questions.length === 0 ? (
                <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: TEAL + "15", border: `1px solid ${TEAL}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>📋</div>
                  <h3 style={{ fontFamily: INTER, fontWeight: 800, fontSize: 20, color: TEXT, marginBottom: 10 }}>No quiz generated yet.</h3>
                  <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 24 }}>Load a PDF then click "Generate Quiz" above.</p>
                  <div onClick={generateQuestions} style={{ display: "inline-block", padding: "12px 28px", background: TEAL, borderRadius: 10, fontFamily: INTER, fontWeight: 700, fontSize: 14, color: "#0C1510", cursor: pdfText ? "pointer" : "not-allowed", opacity: pdfText ? 1 : 0.4 }}>
                    {genQLoading ? "Generating…" : "Generate Quiz Now"}
                  </div>
                </div>
              ) : (() => {
                const safeIdx = Math.min(deckIdx, questions.length - 1);
                const q = questions[safeIdx];
                const qpct = ((safeIdx + 1) / questions.length) * 100;
                return (
                  <div style={{ maxWidth: 680, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                      <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>Quiz for <span style={{ color: TEXT, fontWeight: 600 }}>{fileName.replace(".pdf", "")}</span></div>
                      <div style={{ display: "flex", gap: 14 }}>
                        <span onClick={() => { setDeckIdx(0); setRevealedAnswers({}); }} style={{ fontFamily: INTER, fontSize: 13, color: MUTED, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = MUTED}>Reset</span>
                        <span onClick={() => setQuestions(q => [...q].sort(() => Math.random() - 0.5))} style={{ fontFamily: INTER, fontSize: 13, color: MUTED, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = MUTED}>↑↓ Shuffle</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: BORDER, borderRadius: 99, marginBottom: 32, overflow: "hidden" }}>
                      <div style={{ width: `${qpct}%`, height: "100%", background: "linear-gradient(90deg, #818cf8, #6d5fe6)", borderRadius: 99, transition: "width .4s cubic-bezier(.22,1,.36,1)" }} />
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
                      <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Question {safeIdx + 1}</div>
                      <div style={{ fontFamily: INTER, fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1.45, marginBottom: 24 }}>{q.question}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {Object.entries(q.options || {}).map(([k, v]) => {
                          const isCorrect = revealedAnswers[safeIdx] && k === q.answer;
                          const isWrong   = revealedAnswers[safeIdx] && k !== q.answer;
                          return (
                            <div key={k} onClick={() => !revealedAnswers[safeIdx] && setRevealedAnswers(r => ({ ...r, [safeIdx]: true }))}
                              style={{ padding: "14px 18px", borderRadius: 10, cursor: revealedAnswers[safeIdx] ? "default" : "pointer", border: `1px solid ${isCorrect ? TEAL + "80" : BORDER}`, background: isCorrect ? TEAL + "15" : "rgba(255,255,255,0.03)", fontFamily: INTER, fontSize: 14, color: isCorrect ? TEAL : isWrong ? MUTED : TEXT, fontWeight: isCorrect ? 700 : 400, transition: "all .15s", opacity: isWrong ? 0.45 : 1 }}
                              onMouseEnter={e => { if (!revealedAnswers[safeIdx]) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                              onMouseLeave={e => { if (!revealedAnswers[safeIdx]) e.currentTarget.style.background = isCorrect ? TEAL + "15" : "rgba(255,255,255,0.03)"; }}>
                              <span style={{ fontWeight: 700, marginRight: 8, color: isCorrect ? TEAL : MUTED }}>({k})</span> {v}
                            </div>
                          );
                        })}
                      </div>
                      {!revealedAnswers[safeIdx] && (
                        <div onClick={() => setRevealedAnswers(r => ({ ...r, [safeIdx]: true }))} style={{ marginTop: 16, fontFamily: INTER, fontSize: 13, color: TEAL, cursor: "pointer", fontWeight: 600 }}>Reveal answer →</div>
                      )}
                      {revealedAnswers[safeIdx] && (
                        <div style={{ marginTop: 18, padding: "12px 16px", background: TEAL + "0A", border: `1px solid ${TEAL}20`, borderRadius: 10, fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.65 }}>
                          <span style={{ color: TEAL, fontWeight: 700 }}>({q.answer})</span> {q.explanation}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>Question {safeIdx + 1} of {questions.length}</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div onClick={() => setDeckIdx(i => Math.max(0, i - 1))} style={{ padding: "9px 20px", borderRadius: 9, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 13, fontWeight: 600, color: MUTED, cursor: safeIdx > 0 ? "pointer" : "default", opacity: safeIdx > 0 ? 1 : 0.3 }}>← Prev</div>
                        <div onClick={() => setDeckIdx(i => Math.min(questions.length - 1, i + 1))} style={{ padding: "9px 20px", borderRadius: 9, background: TEAL, fontFamily: INTER, fontSize: 13, fontWeight: 700, color: "#0C1510", cursor: safeIdx < questions.length - 1 ? "pointer" : "default", opacity: safeIdx < questions.length - 1 ? 1 : 0.35 }}>Next →</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── FLASHCARDS TAB ── */}
          {activeTab === "flashcards" && (
            <div style={{ flex: 1, overflowY: "auto", background: "#080F0B", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px clamp(16px,5vw,60px)" }}>
              <div style={{ width: "100%", maxWidth: 640, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: INTER, fontSize: 22, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>{fileName.replace(".pdf", "")}</div>
                  <div onClick={() => setShowFlashcardModal(true)}
                    style={{ padding: "8px 16px", borderRadius: 9, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 13, fontWeight: 600, color: TEXT, cursor: "pointer", background: "rgba(255,255,255,0.04)", flexShrink: 0, marginLeft: 16 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = TEAL + "50"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                    + New Card
                  </div>
                </div>
              </div>

              {flashcards.length === 0 ? (
                <div style={{ maxWidth: 480, textAlign: "center", marginTop: 40 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "#818cf815", border: "1px solid #818cf830", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>🃏</div>
                  <h3 style={{ fontFamily: INTER, fontWeight: 800, fontSize: 20, color: TEXT, marginBottom: 10 }}>No flashcards yet.</h3>
                  <p style={{ fontFamily: INTER, fontSize: 14, color: MUTED, lineHeight: 1.7, marginBottom: 24 }}>Create cards from what you're reading — questions on the front, answers on the back.</p>
                  <div onClick={() => setShowFlashcardModal(true)} style={{ display: "inline-block", padding: "12px 28px", background: "#818cf8", borderRadius: 10, fontFamily: INTER, fontWeight: 700, fontSize: 14, color: "#fff", cursor: "pointer" }}>Create first card</div>
                </div>
              ) : (() => {
                const safeIdx = Math.min(deckIdx, flashcards.length - 1);
                const currentCard = flashcards[safeIdx];
                const isFlipped = flippedCards[currentCard?.id];
                return (
                  <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
                      {flashcards.map((_, i) => (
                        <div key={i} onClick={() => setDeckIdx(i)} style={{ width: i === safeIdx ? 20 : 6, height: 6, borderRadius: 99, background: i === safeIdx ? TEAL : i < safeIdx ? "#818cf8" : BORDER, transition: "all .3s", cursor: "pointer" }} />
                      ))}
                    </div>

                    <div onClick={() => setFlippedCards(f => ({ ...f, [currentCard.id]: !f[currentCard.id] }))}
                      style={{ width: "100%", minHeight: 260, cursor: "pointer", position: "relative", borderRadius: 18 }}>
                      {/* Front */}
                      <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 36px", opacity: isFlipped ? 0 : 1, transition: "opacity .25s", pointerEvents: isFlipped ? "none" : "all" }}>
                        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: "clamp(16px,2.5vw,22px)", color: TEXT, lineHeight: 1.4, textAlign: "center", marginBottom: 28 }}>{currentCard?.front}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, borderRadius: 999, padding: "8px 18px" }}>
                          <span style={{ fontSize: 14 }}>↩</span>
                          <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED, fontWeight: 500 }}>Press to flip</span>
                        </div>
                      </div>
                      {/* Back */}
                      <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: `linear-gradient(135deg, ${TEAL}18, ${TEAL}08)`, border: `1px solid ${TEAL}40`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 36px", opacity: isFlipped ? 1 : 0, transition: "opacity .25s", pointerEvents: isFlipped ? "all" : "none", boxShadow: `0 8px 48px ${TEAL}15` }}>
                        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: "clamp(16px,2.5vw,22px)", color: TEXT, lineHeight: 1.4, textAlign: "center" }}>{currentCard?.back}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>Card {safeIdx + 1} of {flashcards.length}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div onClick={() => setDeckIdx(i => Math.max(0, i - 1))} style={{ padding: "10px 20px", borderRadius: 9, border: `1px solid ${BORDER}`, fontFamily: INTER, fontSize: 13, fontWeight: 600, color: MUTED, cursor: safeIdx > 0 ? "pointer" : "default", opacity: safeIdx > 0 ? 1 : 0.3 }}>← Prev</div>
                        <div onClick={() => setDeckIdx(i => Math.min(flashcards.length - 1, i + 1))} style={{ padding: "10px 22px", borderRadius: 9, background: TEXT, fontFamily: INTER, fontSize: 13, fontWeight: 700, color: "#0A0A0A", cursor: safeIdx < flashcards.length - 1 ? "pointer" : "default", opacity: safeIdx < flashcards.length - 1 ? 1 : 0.35, display: "flex", alignItems: "center", gap: 6 }}>Next →</div>
                        <div onClick={() => setFlashcards(f => { const next = f.filter(c => c.id !== currentCard.id); setDeckIdx(i => Math.min(i, next.length - 1)); return next; })} style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(248,113,113,0.25)", fontFamily: INTER, fontSize: 13, fontWeight: 600, color: "#f87171", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>✕</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
        </div>

        {/* Floating Action Bar */}
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 100,
          display: "flex", alignItems: "center", gap: 20, padding: "14px 28px",
          background: "rgba(10, 15, 12, 0.75)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 999, boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
        }}>
          <div onClick={() => setMode(m => m === "highlight" ? null : "highlight")}
            style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: INTER, color: mode === "highlight" ? "#fef08a" : MUTED, transition: "color .15s" }}>
            Highlight
          </div>
          <div onClick={() => setMode(m => m === "note" ? null : "note")}
            style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: INTER, color: mode === "note" ? TEAL : MUTED, transition: "color .15s" }}>
            Note
          </div>

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

          <div onClick={generateQuestions}
            style={{ cursor: pdfText && !genQLoading ? "pointer" : "default", fontSize: 13.5, fontWeight: 600, fontFamily: INTER, color: TEAL, opacity: pdfText ? 1 : 0.4, transition: "opacity .15s" }}>
            {genQLoading ? "Generating…" : "Generate Quiz"}
          </div>
          <div onClick={() => setShowFlashcardModal(true)}
            style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: INTER, color: "#818cf8", transition: "opacity .15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            + Card
          </div>
          <div onClick={() => { const params = new URLSearchParams(); if (pdfText) params.set("pdfText", pdfText.slice(0, 8000)); router.push(`/feynman?${params.toString()}`); }}
            style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: INTER, color: "#e879f9", transition: "opacity .15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.8"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Feynman It
          </div>
        </div>

      </div>
    </div>
  );
}
