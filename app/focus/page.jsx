"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function FlashcardModal({ onSave, onClose }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const inputStyle = { width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", color: TEXT, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "none" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 32, width: 460, boxShadow: "0 0 60px #00000080" }}>
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

function NotePopup({ note, onClose, onDelete, style: s }) {
  return (
    <div style={{ position: "absolute", zIndex: 50, background: CARD, border: `1px solid ${TEAL}40`, borderRadius: 12, padding: "14px 16px", width: 240, boxShadow: "0 8px 32px #00000060", ...s }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: TEAL, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="note" color={TEAL} size={11} /> NOTE · Page {note.page}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <span onClick={onDelete} style={{ fontSize: 12, color: "#f87171", cursor: "pointer" }}>Delete</span>
          <span onClick={onClose} style={{ cursor: "pointer", color: MUTED }}>✕</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, margin: 0 }}>{note.text}</p>
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

  const [activeTab, setActiveTab] = useState("stats");
  const [flashcards, setFlashcards] = useState([]);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});
  const [deckIdx, setDeckIdx] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);


  async function loadAnnotations(pid) {
    const { data } = await supabase
      .from("annotations")
      .select("*")
      .eq("pdf_id", pid);
    if (data) {
      setHighlights(data.filter(a => a.type === "highlight").map(a => ({ id: a.id, page: a.page, x: a.x, y: a.y, w: a.w, h: a.h, pageNum: a.page })));
      setNotes(data.filter(a => a.type === "note").map(a => ({ id: a.id, page: a.page, x: a.x, y: a.y, text: a.text, pageNum: a.page })));
    }
  }

  async function saveAnnotations(pid, currentHighlights, currentNotes) {
    if (!pid) return;
    // Delete existing and re-insert (simple full replace)
    await supabase.from("annotations").delete().eq("pdf_id", pid);
    const rows = [
      ...currentHighlights.map(h => ({ pdf_id: pid, user_id: userId, type: "highlight", page: h.pageNum || h.page, x: h.x, y: h.y, w: h.w, h: h.h, text: null })),
      ...currentNotes.map(n => ({ pdf_id: pid, user_id: userId, type: "note", page: n.pageNum || n.page, x: n.x, y: n.y, w: null, h: null, text: n.text })),
    ];
    if (rows.length > 0) {
      await supabase.from("annotations").insert(rows);
    }
  }

  useEffect(() => {
    if (!running) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }
      return;
    }

    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.warn("Fullscreen request failed:", e);
      }
    };

    enterFullscreen();

    const t = setInterval(() => setTimer(s => s > 0 ? s - 1 : 0), 1000);
    return () => {
      clearInterval(t);
    };
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
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        rendered.push({ canvas, pageNum: i, width: viewport.width, height: viewport.height });
      }
      setPages(rendered);
    }
    loadPDF();
  }, [pdfFile, stage]);

  async function handleFile(file) {
    if (!file || file.type !== "application/pdf") return;
    setPdfFile(file);
    setFileName(file.name);
    // Start the session immediately — don't block on upload
    setStage("session");

    // Upload to Supabase in the background (non-blocking)
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
      } catch (e) {
        // Silent fail — local session still works fine
        console.warn("PDF upload to cloud failed:", e);
      }
    }
  }


  function getRelativePos(e, el) {
    const rect = el.getBoundingClientRect();
    // Return normalised [0,1] fractions so coords are resolution-independent
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
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
      if (draggingHighlight.w > 0.005 && draggingHighlight.h > 0.003) {
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
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn variant="ghost" small onClick={() => router.push("/dashboard")} style={{ padding: "7px 12px" }}>← Back</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <span style={{ fontWeight: 700 }}>Focus Mode</span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><Icon name="eye" color={TEAL} size={44} /></div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: -0.5 }}>Upload your study material</h2>
        <p style={{ color: MUTED, fontSize: 15, marginBottom: 40 }}>Drop a PDF — render it distraction-free, highlight and annotate directly on the page.</p>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("pdf-input").click()}
          style={{ width: 500, border: `2px dashed ${dragging ? TEAL : BORDER}`, borderRadius: 18, padding: "52px 40px", textAlign: "center", cursor: uploading ? "wait" : "pointer", background: dragging ? TEAL + "08" : CARD, transition: "all .2s" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="upload" color={dragging ? TEAL : MUTED} size={36} /></div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{uploading ? "Uploading..." : "Click to upload or drag & drop"}</div>
          <div style={{ color: MUTED, fontSize: 13 }}>PDF files only</div>
          <input id="pdf-input" type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      </div>
    </div>
  );

  // ── SESSION STAGE ─────────────────────────────────────────
  return (
    <div style={{ height: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>

      {showFlashcardModal && (
        <FlashcardModal
          onSave={card => { setFlashcards(f => [...f, { id: Date.now(), ...card }]); setShowFlashcardModal(false); setActiveTab("flashcards"); }}
          onClose={() => setShowFlashcardModal(false)}
        />
      )}

      {pendingNotePos && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", background: CARD, border: `1px solid ${TEAL}50`, borderRadius: 14, padding: 20, width: 360, pointerEvents: "all", boxShadow: "0 8px 40px #00000080" }}>
            <div style={{ fontSize: 13, color: TEAL, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="note" color={TEAL} size={13} /> Add note — Page {pendingNotePos.pageNum}
            </div>
            <textarea autoFocus value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === "Enter" && e.metaKey && saveNote()} placeholder="Type your note here..." rows={3}
              style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small onClick={saveNote} style={{ flex: 1, justifyContent: "center" }}>Save Note</Btn>
              <Btn small variant="ghost" onClick={() => { setPendingNotePos(null); setMode(null); }}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ padding: "10px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, background: CARD, flexShrink: 0 }}>
        <Btn variant="ghost" small onClick={exitSession} style={{ padding: "6px 12px" }}>← Exit</Btn>
        <span style={{ fontSize: 12, color: MUTED, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
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
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small variant={mode === "highlight" ? "primary" : "ghost"} onClick={() => setMode(m => m === "highlight" ? null : "highlight")} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="highlight" color={mode === "highlight" ? "#000" : MUTED} size={14} />
            {mode === "highlight" ? "Highlighting..." : "Highlight"}
          </Btn>
          <Btn small variant={mode === "note" ? "outline" : "ghost"} onClick={() => setMode(m => m === "note" ? null : "note")} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Icon name="note" color={mode === "note" ? TEAL : MUTED} size={14} />
            {mode === "note" ? "Click PDF..." : "Note"}
          </Btn>

        </div>
      </div>

      {mode && (
        <div style={{ padding: "8px 24px", background: mode === "highlight" ? "#fef08a12" : TEAL + "10", borderBottom: `1px solid ${mode === "highlight" ? "#fef08a30" : TEAL + "25"}`, fontSize: 12, color: mode === "highlight" ? "#fef08a" : TEAL, fontWeight: 600 }}>
          {mode === "highlight" ? "Click and drag on the PDF to highlight. Press Esc to cancel." : "Click anywhere on the PDF to drop a note. Press Esc to cancel."}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* PDF canvas */}
        <div ref={pdfContainerRef} style={{ flex: 1, overflowY: "auto", background: "#0a0c0f", padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}
          onKeyDown={e => e.key === "Escape" && setMode(null)} tabIndex={0}>
          {pages.length === 0 && <div style={{ color: MUTED, fontSize: 14, marginTop: 80 }}>Rendering PDF...</div>}
          {pages.map(({ canvas, pageNum, width, height }) => {
            const pageHighlights = highlights.filter(h => (h.pageNum || h.page) === pageNum);
            const pageNotes = notes.filter(n => (n.pageNum || n.page) === pageNum);
            const isDraggingThisPage = draggingHighlight?.pageNum === pageNum;
            return (
              <div key={pageNum} style={{ position: "relative", boxShadow: "0 8px 60px #00000080", isolation: "isolate" }}>
                <img src={canvas.toDataURL()} style={{ display: "block", width: Math.min(width, 780), height: "auto" }} draggable={false} alt={`Page ${pageNum}`} />
                <div style={{ position: "absolute", inset: 0, zIndex: 20, cursor: mode === "highlight" ? "crosshair" : mode === "note" ? "cell" : "default", userSelect: "none" }}
                  onMouseDown={e => onOverlayMouseDown(e, pageNum, e.currentTarget)}
                  onMouseMove={e => onOverlayMouseMove(e, pageNum, e.currentTarget)}
                  onMouseUp={e => onOverlayMouseUp(e, pageNum, e.currentTarget)}>
                  {pageHighlights.map(h => (
                    // h.x/y/w/h are normalised [0,1] fractions — multiply by 100 for %
                    <div key={h.id}
                      onClick={() => setHighlights(hs => hs.filter(x => x.id !== h.id))}
                      title="Click to remove"
                      style={{
                        position: "absolute",
                        left: `${h.x * 100}%`, top: `${h.y * 100}%`,
                        width: `${h.w * 100}%`, height: `${h.h * 100}%`,
                        background: "#fef08a50", border: "1px solid #fef08a80",
                        cursor: "pointer", borderRadius: 2,
                      }}
                    />
                  ))}
                  {isDraggingThisPage && draggingHighlight.w > 0.002 && (
                    <div style={{
                      position: "absolute",
                      left: `${draggingHighlight.x * 100}%`, top: `${draggingHighlight.y * 100}%`,
                      width: `${draggingHighlight.w * 100}%`, height: `${draggingHighlight.h * 100}%`,
                      background: "#fef08a40", border: "2px dashed #fef08a",
                      borderRadius: 2, pointerEvents: "none",
                    }} />
                  )}
                  {pageNotes.map(n => (
                    <div key={n.id}
                      onClick={e => { e.stopPropagation(); setActiveNote(activeNote?.id === n.id ? null : n); }}
                      style={{
                        position: "absolute",
                        left: `calc(${n.x * 100}% - 12px)`, top: `calc(${n.y * 100}% - 12px)`,
                        width: 24, height: 24, background: TEAL, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, cursor: "pointer", boxShadow: `0 2px 8px ${TEAL}60`, zIndex: 10,
                      }}
                      title={n.text}
                    >🗒</div>
                  ))}
                </div>
                <div style={{ position: "absolute", bottom: -22, left: 0, right: 0, textAlign: "center", fontSize: 11, color: MUTED }}>Page {pageNum} of {totalPages}</div>
              </div>
            );
          })}
        </div>

        {activeNote && (
          <div style={{ position: "fixed", bottom: 80, right: 280, zIndex: 100 }}>
            <NotePopup note={activeNote} onClose={() => setActiveNote(null)} onDelete={() => { setNotes(ns => ns.filter(n => n.id !== activeNote.id)); setActiveNote(null); }} style={{}} />
          </div>
        )}

        {/* Right panel */}
        <div style={{ width: 280, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", background: CARD, flexShrink: 0 }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            {[
              { key: "stats", icon: "chart" },
              { key: "highlights", icon: "highlight" },
              { key: "notes", icon: "note" },
              { key: "flashcards", icon: "sparkle" },
            ].map(tab => (
              <div key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ flex: 1, padding: "13px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", borderBottom: `2px solid ${activeTab === tab.key ? TEAL : "transparent"}`, transition: "all .15s" }}>
                <Icon name={tab.icon} color={activeTab === tab.key ? TEAL : MUTED} size={15} />
                {tab.key === "highlights" && highlights.length > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: activeTab === tab.key ? TEAL : MUTED }}>{highlights.length}</span>
                )}
                {tab.key === "notes" && notes.length > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: activeTab === tab.key ? TEAL : MUTED }}>{notes.length}</span>
                )}
                {tab.key === "flashcards" && flashcards.length > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: activeTab === tab.key ? TEAL : MUTED }}>{flashcards.length}</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>

            {/* ── STATS TAB ── */}
            {activeTab === "stats" && (
              <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Big time ring */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0 4px" }}>
                  <div style={{ position: "relative", width: 100, height: 100 }}>
                    <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke={BORDER} strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke={TEAL} strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
                        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s" }} />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: TEAL, letterSpacing: 1 }}>{fmt(25 * 60 - timer)}</span>
                      <span style={{ fontSize: 9, color: MUTED, fontWeight: 600 }}>FOCUSED</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>{Math.round(pct)}% of session done</div>
                </div>

                {/* Stat grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Highlights", val: highlights.length, color: "#fef08a", icon: "highlight" },
                    { label: "Notes", val: notes.length, color: TEAL, icon: "note" },
                    { label: "Flashcards", val: flashcards.length, color: "#818cf8", icon: "sparkle" },
                    { label: "Pages", val: totalPages, color: "#fb923c", icon: "book" },
                  ].map(s => (
                    <div key={s.label} style={{ background: CARD2, borderRadius: 12, padding: "14px 12px", border: `1px solid ${BORDER}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <Icon name={s.icon} color={s.color} size={13} />
                        <span style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: 0.4 }}>{s.label.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: BORDER }} />
                <Btn variant="outline" small style={{ justifyContent: "center" }} onClick={() => router.push("/feynman")}>
                  Test understanding
                </Btn>
              </div>
            )}

            {/* ── HIGHLIGHTS TAB ── */}
            {activeTab === "highlights" && (
              <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                <Btn small onClick={() => setMode("highlight")} style={{ justifyContent: "center" }}>+ Highlight region</Btn>
                <p style={{ fontSize: 11, color: MUTED, textAlign: "center", margin: 0 }}>Click and drag on the PDF to highlight. Click a highlight to remove it.</p>
                {highlights.length === 0 ? (
                  <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 24, padding: "20px 0" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name="highlight" color={MUTED} size={28} /></div>
                    No highlights yet
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {highlights.map((h, i) => (
                      <div key={h.id} style={{ background: "#fef08a0d", border: "1px solid #fef08a25", borderRadius: 10, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, marginBottom: 2 }}>PAGE {h.pageNum || h.page}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 28, height: 8, background: "#fef08a50", borderRadius: 2, border: "1px solid #fef08a70" }} />
                            <span style={{ fontSize: 11, color: "#fef08a" }}>Highlight #{i + 1}</span>
                          </div>
                        </div>
                        <span onClick={() => setHighlights(hs => hs.filter(x => x.id !== h.id))} style={{ cursor: "pointer", color: MUTED, fontSize: 16, lineHeight: 1, padding: "0 4px" }}>✕</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NOTES TAB ── */}
            {activeTab === "notes" && (
              <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                <Btn small onClick={() => setMode("note")} style={{ justifyContent: "center" }}>+ Add note pin</Btn>
                <p style={{ fontSize: 11, color: MUTED, textAlign: "center", margin: 0 }}>Click anywhere on the PDF to drop a note pin.</p>
                {notes.length === 0 ? (
                  <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 24, padding: "20px 0" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name="note" color={MUTED} size={28} /></div>
                    No notes yet
                  </div>
                ) : (
                  notes.map(n => (
                    <div key={n.id} onClick={() => setActiveNote(activeNote?.id === n.id ? null : n)}
                      style={{ background: CARD2, border: `1px solid ${activeNote?.id === n.id ? TEAL + "50" : BORDER}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", transition: "all .15s", boxShadow: activeNote?.id === n.id ? `0 0 12px ${TEAL}18` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 18, height: 18, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon name="note" color="#000" size={10} />
                        </div>
                        <span style={{ fontSize: 10, color: TEAL, fontWeight: 700 }}>PAGE {n.pageNum || n.page}</span>
                      </div>
                      <p style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, margin: 0 }}>{n.text.length > 70 ? n.text.slice(0, 70) + "…" : n.text}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── FLASHCARDS TAB ── */}
            {activeTab === "flashcards" && (
              <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                <Btn small onClick={() => setShowFlashcardModal(true)} style={{ justifyContent: "center" }}>+ Create Flashcard</Btn>

                {flashcards.length === 0 ? (
                  <div style={{ textAlign: "center", color: MUTED, fontSize: 13, marginTop: 24, padding: "20px 0" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}><Icon name="sparkle" color={MUTED} size={30} /></div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>No flashcards yet</div>
                    <div style={{ fontSize: 11, lineHeight: 1.6 }}>Create cards from what you're reading to review later</div>
                  </div>
                ) : (() => {
                  const currentCard = flashcards[Math.min(deckIdx, flashcards.length - 1)];
                  const isFlipped = flippedCards[currentCard?.id];
                  const safeIdx = Math.min(deckIdx, flashcards.length - 1);
                  return (
                    <>
                      {/* Progress dots */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: MUTED }}>{safeIdx + 1} of {flashcards.length}</span>
                        <div style={{ display: "flex", gap: 3 }}>
                          {flashcards.map((_, i) => (
                            <div key={i} onClick={() => setDeckIdx(i)}
                              style={{ width: i === safeIdx ? 18 : 6, height: 5, borderRadius: 99, background: i === safeIdx ? TEAL : i < safeIdx ? "#818cf8" : BORDER, transition: "all .3s", cursor: "pointer" }} />
                          ))}
                        </div>
                      </div>

                      {/* Flip card */}
                      <div onClick={() => setFlippedCards(f => ({ ...f, [currentCard.id]: !f[currentCard.id] }))}
                        style={{ cursor: "pointer", position: "relative", height: 180 }}>
                        {/* Front */}
                        <div style={{
                          position: "absolute", inset: 0, borderRadius: 16,
                          background: `linear-gradient(135deg, #818cf8, #6d5fe6)`,
                          border: "1px solid #818cf840",
                          display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 18,
                          opacity: isFlipped ? 0 : 1, transition: "opacity .25s",
                          pointerEvents: isFlipped ? "none" : "all",
                          boxShadow: "0 8px 32px #818cf82a",
                        }}>
                          <div style={{ fontSize: 9, color: "#c4b5fd", fontWeight: 700, letterSpacing: 1 }}>QUESTION</div>
                          <p style={{ fontSize: 13, color: "#fff", lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{currentCard?.front}</p>
                          <div style={{ fontSize: 10, color: "#c4b5fd60", textAlign: "right" }}>tap to reveal</div>
                        </div>
                        {/* Back */}
                        <div style={{
                          position: "absolute", inset: 0, borderRadius: 16,
                          background: `linear-gradient(135deg, ${TEAL}e0, #1a9e90)`,
                          border: `1px solid ${TEAL}50`,
                          display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 18,
                          opacity: isFlipped ? 1 : 0, transition: "opacity .25s",
                          pointerEvents: isFlipped ? "all" : "none",
                          boxShadow: `0 8px 32px ${TEAL}30`,
                        }}>
                          <div style={{ fontSize: 9, color: "#0d0f12a0", fontWeight: 700, letterSpacing: 1 }}>ANSWER</div>
                          <p style={{ fontSize: 13, color: "#0d0f12", lineHeight: 1.65, margin: 0, fontWeight: 600 }}>{currentCard?.back}</p>
                          <div style={{ fontSize: 10, color: "#0d0f1260", textAlign: "right" }}>tap to flip back</div>
                        </div>
                      </div>

                      {/* Nav + delete */}
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn small variant="ghost" style={{ flex: 1, justifyContent: "center", opacity: safeIdx === 0 ? 0.3 : 1 }}
                          onClick={() => setDeckIdx(i => Math.max(0, i - 1))}>←</Btn>
                        <Btn small variant="ghost" style={{ flex: 1, justifyContent: "center", opacity: safeIdx === flashcards.length - 1 ? 0.3 : 1 }}
                          onClick={() => setDeckIdx(i => Math.min(flashcards.length - 1, i + 1))}>→</Btn>
                        <Btn small variant="ghost" style={{ color: "#f87171", padding: "6px 10px" }}
                          onClick={() => setFlashcards(f => { const next = f.filter(c => c.id !== currentCard.id); setDeckIdx(i => Math.min(i, next.length - 1)); return next; })}>✕</Btn>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
