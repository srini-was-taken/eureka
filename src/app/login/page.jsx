"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TEAL, TEAL_DIM, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Btn from "@/components/ui/Btn";
import { createClient } from "@/lib/supabase/client";

const EXAM_OPTIONS = [
  "None / General Use",
  "JEE Advanced",
  "JEE Mains",
  "NEET",
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [targetExam, setTargetExam] = useState("None / General Use");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) setError("Authentication failed. Please try again.");
  }, []);

  const inputStyle = {
    width: "100%", background: CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: "12px 14px", color: TEXT,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color .15s",
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: 12, color: MUTED, fontWeight: 600,
    marginBottom: 7, letterSpacing: 0.4, display: "block",
  };

  async function upsertProfile(user, nameVal, examVal) {
    await supabase.from("profiles").upsert({
      id: user.id,
      name: nameVal || user.user_metadata?.full_name || null,
      exam: examVal || user.user_metadata?.target_exam || null,
    }, { onConflict: "id" });
  }

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);

    if (mode === "login") {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        // Upsert profile on login (idempotent — handles first login after email confirm)
        if (data.user) await upsertProfile(data.user, null, null);
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      if (!name) { setError("Please enter your name."); setLoading(false); return; }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, target_exam: targetExam },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else {
        setMessage("✓ Check your email to confirm your account, then log in.");
        setLoading(false);
      }
    }
  };

  const handleOAuth = async (provider) => {
    setError("");
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <div style={{ padding: "24px 40px", cursor: "pointer" }} onClick={() => router.push("/")}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${TEAL},${TEAL_DIM})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✦</div>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5 }}>EurekaAI</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative" }}>
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 400, background: `radial-gradient(ellipse, ${TEAL}0d 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "40px 36px", boxShadow: `0 0 60px ${TEAL}10` }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>
                {mode === "login" ? "Your weak areas missed you." : "Start your study journey the right way."}
              </p>
            </div>

            {/* Toggle */}
            <div style={{ display: "flex", background: CARD2, borderRadius: 10, padding: 4, marginBottom: 28 }}>
              {["login", "signup"].map(m => (
                <div key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
                  style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s", background: mode === m ? TEAL + "20" : "transparent", color: mode === m ? TEAL : MUTED }}>
                  {m === "login" ? "Log In" : "Sign Up"}
                </div>
              ))}
            </div>

            {error && (
              <div style={{ background: "#f871711a", border: "1px solid #f8717140", color: "#f87171", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ background: `${TEAL}18`, border: `1px solid ${TEAL}40`, color: TEAL, borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
                {message}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "signup" && (
                <div>
                  <label style={labelStyle}>YOUR NAME</label>
                  <input value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKeyDown} placeholder="Arjun Sharma" style={inputStyle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>EMAIL</label>
                <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="you@example.com" type="email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PASSWORD</label>
                <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="••••••••" type="password" style={inputStyle} />
              </div>
              {mode === "signup" && (
                <div>
                  <label style={labelStyle}>TARGET EXAM</label>
                  <select value={targetExam} onChange={e => setTargetExam(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {EXAM_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              )}
              <Btn onClick={handleSubmit} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Please wait…" : mode === "login" ? "Log In ✦" : "Create Account ✦"}
              </Btn>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <div style={{ color: MUTED, fontSize: 12, marginBottom: 16 }}>or continue with</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "Google", provider: "google", emoji: "🌐" },
                  { label: "GitHub", provider: "github", emoji: "🐙" },
                ].map(p => (
                  <div key={p.label} onClick={() => !loading && handleOAuth(p.provider)}
                    style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 11, textAlign: "center", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all .15s" }}>
                    {p.emoji} {p.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", color: MUTED, fontSize: 12, marginTop: 20 }}>
            {mode === "login" ? "New here? " : "Already have an account? "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setMessage(""); }} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>
              {mode === "login" ? "Sign up free" : "Log in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
