"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TEAL, TEAL_DIM, BG, CARD, CARD2, BORDER, TEXT, MUTED } from "@/lib/theme";
import Badge from "@/components/ui/Badge";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Md from "@/components/ui/Md";
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
  const [pendingImage, setPendingImage] = useState(null); // { url: string, name: string }
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const chatRef = useRef();
  const messagesRef = useRef(messages);
  const fileInputRef = useRef();

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
    const firstUser = userMessages.find(m => m.role === "user");
    // content may be an array (vision) or string; extract text safely
    const topicText = firstUser
      ? (typeof firstUser.content === "string"
        ? firstUser.content
        : firstUser.content?.find?.(p => p.type === "text")?.text || "")
      : "General";
    const topic = topicText.slice(0, 80);
    // Strip imageUrl before saving to avoid storing large base64 blobs
    const cleanMsgs = userMessages.map(({ imageUrl: _img, ...rest }) => rest);
    await supabase.from("solver_sessions").insert({ user_id: userId, messages: cleanMsgs, topic });
  }

  // Save on browser close / tab close
  useEffect(() => {
    const handler = () => saveSession(messagesRef.current);
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [userId]);

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage({ url: reader.result, name: file.name });
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  async function send() {
    if ((!input.trim() && !pendingImage) || loading) return;

    // Build the user message
    const textContent = input.trim() || (pendingImage ? "What can you tell me about this problem?" : "");
    const userMsg = pendingImage
      ? {
        role: "user",
        // Keep imageUrl for display; content becomes array for the API
        imageUrl: pendingImage.url,
        content: [
          { type: "text", text: textContent },
          { type: "image_url", image_url: { url: pendingImage.url } },
        ],
      }
      : { role: "user", content: textContent };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setPendingImage(null);
    setLoading(true);

    try {
      // Send only role + content to the API (no imageUrl field needed by backend)
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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageSelect}
      />

      {/* Header */}
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, background: CARD }}>
        <Btn variant="ghost" small onClick={handleBack} style={{ padding: "7px 12px" }}>← Back</Btn>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <div style={{ width: 36, height: 36, background: TEAL + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="brain" color={TEAL} size={18} />
        </div>
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
                  maxWidth: "65%",
                  borderRadius: m.role === "assistant" ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                  background: m.role === "assistant" ? CARD2 : `linear-gradient(135deg,${TEAL},${TEAL_DIM})`,
                  color: m.role === "user" ? "#000" : TEXT,
                  fontSize: 14, lineHeight: 1.7,
                  border: m.role === "assistant" ? `1px solid ${BORDER}` : "none",
                  overflow: "hidden",
                }}>
                  {/* Image thumbnail inside bubble */}
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="attached"
                      style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block", borderRadius: "16px 16px 0 0" }}
                    />
                  )}
                  <div style={{ padding: "14px 18px" }}>
                    {m.role === "assistant"
                      ? <Md>{typeof m.content === "string" ? m.content : m.content?.find?.(p => p.type === "text")?.text || ""}</Md>
                      : <span style={{ whiteSpace: "pre-wrap" }}>{typeof m.content === "string" ? m.content : m.content?.find?.(p => p.type === "text")?.text}</span>
                    }
                    {(!m.content || m.content === "") && m.role === "assistant" && <span style={{ opacity: 0.4 }}>thinking...</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div style={{ padding: "16px 28px 24px", borderTop: `1px solid ${BORDER}`, background: CARD }}>
            {/* Image preview strip */}
            {pendingImage && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 12px" }}>
                <img src={pendingImage.url} alt="preview" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: TEXT, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingImage.name}</span>
                <span onClick={() => setPendingImage(null)} style={{ cursor: "pointer", color: MUTED, fontSize: 18, lineHeight: 1 }}>✕</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Type your thinking, or upload an image... (Shift+Enter for new line)"
                  disabled={loading}
                  rows={1}
                  style={{
                    flex: 1, background: "transparent", border: "none", outline: "none",
                    color: TEXT, fontSize: 14, resize: "none", fontFamily: "inherit",
                    lineHeight: 1.6, maxHeight: "8em", overflowY: "auto",
                  }}
                />
                <div
                  onClick={() => !loading && fileInputRef.current?.click()}
                  title="Attach image"
                  style={{ cursor: loading ? "default" : "pointer", opacity: pendingImage ? 1 : 0.45, transition: "opacity .15s", display: "flex" }}
                ><Icon name="image" color={TEXT} size={18} /></div>
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
