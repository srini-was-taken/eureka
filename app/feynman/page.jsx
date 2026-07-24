"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Md from "@/components/ui/Md";
import { createClient } from "@/lib/supabase/client";

const TOPICS = [
  "Conservation of Angular Momentum",
  "Electrochemical Cells",
  "Work-Energy Theorem",
  "Ideal Gas Law",
  "Integration by Parts",
];

export default function FeynmanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stage, setStage] = useState("pick");
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  // Source material state
  const [sourceMaterial, setSourceMaterial] = useState("");  // text (PDF / OCR)
  const [imageBase64, setImageBase64] = useState(null);      // image data URL
  const [attachedFile, setAttachedFile] = useState(null);    // { name, type }
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  function clearAttachment() {
    setSourceMaterial("");
    setImageBase64(null);
    setAttachedFile(null);
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setExtracting(true);
    setError("");

    if (file.type === "application/pdf") {
      // PDF → extract text via existing endpoint
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/pdf/extract", { method: "POST", body: form });
        if (!res.ok) throw new Error("PDF extract failed");
        const data = await res.json();
        setSourceMaterial(data.text || "");
        setImageBase64(null);
        setAttachedFile({ name: file.name, type: "pdf" });
      } catch {
        setError("Could not extract PDF text. Try an image instead.");
      }
    } else if (file.type.startsWith("image/")) {
      // Image → base64 data URL, sent directly to vision model
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result);
        setSourceMaterial("");
        setAttachedFile({ name: file.name, type: "image" });
      };
      reader.readAsDataURL(file);
    }

    setExtracting(false);
  }

  async function evaluate() {
    if (explanation.length < 20 || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feynman/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          explanation,
          sourceMaterial,
          imageBase64: imageBase64 || null,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setFeedback(data);
      setStage("feedback");

      if (userId) {
        await supabase.from("feynman_attempts").insert({
          user_id: userId,
          topic,
          explanation,
          score: data.score,
          strong: data.strong,
          gaps: data.gaps,
          follow_up: data.followUp,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong — check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

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
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 28px" }}>

        {/* Stage: Pick topic */}
        {stage === "pick" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Icon name="feynman" color="#818cf8" size={36} /></div>
              <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginBottom: 10 }}>What concept do you want to test?</h2>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6 }}>Pick a topic. Then explain it in your own words — no looking back.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {TOPICS.map((t, i) => (
                <div key={i} onClick={() => setTopic(t)}
                  style={{ background: topic === t ? TEAL + "15" : CARD, border: `1px solid ${topic === t ? TEAL + "60" : BORDER}`, borderRadius: 12, padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .15s" }}>
                  <span style={{ fontWeight: topic === t ? 700 : 400, color: topic === t ? TEAL : TEXT, fontSize: 15 }}>{t}</span>
                  {topic === t && <span style={{ color: TEAL }}>✓</span>}
                </div>
              ))}
              {/* Custom topic input */}
              <input
                value={TOPICS.includes(topic) ? "" : topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Or type your own topic..."
                style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 20px", color: TEXT, fontSize: 14, outline: "none" }}
              />
            </div>

            {/* Source material upload */}
            <div
              onClick={() => !extracting && fileInputRef.current?.click()}
              style={{
                background: attachedFile ? TEAL + "0d" : CARD2,
                border: `2px dashed ${attachedFile ? TEAL + "60" : BORDER}`,
                borderRadius: 14, padding: 22, textAlign: "center", marginBottom: 28,
                cursor: extracting ? "wait" : "pointer", transition: "all .2s",
              }}
            >
              {extracting ? (
                <>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name="clockalt" color={MUTED} size={20} /></div>
                  <div style={{ fontSize: 14, color: MUTED }}>Extracting content...</div>
                </>
              ) : attachedFile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Icon name={attachedFile.type === "pdf" ? "upload" : "image"} color={TEAL} size={20} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>{attachedFile.name}</div>
                    <div style={{ fontSize: 12, color: MUTED }}>
                      {attachedFile.type === "pdf" ? "Text extracted ✓" : "Image attached ✓ — AI will analyse it directly"}
                    </div>
                  </div>
                  <span
                    onClick={e => { e.stopPropagation(); clearAttachment(); }}
                    style={{ marginLeft: 12, color: MUTED, fontSize: 18, cursor: "pointer" }}
                  >✕</span>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Icon name="upload" color={MUTED} size={22} /></div>
                  <div style={{ fontSize: 14, color: MUTED }}>Upload your notes or textbook image</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>PDF (text extracted) · Image (AI reads directly)</div>
                </>
              )}
            </div>

            {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
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
                {attachedFile && (
                  <span style={{ fontSize: 12, color: TEAL, background: TEAL + "15", borderRadius: 6, padding: "2px 8px" }}>
                    {attachedFile.type === "pdf" ? "📄" : "🖼"} {attachedFile.name}
                  </span>
                )}
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
            {error && <p style={{ color: "#f87171", fontSize: 13, marginTop: 8 }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <span style={{ color: MUTED, fontSize: 13 }}>{explanation.length} characters</span>
              <Btn onClick={evaluate} style={{ padding: "13px 28px" }}>
                {loading ? "Evaluating..." : "Submit for Evaluation ✦"}
              </Btn>
            </div>
          </>
        )}

        {/* Stage: Show feedback */}
        {stage === "feedback" && feedback && (
          <>
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

            <Card style={{ padding: 22, background: "#818cf810", border: "1px solid #818cf830", marginBottom: 24 }}>
              <div style={{ color: "#818cf8", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>✦ Follow-up question</div>
              <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: TEXT }}><Md>{feedback.followUp}</Md></p>
              <textarea
                placeholder="Answer here..."
                style={{ width: "100%", height: 80, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", color: TEXT, fontSize: 13, resize: "none", outline: "none", marginTop: 14, boxSizing: "border-box" }}
              />
            </Card>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn style={{ flex: 1, justifyContent: "center" }} onClick={() => { setStage("explain"); setFeedback(null); }}>Re-explain to improve score ↺</Btn>
              <Btn variant="ghost" onClick={() => { setStage("pick"); setTopic(""); setExplanation(""); setFeedback(null); clearAttachment(); }}>Different topic</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
