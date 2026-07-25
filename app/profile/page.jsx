"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BG, CARD, CARD2, BORDER, TEAL, TEAL_DIM, TEXT, MUTED } from "@/lib/theme";
import { EXAM_CONFIG, DEFAULT_EXAM_KEY } from "@/lib/examConfig";
import Sidebar from "@/components/layout/Sidebar";
import Icon from "@/components/ui/Icon";

// Distinct accent color per exam to make each card feel unique
const EXAM_ACCENTS = {
    jee_adv: { color: "#818cf8", gradient: "linear-gradient(135deg, #818cf8, #6d5fe6)", icon: "⚡" },
    jee_mains: { color: "#fb923c", gradient: "linear-gradient(135deg, #fb923c, #f97316)", icon: "🎯" },
    bitsat: { color: "#34d399", gradient: "linear-gradient(135deg, #34d399, #10b981)", icon: "🧠" },
    neet: { color: "#f472b6", gradient: "linear-gradient(135deg, #f472b6, #ec4899)", icon: "🔬" },
};

const EXAM_DESCRIPTIONS = {
    jee_adv: "The hardest engineering entrance in India. Deep conceptual problems and multi-step reasoning across PCM.",
    jee_mains: "The gateway to NITs and IIITs. Formula-based, time-pressured PCM problems.",
    bitsat: "BITS entrance with PCM, Aptitude, and English. Tricky problems at speed.",
    neet: "Medical entrance covering Physics, Chemistry, and Biology — NCERT-grounded.",
};

