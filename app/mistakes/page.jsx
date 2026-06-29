"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED, SUBJECT_COLORS } from "@/lib/theme";
import Sidebar from "@/components/layout/Sidebar";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";

const FILTERS = ["all", "unresolved", "resolved", "Physics", "Chemistry", "Maths"];
const SUBJECTS = ["Physics", "Chemistry", "Maths", "Other"];

// ── Log Mistake Modal ─────────────────────────────────────────
function LogMistakeModal({ onSave, onClose }) {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [problem, setProblem] = useState("");
  const [userNote, setUserNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", background: CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: "11px 14px", color: TEXT, fontSize: 14,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
    resize: "none",
  };
  const labelStyle = { fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 7, letterSpacing: 0.4, display: "block" };

  async function handleSave() {
    if (!topic.trim() || !problem.trim()) { setError("Topic and problem are required."); return; }
    setSaving(true); setError("");
    const res = await onSave({ topic: topic.trim(), subject, problem: problem.trim(), user_note: userNote.trim() });
    if (res?.error) setError(res.error);
    setSaving(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36, width: 520, boxShadow: "0 0 60px #00000080" }}>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24, letterSpacing: -0.5 }}>📝 Log a Mistake</h3>

        {error && <div style={{ background: "#f871711a", border: "1px solid #f8717140", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>TOPIC</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Rotational Dynamics" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>SUBJECT</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>PROBLEM STATEMENT</label>
            <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={4} placeholder="Paste or type the problem here..." style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>YOUR NOTE <span style={{ color: MUTED, fontWeight: 400 }}>(optional — what went wrong?)</span></label>
            <textarea value={userNote} onChange={e => setUserNote(e.target.value)} rows={2} placeholder="e.g. I forgot to account for rotational KE..." style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Btn onClick={handleSave} style={{ flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving + diagnosing..." : "Save & Diagnose ✦"}
          </Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
        <p style={{ fontSize: 12, color: MUTED, marginTop: 12, margin: "12px 0 0" }}>AI will auto-generate a diagnosis from your problem + note.</p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MistakeJournalPage() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchMistakes(); }, []);

  async function fetchMistakes() {
    setLoading(true);
    const res = await fetch("/api/mistakes");
    if (res.ok) setMistakes(await res.json());
    setLoading(false);
  }

  async function handleLog(formData) {
    const res = await fetch("/api/mistakes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) return { error: "Failed to save. Try again." };
    setShowModal(false);
    fetchMistakes();
  }

  async function toggleStatus(id) {
    const res = await fetch(`/api/mistakes/${id}`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setMistakes(ms => ms.map(m => m.id === id ? updated : m));
      setSelected(null);
    }
  }

  async function deleteMistake(id) {
    const res = await fetch(`/api/mistakes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMistakes(ms => ms.filter(m => m.id !== id));
      setSelected(null);
    }
  }

  const filtered = mistakes.filter(m => {
    if (filter === "all") return true;
    if (filter === "unresolved" || filter === "resolved") return m.status === filter;
    return m.subject === filter;
  });

  const total = mistakes.length;
  const unresolved = mistakes.filter(m => m.status === "unresolved").length;
  const resolved = total - unresolved;

  const detail = selected !== null ? mistakes.find(x => x.id === selected) : null;

  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex" }}>
      {showModal && <LogMistakeModal onSave={handleLog} onClose={() => setShowModal(false)} />}
      <Sidebar />

      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Mistake Journal 📝</h1>
            <p style={{ color: MUTED, fontSize: 14 }}>Every struggle, logged and diagnosed. Your fastest path to improvement.</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {unresolved > 0 && (
              <div style={{ background: "#f8717118", border: "1px solid #f8717130", borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#f87171", fontWeight: 600 }}>
                {unresolved} unresolved
              </div>
            )}
            <Btn small onClick={() => setShowModal(true)}>+ Log Mistake</Btn>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, margin: "24px 0" }}>
          {[
            { label: "Total Logged", val: total, color: "#f472b6" },
            { label: "Unresolved", val: unresolved, color: "#f87171" },
            { label: "Resolved", val: resolved, color: "#34d399" },
            { label: "Subjects", val: [...new Set(mistakes.map(m => m.subject))].length, color: TEAL },
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

        {loading && (
          <div style={{ textAlign: "center", color: MUTED, padding: 48, fontSize: 14 }}>Loading your mistakes...</div>
        )}

        {!loading && mistakes.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No mistakes logged yet</div>
            <p style={{ color: MUTED, fontSize: 14, marginBottom: 24 }}>Every mistake is a learning opportunity. Start logging!</p>
            <Btn onClick={() => setShowModal(true)}>+ Log Your First Mistake</Btn>
          </div>
        )}

        {/* List + detail */}
        {!loading && mistakes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: detail ? "1fr 1.2fr" : "1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(m => (
                <div key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
                  style={{ background: CARD, border: `1px solid ${selected === m.id ? "#f472b650" : BORDER}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", transition: "all .15s", boxShadow: selected === m.id ? "0 0 20px #f472b612" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{m.topic}</span>
                      <Badge color={SUBJECT_COLORS[m.subject] || "#818cf8"}>{m.subject}</Badge>
                      <span style={{ background: m.status === "resolved" ? "#34d39920" : "#f8717120", color: m.status === "resolved" ? "#34d399" : "#f87171", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                        {m.status === "resolved" ? "✓ Resolved" : "⚠ Unresolved"}
                      </span>
                    </div>
                    <span style={{ color: MUTED, fontSize: 12, flexShrink: 0 }}>{fmtDate(m.created_at)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: "0 0 10px" }}>
                    {m.problem?.length > 90 ? m.problem.slice(0, 90) + "..." : m.problem}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {m.user_note && <span style={{ fontSize: 12, color: MUTED }}>· Note added</span>}
                    <span style={{ marginLeft: "auto", fontSize: 12, color: TEAL, fontWeight: 600 }}>
                      {selected === m.id ? "↑ Close" : "View details →"}
                    </span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", color: MUTED, fontSize: 14, padding: "32px 0" }}>No mistakes match this filter.</div>
              )}
            </div>

            {/* Detail panel */}
            {detail && (
              <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
                <Card glow style={{ padding: 28 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                    <Badge color={SUBJECT_COLORS[detail.subject] || "#818cf8"}>{detail.subject}</Badge>
                    <Badge color="#f472b6">{detail.topic}</Badge>
                    <span style={{ background: detail.status === "resolved" ? "#34d39920" : "#f8717120", color: detail.status === "resolved" ? "#34d399" : "#f87171", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                      {detail.status === "resolved" ? "✓ Resolved" : "⚠ Unresolved"}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>PROBLEM</div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT, marginBottom: 20, padding: "14px 16px", background: CARD2, borderRadius: 10 }}>{detail.problem}</p>

                  {detail.user_note && (
                    <>
                      <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>YOUR NOTE</div>
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: "#fbbf24", marginBottom: 20, padding: "12px 14px", background: "#fbbf2410", border: "1px solid #fbbf2420", borderRadius: 10 }}>"{detail.user_note}"</p>
                    </>
                  )}

                  {detail.ai_diagnosis && (
                    <>
                      <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>✦ AI DIAGNOSIS</div>
                      <p style={{ fontSize: 13, lineHeight: 1.75, color: TEXT, marginBottom: 20, padding: "14px 16px", background: TEAL + "0d", border: `1px solid ${TEAL}25`, borderRadius: 10 }}>{detail.ai_diagnosis}</p>
                    </>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn small onClick={() => router.push("/solver")} style={{ flex: 1, justifyContent: "center" }}>Re-attempt ✦</Btn>
                    <Btn small variant="outline" onClick={() => toggleStatus(detail.id)}>
                      {detail.status === "resolved" ? "Mark Unresolved" : "Mark Resolved ✓"}
                    </Btn>
                    <Btn small variant="ghost" onClick={() => deleteMistake(detail.id)} style={{ color: "#f87171", borderColor: "#f8717140" }}>Delete</Btn>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
