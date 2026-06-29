"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEAL, TEAL_DIM, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Btn from "@/components/ui/Btn";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const inputStyle = {
    width: "100%", background: CARD2, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: "12px 14px", color: TEXT,
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  const labelStyle = { fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 7, letterSpacing: 0.4, display: "block" };

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
              <p style={{ color: MUTED, fontSize: 14 }}>
                {mode === "login" ? "Your weak areas missed you." : "Start your JEE journey the right way."}
              </p>
            </div>

            {/* Toggle */}
            <div style={{ display: "flex", background: CARD2, borderRadius: 10, padding: 4, marginBottom: 28 }}>
              {["login", "signup"].map(m => (
                <div key={m} onClick={() => setMode(m)} style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s", background: mode === m ? TEAL + "20" : "transparent", color: mode === m ? TEAL : MUTED }}>
                  {m === "login" ? "Log In" : "Sign Up"}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "signup" && (
                <div>
                  <label style={labelStyle}>YOUR NAME</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Arjun Sharma" style={inputStyle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>EMAIL</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PASSWORD</label>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={inputStyle} />
              </div>
              {mode === "signup" && (
                <div>
                  <label style={labelStyle}>TARGET EXAM</label>
                  <select style={{ ...inputStyle }}>
                    <option>JEE Advanced 2026</option>
                    <option>JEE Mains 2026</option>
                    <option>NEET 2026</option>
                    <option>JEE Advanced 2027</option>
                  </select>
                </div>
              )}
              <Btn onClick={() => router.push("/dashboard")} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, marginTop: 4 }}>
                {mode === "login" ? "Log In ✦" : "Create Account ✦"}
              </Btn>
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <div style={{ color: MUTED, fontSize: 12, marginBottom: 16 }}>or continue with</div>
              <div style={{ display: "flex", gap: 10 }}>
                {["Google", "GitHub"].map(p => (
                  <div key={p} onClick={() => router.push("/dashboard")} style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 11, textAlign: "center", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {p === "Google" ? "🌐" : "🐙"} {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", color: MUTED, fontSize: 12, marginTop: 20 }}>
            {mode === "login" ? "New here? " : "Already have an account? "}
            <span onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>
              {mode === "login" ? "Sign up free" : "Log in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
