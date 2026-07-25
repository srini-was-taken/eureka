"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEAL, BG, CARD, CARD2, BORDER, TEXT, MUTED, SUBJECT_COLORS, DIFF_COLORS } from "@/lib/theme";
import Sidebar from "@/components/layout/Sidebar";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import Icon from "@/components/ui/Icon";
import { getExamConfig, DEFAULT_EXAM_KEY } from "@/lib/examConfig";

const STATUS_CONFIG = {
  solved: { color: "#34d399", label: "✓ Solved" },
  hinted: { color: "#fb923c", label: "⚡ Hinted" },
  attempted: { color: "#818cf8", label: "◎ Attempted" },
  failed: { color: "#f87171", label: "✗ Failed" },
};

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// ── Add Problem Modal ─────────────────────────────────────────
function AddProblemModal({ onSave, onClose, subjects = ["Physics", "Chemistry", "Maths"] }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(subjects[0] || "Physics");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [source, setSource] = useState("");
  const [statement, setStatement] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    width: "100%", background: CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: "11px 14px", color: TEXT, fontSize: 14,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box", resize: "none",
  };
  const labelStyle = { fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 7, letterSpacing: 0.4, display: "block" };

  async function handleSave() {
    if (!title.trim() || !statement.trim()) { setError("Title and problem statement are required."); return; }
    setSaving(true); setError("");
    const err = await onSave({ title: title.trim(), subject, topic: topic.trim(), difficulty, source: source.trim(), statement: statement.trim() });
    if (err) { setError(err); setSaving(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000080", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36, width: 560, boxShadow: "0 0 60px #00000080", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24, letterSpacing: -0.5 }}>Add to Problem Bank</h3>

        {error && <div style={{ background: "#f871711a", border: "1px solid #f8717140", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>TITLE</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Rolling disc — acceleration" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>SUBJECT</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>DIFFICULTY</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>SOURCE</label>
              <input value={source} onChange={e => setSource(e.target.value)} placeholder="JEE 2024, HC Verma…" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>TOPIC <span style={{ color: MUTED, fontWeight: 400 }}>(optional)</span></label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Rotational Dynamics" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>PROBLEM STATEMENT</label>
            <textarea value={statement} onChange={e => setStatement(e.target.value)} rows={5} placeholder="Paste or type the full problem here..." style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Btn onClick={handleSave} style={{ flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Add to Bank ✦"}
          </Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ProblemBankPage() {
  const router = useRouter();
  const supabase = createClient();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [examSubjects, setExamSubjects] = useState(["Physics", "Chemistry", "Maths"]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchProblems(user.id);
        // Fetch exam from profile to get correct subjects
        const { data: profile } = await supabase.from("profiles").select("exam").eq("id", user.id).single();
        const cfg = getExamConfig(profile?.exam ?? DEFAULT_EXAM_KEY);
        setExamSubjects([...cfg.subjects, "Other"]);
      }
    });
  }, []);

  async function fetchProblems(uid) {
    setLoading(true);
    const { data } = await supabase
      .from("problem_attempts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setProblems(data || []);
    setLoading(false);
  }

  async function handleAddProblem(formData) {
    const { data, error } = await supabase.from("problem_attempts").insert({
      user_id: userId,
      title: formData.title,
      subject: formData.subject,
      topic: formData.topic || null,
      difficulty: formData.difficulty,
      source: formData.source || null,
      statement: formData.statement,
      status: "attempted",
      hints_used: 0,
    }).select().single();
    if (error) return error.message;
    setProblems(ps => [data, ...ps]);
    setShowModal(false);
    return null;
  }

  const filtered = problems.filter(p => {
    const matchSearch = (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.topic || "").toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "All" || p.subject === filterSubject;
    const matchDiff = filterDiff === "All" || p.difficulty === filterDiff;
    return matchSearch && matchSubject && matchDiff;
  });

  const sel = selected !== null ? problems.find(p => p.id === selected) : null;

  const total = problems.length;
  const solvedClean = problems.filter(p => p.status === "solved" && (p.hints_used || 0) === 0).length;
  const needRevisit = problems.filter(p => p.status === "failed").length;

  function fmtDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex" }}>
      {showModal && <AddProblemModal onSave={handleAddProblem} onClose={() => setShowModal(false)} subjects={examSubjects} />}
      <Sidebar />

      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>Problem Bank</h1>
            <p style={{ color: MUTED, fontSize: 14 }}>Your personal collection of problems, tagged and tracked.</p>
          </div>
          <Btn small onClick={() => setShowModal(true)}>+ Add Problem</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, margin: "24px 0" }}>
          {[
            { label: "Total Problems", val: total, color: TEAL },
            { label: "Solved Clean", val: solvedClean, color: "#34d399" },
            { label: "Need Revisit", val: needRevisit, color: "#f87171" },
            { label: "Subjects", val: [...new Set(problems.map(p => p.subject))].length, color: "#818cf8" },
          ].map((s, i) => (
            <Card key={i} style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Search + filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 22, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <Icon name="eye" color={MUTED} size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by topic or title..."
              style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14, flex: 1 }} />
          </div>
          {["All", ...examSubjects].map(s => (
            <div key={s} onClick={() => setFilterSubject(s)}
              style={{ padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: filterSubject === s ? TEAL + "20" : CARD, border: `1px solid ${filterSubject === s ? TEAL + "50" : BORDER}`, color: filterSubject === s ? TEAL : MUTED, transition: "all .15s" }}>
              {s}
            </div>
          ))}
          <div style={{ width: 1, height: 24, background: BORDER }} />
          {["All", "Easy", "Medium", "Hard"].map(d => (
            <div key={d} onClick={() => setFilterDiff(d)}
              style={{ padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: filterDiff === d ? (DIFF_COLORS[d] || TEAL) + "20" : CARD, border: `1px solid ${filterDiff === d ? (DIFF_COLORS[d] || TEAL) + "50" : BORDER}`, color: filterDiff === d ? (DIFF_COLORS[d] || TEAL) : MUTED, transition: "all .15s" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && <div style={{ textAlign: "center", color: MUTED, padding: 48, fontSize: 14 }}>Loading your problems...</div>}

        {/* Empty state */}
        {!loading && problems.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><Icon name="book" color={MUTED} size={48} /></div>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 10, letterSpacing: -0.5 }}>Your problem bank is empty</h2>
            <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
              Add problems you want to work through. Use the Socratic Solver on any problem you add here.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Btn onClick={() => setShowModal(true)}>+ Add a Problem</Btn>
            </div>
          </div>
        )}

        {/* List + detail */}
        {!loading && problems.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: sel ? "1fr 1.1fr" : "1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(p => {
                const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.attempted;
                return (
                  <div key={p.id} onClick={() => setSelected(selected === p.id ? null : p.id)}
                    style={{ background: CARD, border: `1px solid ${selected === p.id ? "#fb923c50" : BORDER}`, borderRadius: 13, padding: "17px 20px", cursor: "pointer", transition: "all .15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{p.title}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {p.subject && <Badge color={SUBJECT_COLORS[p.subject] || "#818cf8"}>{p.subject}</Badge>}
                          {p.topic && <Badge color="#6b7280">{p.topic}</Badge>}
                          {p.difficulty && <span style={{ background: (DIFF_COLORS[p.difficulty] || TEAL) + "20", color: DIFF_COLORS[p.difficulty] || TEAL, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{p.difficulty}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <span style={{ background: statusCfg.color + "20", color: statusCfg.color, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700 }}>{statusCfg.label}</span>
                        {p.source && <span style={{ color: MUTED, fontSize: 11 }}>{p.source}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: (p.hints_used || 0) === 0 ? "#34d399" : "#fb923c", display: "flex", alignItems: "center", gap: 4 }}>
                        <Icon name="sparkle" color={(p.hints_used || 0) === 0 ? "#34d399" : "#fb923c"} size={12} />
                        {(p.hints_used || 0) === 0 ? "No hints used" : `${p.hints_used} hints used`}
                      </span>
                      <span style={{ fontSize: 12, color: MUTED }}>{fmtDate(p.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              {!loading && filtered.length === 0 && problems.length > 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontWeight: 600 }}>No problems match this filter</div>
                </div>
              )}
            </div>

            {/* Detail panel */}
            {sel && (
              <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
                <Card style={{ padding: 28 }}>
                  <div style={{ display: "flex", gap: 7, marginBottom: 16, flexWrap: "wrap" }}>
                    {sel.subject && <Badge color={SUBJECT_COLORS[sel.subject] || "#818cf8"}>{sel.subject}</Badge>}
                    {sel.topic && <Badge color="#6b7280">{sel.topic}</Badge>}
                    {sel.difficulty && <span style={{ background: (DIFF_COLORS[sel.difficulty] || TEAL) + "20", color: DIFF_COLORS[sel.difficulty] || TEAL, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{sel.difficulty}</span>}
                    {sel.source && <Badge color="#6b7280">{sel.source}</Badge>}
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16, letterSpacing: -0.3 }}>{sel.title}</h3>
                  <div style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>PROBLEM STATEMENT</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: TEXT, padding: "14px 16px", background: CARD2, borderRadius: 10, marginBottom: 20 }}>{sel.statement}</p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 16, padding: "12px 16px", background: CARD2, borderRadius: 10 }}>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: (STATUS_CONFIG[sel.status] || STATUS_CONFIG.attempted).color }}>{(STATUS_CONFIG[sel.status] || STATUS_CONFIG.attempted).label}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>Status</div>
                    </div>
                    <div style={{ width: 1, background: BORDER }} />
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: (sel.hints_used || 0) === 0 ? "#34d399" : "#fb923c" }}>{sel.hints_used || 0}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>Hints Used</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn small onClick={() => router.push(`/solver?problemText=${encodeURIComponent(sel.statement)}`)} style={{ flex: 1, justifyContent: "center" }}>
                      {sel.status === "solved" ? "Solve Again" : "Solve with AI"}
                    </Btn>
                    {sel.status === "failed" && (
                      <Btn small variant="outline" onClick={() => router.push("/mistakes")}>View in Journal</Btn>
                    )}
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
