"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEAL, TEAL_DIM, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content: "Hey! Drop a problem in — paste it, type it, or upload an image of it. I won't solve it for you, but I'll make sure *you* do. 🧠",
  },
];

const QUICK_PROMPTS = ["I'm stuck", "Give me a small hint", "What concept is this?", "Can I see a better approach?"];

export default function SolverPage() {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const chatRef = useRef();
  const messagesRef = useRef(messages);

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Save the session (any messages beyond the greeting)
  async function saveSession(msgs) {
    const userMessages = msgs.slice(1); // skip the greeting
    if (!userId || userMessages.length === 0) return;
    // Extract topic from first user message (first ~60 chars)
    const firstUser = userMessages.find(m => m.role === "user");
    const topic = firstUser ? firstUser.content.slice(0, 80) : "General";
    await supabase.from("solver_sessions").insert({
      user_id: userId,
      messages: userMessages,
      topic,
    });
  }

  // Save on browser close / tab close
  useEffect(() => {
    const handler = () => saveSession(messagesRef.current);
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [userId]);

  async function send() {
    if ((!input.trim() && !imageUploaded) || loading) return;

    const userText = imageUploaded ? (input || "[Problem image uploaded]") : input;
    const userMsg = { role: "user", content: userText };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setImageUploaded(false);
    setLoading(true);

    try {
      const apiMessages = updatedMessages
        .slice(1)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      setMessages(m => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: aiText };
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(m => [...m, { role: "assistant", content: "Something went wrong — check your API key and try again." }]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const hintsGiven = messages.filter(m => m.role === "assistant").length - 1;

  async function handleBack() {
    await saveSession(messagesRef.current);
    router.push("/dashboard");
  }

  return (
    <div style={{ height: "100vh", background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn variant="ghost" small onClick={handleBack} style={{ padding: "7px 12px" }}>← Back</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <div style={{ width: 36, height: 36, background: TEAL + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Socratic Solver</div>
          <div style={{ fontSize: 11, color: MUTED }}>Guided problem-solving · JEE Advanced mode</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Badge>JEE Advanced</Badge>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Chat area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 12, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
                {m.role === "assistant" && (
                  <div style={{ width: 34, height: 34, background: TEAL + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>✦</div>
                )}
                <div style={{
                  maxWidth: "65%", padding: "14px 18px",
                  borderRadius: m.role === "assistant" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                  background: m.role === "assistant" ? CARD2 : `linear-gradient(135deg,${TEAL},${TEAL_DIM})`,
                  color: m.role === "user" ? "#000" : TEXT,
                  fontSize: 14, lineHeight: 1.7,
                  border: m.role === "assistant" ? `1px solid ${BORDER}` : "none",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.content || <span style={{ opacity: 0.4 }}>thinking...</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div style={{ padding: "16px 28px 24px", borderTop: `1px solid ${BORDER}`, background: CARD }}>
            {imageUploaded && (
              <div style={{ background: TEAL + "15", border: `1px solid ${TEAL}30`, borderRadius: 10, padding: "8px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span>🖼</span>
                <span style={{ color: TEAL }}>problem_image.jpg attached</span>
                <span onClick={() => setImageUploaded(false)} style={{ marginLeft: "auto", cursor: "pointer", color: MUTED }}>✕</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Type your thinking, or upload an image of the problem..."
                  disabled={loading}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 14 }}
                />
                <div onClick={() => setImageUploaded(true)} style={{ cursor: "pointer", opacity: 0.6, fontSize: 18 }}>🖼</div>
              </div>
              <Btn onClick={send} style={{ padding: "14px 20px" }}>
                {loading ? "..." : "➤"}
              </Btn>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {QUICK_PROMPTS.map(q => (
                <div key={q} onClick={() => !loading && setInput(q)}
                  style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: MUTED, cursor: loading ? "default" : "pointer" }}>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ width: 280, borderLeft: `1px solid ${BORDER}`, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 12, letterSpacing: 0.5 }}>HINT PROGRESS</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{ flex: 1, height: 6, borderRadius: 3, background: n <= hintsGiven ? TEAL : CARD2 }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>{hintsGiven} of 5 hints given</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>MESSAGES</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: TEAL }}>{messages.length - 1}</div>
            <div style={{ fontSize: 12, color: MUTED }}>exchanged this session</div>
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>REMEMBER</div>
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
              After 3 exchanges without progress the tutor will give you a bigger nudge automatically.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
