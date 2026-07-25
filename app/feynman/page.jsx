"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Md from "@/components/ui/Md";
import { createClient } from "@/lib/supabase/client";
import { EXAM_CONFIG, DEFAULT_EXAM_KEY } from "@/lib/examConfig";
import { Suspense } from "react";

export default function FeynmanPage() {
  return (
    <Suspense>
      <FeynmanInner />
    </Suspense>
  );
}

// ── Inline PDF Mini-Viewer ────────────────────────────────────────────────────
function PdfMiniViewer({ file, highlightPageRange, style }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      const ab = await file.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({ data: ab }).promise;
      if (cancelled) return;
      setTotalPages(doc.numPages);
      const rendered = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1.1 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        rendered.push({ canvas, pageNum: i });
        if (cancelled) return;
      }
      setPages(rendered);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [file]);

  if (loading) return (
    <div style={{ textAlign: "center", color: MUTED, padding: 32, fontSize: 14, ...style }}>
      Rendering PDF...
    </div>
  );

  const { start, end } = highlightPageRange || {};

  return (
    <div style={{ overflowY: "auto", maxHeight: 460, borderRadius: 12, border: `1px solid ${BORDER}`, background: CARD2, ...style }}>
      {pages.map(({ canvas, pageNum }) => {
        const inRange = start && end ? (pageNum >= start && pageNum <= end) : true;
        return (
          <div key={pageNum} style={{
            position: "relative",
            borderBottom: `1px solid ${BORDER}`,
            opacity: inRange ? 1 : 0.35,
            transition: "opacity .2s",
          }}>
            <img
              src={canvas.toDataURL()}
              alt={`Page ${pageNum}`}
              style={{ width: "100%", display: "block" }}
            />
            <div style={{
              position: "absolute", top: 6, right: 8,
              background: inRange ? TEAL + "cc" : "#ffffff30",
              color: inRange ? "#000" : "#fff",
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
            }}>
              {pageNum}
              {inRange && start && <span style={{ marginLeft: 4 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Feynman Page ────────────────────────────────────────────────────────
function FeynmanInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Stage: pick → explain → feedback
  const [stage, setStage] = useState("pick");
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [examLabel, setExamLabel] = useState(EXAM_CONFIG[DEFAULT_EXAM_KEY].label);

  // Source material
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTotalPages, setPdfTotalPages] = useState(null);
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [extracting, setExtracting] = useState(false);

  // Page range
  const [pageStart, setPageStart] = useState("");
  const [pageEnd, setPageEnd] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pageRangeConfirmed, setPageRangeConfirmed] = useState(false);

  const fileInputRef = useRef();

  // Pre-fill from Focus Mode deep-link (?topic=...&pdfText=...)
  useEffect(() => {
    const t = searchParams.get("topic");
    const txt = searchParams.get("pdfText");
    if (t) setTopic(t);
    if (txt) { setSourceMaterial(txt); setAttachedFile({ name: "From Focus Mode", type: "focus" }); setPageRangeConfirmed(true); }
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("exam").eq("id", user.id).single();
      if (profile?.exam && EXAM_CONFIG[profile.exam]) setExamLabel(EXAM_CONFIG[profile.exam].label);
    });
  }, []);

  function clearAttachment() {
    setPdfFile(null); setSourceMaterial(""); setImageBase64(null);
    setAttachedFile(null); setPdfTotalPages(null);
    setPageStart(""); setPageEnd(""); setShowPdfPreview(false); setPageRangeConfirmed(false);
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setExtracting(true); setError("");

    if (file.type === "application/pdf") {
      // First: get page count by parsing the full PDF (fast, just metadata)
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/pdf/extract", { method: "POST", body: form });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPdfFile(file);
        setPdfTotalPages(data.pages);
        setSourceMaterial(data.text || "");
        setAttachedFile({ name: file.name, type: "pdf" });
        setShowPdfPreview(true);
        // Don't confirm range yet — user needs to pick pages
      } catch {
        setError("Could not read PDF. Try an image instead.");
      }
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result);
        setSourceMaterial("");
        setAttachedFile({ name: file.name, type: "image" });
        setPageRangeConfirmed(true); // images go straight through
      };
      reader.readAsDataURL(file);
    }
    setExtracting(false);
  }

  async function confirmPageRange() {
    if (!pdfFile) { setPageRangeConfirmed(true); setShowPdfPreview(false); return; }
    const s = parseInt(pageStart) || 1;
    const e = parseInt(pageEnd) || pdfTotalPages;
    if (s > e || s < 1 || e > pdfTotalPages) {
      setError(`Page range must be between 1 and ${pdfTotalPages}.`); return;
    }
    setError("");
    setExtracting(true);
    try {
      const form = new FormData();
      form.append("file", pdfFile);
      form.append("pageStart", String(s));
      form.append("pageEnd", String(e));
      const res = await fetch("/api/pdf/extract", { method: "POST", body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSourceMaterial(data.text || "");
      setPageStart(String(s)); setPageEnd(String(e));
      setPageRangeConfirmed(true);
      setShowPdfPreview(false);
    } catch {
      setError("Failed to extract page range. Try again.");
    }
    setExtracting(false);
  }

  async function evaluate() {
    if (explanation.length < 100 || loading) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/feynman/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic, explanation, sourceMaterial,
          imageBase64: imageBase64 || null,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setFeedback(data);
      setStage("feedback");
      if (userId) {
        await supabase.from("feynman_attempts").insert({
          user_id: userId, topic, explanation,
          score: data.score, strong: data.strong, gaps: data.gaps, follow_up: data.followUp,
        });
      }
    } catch {
      setError("Something went wrong. Check your API key and try again.");
    }
    setLoading(false);
  }

  const pageRangeLabel = pageStart && pageEnd ? `Pages ${pageStart}–${pageEnd}` : (pdfTotalPages ? `All ${pdfTotalPages} pages` : null);

  const inputStyle = {
    background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12,
    padding: "16px 20px", color: TEXT, fontSize: 15, outline: "none",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleFileSelect} />

      {/* Header */}
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn variant="ghost" small onClick={() => router.push("/dashboard")} style={{ padding: "7px 12px" }}>← Back</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <div style={{ width: 36, height: 36, background: "#818cf820", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="feynman" color="#818cf8" size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Feynman Explainer</div>
          <div style={{ fontSize: 11, color: MUTED }}>Explain it. We'll find the gaps.</div>
        </div>
        <div style={{ marginLeft: "auto" }}><Badge color="#818cf8">{examLabel}</Badge></div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 28px" }}>

        {/* ── Stage: Pick topic + attach source ── */}
        {stage === "pick" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="feynman" color="#818cf8" size={36} /></div>
              <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 10 }}>What concept do you want to test?</h2>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6 }}>Pick a topic. Upload your notes or textbook. Then explain it like you're teaching it.</p>
            </div>

            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Type a concept or topic..." style={{ ...inputStyle, marginBottom: 16, border: `1px solid ${topic ? TEAL + "60" : BORDER}` }} />

            {/* PDF mini-viewer + page range picker */}
            {showPdfPreview && pdfFile && (
              <Card style={{ padding: 24, marginBottom: 16, border: `1px solid ${TEAL}40` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    <Icon name="upload" color={TEAL} size={14} style={{ marginRight: 6 }} />
                    {attachedFile?.name}
                    {pdfTotalPages && <span style={{ color: MUTED, fontWeight: 400, marginLeft: 8, fontSize: 13 }}>({pdfTotalPages} pages total)</span>}
                  </div>
                  <span onClick={clearAttachment} style={{ color: MUTED, cursor: "pointer", fontSize: 18 }}>✕</span>
                </div>

                {/* Page range inputs */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, marginBottom: 10, letterSpacing: 0.4 }}>
                    SELECT PAGE RANGE FOR EXPLANATION <span style={{ fontWeight: 400 }}>(optional — leave blank for all pages)</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 5 }}>FROM PAGE</div>
                      <input type="number" min={1} max={pdfTotalPages} value={pageStart}
                        onChange={e => setPageStart(e.target.value)}
                        placeholder={`1`}
                        style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <span style={{ color: MUTED, marginTop: 16 }}>→</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 5 }}>TO PAGE</div>
                      <input type="number" min={1} max={pdfTotalPages} value={pageEnd}
                        onChange={e => setPageEnd(e.target.value)}
                        placeholder={`${pdfTotalPages || "last"}`}
                        style={{ width: "100%", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <Btn small onClick={confirmPageRange} style={{ marginTop: 16, opacity: extracting ? 0.6 : 1 }}>
                      {extracting ? "Extracting..." : "Confirm →"}
                    </Btn>
                  </div>
                  {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{error}</p>}
                </div>

                {/* Inline PDF preview */}
                <PdfMiniViewer
                  file={pdfFile}
                  highlightPageRange={pageStart && pageEnd ? { start: parseInt(pageStart), end: parseInt(pageEnd) } : null}
                />
              </Card>
            )}

            {/* Attachment chip (when range confirmed or image attached) */}
            {pageRangeConfirmed && attachedFile && !showPdfPreview && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, background: TEAL + "0d", border: `1px solid ${TEAL}30`, borderRadius: 10, padding: "10px 14px" }}>
                <Icon name={attachedFile.type === "image" ? "image" : "upload"} color={TEAL} size={16} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>{attachedFile.name}</div>
                  {pageRangeLabel && <div style={{ fontSize: 11, color: MUTED }}>{pageRangeLabel}</div>}
                </div>
                <span onClick={clearAttachment} style={{ color: MUTED, cursor: "pointer", fontSize: 16 }}>✕</span>
              </div>
            )}

            {/* Upload drop zone (only show if nothing attached yet) */}
            {!attachedFile && !showPdfPreview && (
              <div
                onClick={() => !extracting && fileInputRef.current?.click()}
                style={{
                  background: CARD2, border: `2px dashed ${BORDER}`, borderRadius: 14,
                  padding: 22, textAlign: "center", marginBottom: 16,
                  cursor: extracting ? "wait" : "pointer", transition: "all .2s",
                }}
              >
                {extracting ? (
                  <><div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name="clockalt" color={MUTED} size={20} /></div>
                    <div style={{ fontSize: 14, color: MUTED }}>Reading PDF...</div></>
                ) : (
                  <><div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name="upload" color={MUTED} size={22} /></div>
                    <div style={{ fontSize: 14, color: MUTED }}>Upload your notes or textbook</div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>PDF · Image — optional, but makes evaluation much more accurate</div></>
                )}
              </div>
            )}

            {error && !showPdfPreview && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <Btn
              style={{ width: "100%", justifyContent: "center", padding: 15, fontSize: 15, opacity: topic ? 1 : 0.45 }}
              onClick={() => {
                if (!topic) return;
                if (pdfFile && !pageRangeConfirmed) { setError("Please confirm the page range first."); return; }
                setError(""); setStage("explain");
              }}
            >
              Start Explaining →
            </Btn>
          </>
        )}

        {/* ── Stage: Write explanation (PDF hidden) ── */}
        {stage === "explain" && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
                <Badge color="#818cf8">{topic}</Badge>
                {attachedFile && (
                  <span style={{ fontSize: 12, color: TEAL, background: TEAL + "15", borderRadius: 6, padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Icon name={attachedFile.type === "image" ? "image" : "upload"} color={TEAL} size={12} />
                    {pageRangeLabel || attachedFile.name}
                  </span>
                )}
                <span style={{ color: MUTED, fontSize: 13 }}>No notes, no looking back.</span>
              </div>
              <Card style={{ padding: 24, background: "#818cf810", border: "1px solid #818cf830" }}>
                <p style={{ color: "#c4b5fd", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  Imagine you're explaining <strong>{topic}</strong> to a classmate who's never heard of it. Use your own words, examples, intuition.
                  {attachedFile && " Your source material is hidden — explain from memory."}
                </p>
              </Card>
            </div>
            <textarea
              value={explanation} onChange={e => setExplanation(e.target.value)}
              placeholder="Start typing your explanation here..."
              style={{ width: "100%", height: 260, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px", color: TEXT, fontSize: 14, lineHeight: 1.8, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
              <span style={{ fontSize: 13, color: explanation.length < 100 ? "#fb923c" : MUTED }}>
                {explanation.length < 100 ? `${explanation.length}/100 — write at least 100 characters` : `${explanation.length} characters`}
              </span>
              <Btn onClick={evaluate} disabled={explanation.length < 100} style={{ padding: "13px 28px", opacity: explanation.length < 100 ? 0.45 : 1 }}>
                {loading ? "Evaluating..." : "Submit for Evaluation"}
              </Btn>
            </div>
          </>
        )}

        {/* ── Stage: Feedback (PDF shown again for verification) ── */}
        {stage === "feedback" && feedback && (
          <>
            {/* Score header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `conic-gradient(${TEAL} ${feedback.score * 3.6}deg, ${CARD2} 0)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: TEAL, lineHeight: 1 }}>{feedback.score}</span>
                  <span style={{ fontSize: 10, color: MUTED }}>/ 100</span>
                </div>
              </div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, margin: "0 0 4px", letterSpacing: -0.5 }}>
                  {feedback.score >= 80 ? "Strong understanding." : feedback.score >= 60 ? "Pretty solid — but there are gaps." : "Good start — let's dig deeper."}
                </h2>
                <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>Here's what your explanation revealed.</p>
              </div>
            </div>

            {/* What you nailed + Gaps */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Card style={{ padding: 20, border: `1px solid ${TEAL}30` }}>
                <div style={{ color: TEAL, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>✓ What you nailed</div>
                {feedback.strong?.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: TEAL, flexShrink: 0 }}>✓</span> <Md>{s}</Md>
                  </div>
                ))}
              </Card>
              <Card style={{ padding: 20, border: "1px solid #f4723050" }}>
                <div style={{ color: "#fb923c", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>⚡ Gaps detected</div>
                {feedback.gaps?.map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: "#fb923c", flexShrink: 0 }}>!</span> <Md>{g}</Md>
                  </div>
                ))}
              </Card>
            </div>

            {/* Follow-up */}
            <Card style={{ padding: 22, background: "#818cf810", border: "1px solid #818cf830", marginBottom: 24 }}>
              <div style={{ color: "#818cf8", fontWeight: 700, fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="sparkle" color="#818cf8" size={13} /> Follow-up question
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: TEXT }}><Md>{feedback.followUp}</Md></p>
              <textarea placeholder="Answer here..."
                style={{ width: "100%", height: 80, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", color: TEXT, fontSize: 13, resize: "none", outline: "none", marginTop: 14, boxSizing: "border-box" }} />
            </Card>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
              <Btn style={{ flex: 1, justifyContent: "center" }} onClick={() => { setStage("explain"); setFeedback(null); }}>Re-explain to improve ↺</Btn>
              <Btn variant="ghost" onClick={() => { setStage("pick"); setTopic(""); setExplanation(""); setFeedback(null); clearAttachment(); }}>Different topic</Btn>
            </div>

            {/* ── Source PDF / image shown again for verification ── */}
            {(pdfFile || imageBase64) && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: BORDER }} />
                  <span style={{ fontSize: 12, color: MUTED, fontWeight: 600, letterSpacing: 0.5 }}>SOURCE MATERIAL FOR VERIFICATION</span>
                  <div style={{ flex: 1, height: 1, background: BORDER }} />
                </div>
                {pageRangeLabel && (
                  <div style={{ fontSize: 12, color: TEAL, marginBottom: 12, fontWeight: 600 }}>
                    Showing {pageRangeLabel} · cross-check the AI's feedback against your source
                  </div>
                )}
                {pdfFile ? (
                  <PdfMiniViewer
                    file={pdfFile}
                    highlightPageRange={pageStart && pageEnd ? { start: parseInt(pageStart), end: parseInt(pageEnd) } : null}
                  />
                ) : imageBase64 ? (
                  <img src={imageBase64} alt="Source material" style={{ width: "100%", borderRadius: 12, border: `1px solid ${BORDER}` }} />
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