export default function ProfilePage() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [fullName, setFullName] = useState("");
    const [selectedExam, setSelectedExam] = useState(DEFAULT_EXAM_KEY);

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/"); return; }
            setUser(user);
            setFullName(user.user_metadata?.full_name || "");

            const { data: profile } = await supabase
                .from("profiles")
                .select("exam")
                .eq("id", user.id)
                .single();

            if (profile?.exam && EXAM_CONFIG[profile.exam]) {
                setSelectedExam(profile.exam);
            }
            setLoading(false);
        }
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Save exam key to profiles table (drives all backend behaviour)
        await supabase.from("profiles").upsert({ id: user.id, exam: selectedExam });
        // Save display name
        await supabase.auth.updateUser({ data: { full_name: fullName } });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>
            Loading profile...
        </div>
    );

    const examEntries = Object.entries(EXAM_CONFIG);

    return (
        <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, overflowY: "auto", padding: "44px 52px" }}>
                <div style={{ maxWidth: 820, margin: "0 auto" }}>

                    {/* Header */}
                    <div style={{ marginBottom: 36 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DIM})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: `0 4px 12px ${TEAL}40`, fontSize: 18
                            }}>
                                ✦
                            </div>
                            <div>
                                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Your Profile</h1>
                                <p style={{ margin: "3px 0 0", color: MUTED, fontSize: 13 }}>
                                    Your exam choice shapes the AI tutor, subjects, and solver reasoning across the app.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Personal Info</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Your name"
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = TEAL}
                                    onBlur={e => e.target.style.borderColor = BORDER}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input
                                    value={user?.email || ""}
                                    disabled
                                    style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Exam Cards */}
                    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Target Exam</div>
                        <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, marginTop: 0 }}>
                            Selecting an exam configures the AI model, system prompt, subjects, and difficulty tone.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {examEntries.map(([key, cfg]) => {
                                const accent = EXAM_ACCENTS[key];
                                const isSelected = selectedExam === key;
                                return (
                                    <div
                                        key={key}
                                        onClick={() => setSelectedExam(key)}
                                        style={{
                                            borderRadius: 14,
                                            border: `2px solid ${isSelected ? accent.color : BORDER}`,
                                            background: isSelected ? `${accent.color}0f` : CARD2,
                                            padding: "20px 22px",
                                            cursor: "pointer",
                                            position: "relative",
                                            transition: "all 0.2s ease",
                                            boxShadow: isSelected ? `0 0 24px ${accent.color}25` : "none",
                                        }}
                                    >
                                        {/* Selected check */}
                                        {isSelected && (
                                            <div style={{
                                                position: "absolute", top: 12, right: 14,
                                                width: 20, height: 20, borderRadius: "50%",
                                                background: accent.gradient,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 11, color: "#fff", fontWeight: 800,
                                            }}>✓</div>
                                        )}

                                        {/* Icon + name */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10,
                                                background: accent.gradient,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 18, flexShrink: 0,
                                                boxShadow: `0 4px 10px ${accent.color}40`,
                                            }}>
                                                {accent.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: 15, color: isSelected ? accent.color : TEXT }}>{cfg.label}</div>
                                                <div style={{ fontSize: 11, color: accent.color, fontWeight: 600, opacity: 0.8 }}>
                                                    {cfg.useReasoning ? "Enhanced Reasoning" : "Direct Hints"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: "0 0 12px" }}>
                                            {EXAM_DESCRIPTIONS[key]}
                                        </p>

                                        {/* Subject tags */}
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {cfg.subjects.map(s => (
                                                <span key={s} style={{
                                                    fontSize: 10, fontWeight: 700, padding: "3px 8px",
                                                    borderRadius: 6, border: `1px solid ${accent.color}50`,
                                                    color: isSelected ? accent.color : MUTED,
                                                    background: isSelected ? `${accent.color}12` : "transparent",
                                                }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* What changes section */}
                    <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}25`, borderRadius: 14, padding: "18px 24px", marginBottom: 32 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 10 }}>
                            ✦ What changes when you switch exams?
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {[
                                ["Socratic Solver", "AI uses your exam's subjects and hints tuned to that exam's style."],
                                ["Feynman Mode", "Evaluations consider subject context relevant to your exam."],
                                ["Problem Bank", "Subject filter chips match your exam's subjects (e.g. Biology for NEET)."],
                                ["Mistake Journal", "Subject filters adapt — Aptitude & English appear for BITSAT."],
                                ["Sidebar", "Your active exam is shown in the profile card."],
                            ].map(([title, desc]) => (
                                <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <span style={{ color: TEAL, fontSize: 13, flexShrink: 0, marginTop: 1 }}>→</span>
                                    <span style={{ fontSize: 13, color: MUTED }}>
                                        <span style={{ color: TEXT, fontWeight: 600 }}>{title}:</span> {desc}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
                        {saved && (
                            <span style={{ fontSize: 13, color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}>
                                <span>✓</span> Saved! Refresh any page to see changes.
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: "12px 28px", borderRadius: 10, border: "none",
                                background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DIM})`,
                                color: "#000", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                                opacity: saving ? 0.7 : 1, transition: "opacity 0.2s",
                                boxShadow: `0 4px 16px ${TEAL}40`
                            }}
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>

                </div>

                {/* Danger Zone */}
                <div style={{ marginTop: 28, background: "#f871710a", border: "1px solid #f8717125", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#f87171", marginBottom: 4 }}>Sign out</div>
                        <div style={{ fontSize: 12, color: MUTED }}>You'll need to log back in to continue using EurekaAI.</div>
                    </div>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.push("/");
                        }}
                        style={{
                            padding: "10px 20px", borderRadius: 8, border: "1px solid #f8717150",
                            background: "transparent", color: "#f87171", fontWeight: 700, fontSize: 13,
                            cursor: "pointer", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f871711a"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                        Sign Out
                    </button>
                </div>

            </div>
        </div>
    );
}

const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700, color: MUTED,
    marginBottom: 8, letterSpacing: 0.8, textTransform: "uppercase",
};
const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10, boxSizing: "border-box",
    border: `1px solid ${BORDER}`, background: CARD2,
    color: TEXT, fontSize: 14, outline: "none", transition: "border-color 0.2s",
};
