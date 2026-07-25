"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BACKGROUND, CARD, BORDER, BUTTON, TEAL, TEXT, MUTED } from "@/lib/theme";
import Icon from "@/components/ui/Icon";

export default function ProfilePage() {
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [fullName, setFullName] = useState("");
    const [targetExam, setTargetExam] = useState("");
    const [grade, setGrade] = useState("");

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.full_name || "");
                setTargetExam(user.user_metadata?.target_exam || "JEE Advanced");
                setGrade(user.user_metadata?.grade || "12th");
            }
            setLoading(false);
        }
        loadProfile();
    }, [supabase]);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                target_exam: targetExam,
                grade: grade,
            }
        });

        setSaving(false);
        if (error) {
            alert("Failed to update profile");
        } else {
            alert("Profile updated successfully!");
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: BACKGROUND, color: TEXT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: BACKGROUND, color: TEXT, padding: "40px 60px" }}>


            <div style={{ maxWidth: 800, margin: "0 auto" }}>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12, background: `${TEAL}20`,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <Icon name="user" color={TEAL} size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: TEXT }}>Your Profile</h1>
                        <p style={{ margin: "4px 0 0", color: MUTED, fontSize: 14 }}>Manage your personal details and target exam settings</p>
                    </div>
                </div>

                <div style={{
                    background: CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    padding: 32,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                }}>

                    {/* Account Email (Read Only) */}
                    <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Email Address
                        </label>
                        <input
                            type="text"
                            value={user?.email || ""}
                            disabled
                            style={{
                                width: "100%", padding: 14, borderRadius: 10, border: `1px solid ${BORDER}`,
                                background: "rgba(255,255,255,0.03)", color: MUTED, fontSize: 15, outline: "none", cursor: "not-allowed"
                            }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Full Name */}
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your name"
                                style={{
                                    width: "100%", padding: 14, borderRadius: 10, border: `1px solid ${BORDER}`,
                                    background: BACKGROUND, color: TEXT, fontSize: 15, outline: "none", transition: "border 0.2s"
                                }}
                                onFocus={(e) => e.target.style.border = `1px solid ${TEAL}`}
                                onBlur={(e) => e.target.style.border = `1px solid ${BORDER}`}
                            />
                        </div>

                        {/* Target Exam */}
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Target Exam
                            </label>
                            <input
                                type="text"
                                value={targetExam}
                                onChange={(e) => setTargetExam(e.target.value)}
                                placeholder="e.g. JEE Advanced, NEET"
                                style={{
                                    width: "100%", padding: 14, borderRadius: 10, border: `1px solid ${BORDER}`,
                                    background: BACKGROUND, color: TEXT, fontSize: 15, outline: "none", transition: "border 0.2s"
                                }}
                                onFocus={(e) => e.target.style.border = `1px solid ${TEAL}`}
                                onBlur={(e) => e.target.style.border = `1px solid ${BORDER}`}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                padding: "12px 24px",
                                background: TEAL,
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: saving ? "not-allowed" : "pointer",
                                opacity: saving ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                transition: "opacity 0.2s"
                            }}
                            onMouseEnter={(e) => !saving && (e.currentTarget.style.opacity = 0.9)}
                            onMouseLeave={(e) => !saving && (e.currentTarget.style.opacity = 1)}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
