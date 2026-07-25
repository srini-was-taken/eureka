import { createClient } from "@/lib/supabase/server";
import { getExamConfig, DEFAULT_EXAM_KEY } from "@/lib/examConfig";

const SYSTEM_PROMPT = `You are a Socratic tutor for competitive exam preparation. Your ONLY job is to guide students to the answer themselves — you are FORBIDDEN from solving the problem for them.

════ ABSOLUTE RULES — NEVER BREAK THESE ════
1. NEVER give the full solution, never show all steps, never reveal the final answer unprompted.
2. ONE hint per reply. One question. One nudge. That's it.
3. MAX 3 sentences per reply. No walls of text.
4. NEVER do arithmetic or algebra for the student. Ask THEM to do it.
5. NEVER give numbered step-by-step walkthroughs. That is spoon-feeding.
6. If you are not confident in the next step: say so clearly. A wrong hint is worse than "I'm not sure."

════ HOW TO RESPOND ════
Read the full conversation and decide which stage the student is at:
  • Stage 1 (problem just shared): Ask what topic/concept this falls under.
  • Stage 2 (topic identified): Ask which core principle or law applies here.
  • Stage 3 (principle known): Ask them to write the relevant formula or equation.
  • Stage 4 (formula written): Ask them to substitute values one at a time — never substitute yourself.

Always pose your hint as a QUESTION that forces the student to think. Lead them with "What do you think...", "Which law governs...", "Can you write...".

════ MCQ PROBLEMS ════
If the question has options (A)(B)(C)(D):
• Never reveal which option is correct.
• Instead, ask: "Can you eliminate any options just by checking units?" or "What does option A imply physically?"
• Use limiting cases: "What happens when θ → 0? Does that match any option?"

════ INTELLECTUAL HONESTY ════
Before responding, silently verify the approach in your head.
If you are not confident — if the calculation is complex, if there are multiple plausible approaches, if you could easily be wrong — you MUST say:
  "Honestly, I'm not fully confident in the next step here. I'd recommend checking a textbook solution or asking your teacher, rather than risk sending you down the wrong path."
Do NOT give a hint you aren't sure about. Students trust hints. Do not abuse that trust.

════ SURRENDER RULE ════
If the student explicitly asks for the full answer/solution 3 or more times in the same conversation, you may provide a complete worked solution prefaced with: "Alright, here's the full solution:"
Otherwise — hold the line.

════ LATEX FORMATTING ════
Always write mathematical expressions using LaTeX:
• Inline math: $F = ma$
• Display math: $$\\int_0^L x^2\\,dx$$
• Fractions: $\\frac{mv^2}{r}$
The frontend renders KaTeX — use proper LaTeX delimiters every time.

TONE: Warm, sharp, peer-mentor. Short replies feel more like a real tutor.`;





export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Fetch user's exam from Supabase to configure the AI
    let examKey = DEFAULT_EXAM_KEY;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("exam")
          .eq("id", user.id)
          .single();
        if (profile?.exam) examKey = profile.exam;
      }
    } catch (_) { /* non-fatal — fall back to default */ }

    const examCfg = getExamConfig(examKey);
    const fullSystemPrompt = SYSTEM_PROMPT + examCfg.systemPromptSuffix;

    // Few-shot examples injected at the START of every call.
    // This pattern-locks the model into giving short Socratic hints.
    // The model learns from the conversation pattern, not just the system prompt.
    const FEW_SHOT = [
      {
        role: "user",
        content: "A ball is thrown vertically upward with velocity 20 m/s. Find max height."
      },
      {
        role: "assistant",
        content: "Good starting point. When the ball is at max height — what is its velocity at that exact instant, and why?"
      },
    ];

    // Inject a soft reminder before the LAST user message to resist drift
    const injectReminder = (msgs) => {
      if (msgs.length === 0) return msgs;
      const copy = [...msgs];
      const lastUserIdx = [...copy].reverse().findIndex(m => m.role === "user");
      if (lastUserIdx === -1) return copy;
      const insertAt = copy.length - lastUserIdx - 1;
      copy.splice(insertAt, 0, {
        role: "system",
        content: "[REMINDER: Give ONE hint only. Ask ONE question. Do NOT solve or show steps. Max 3 sentences.]"
      });
      return copy;
    };

    // Detect if any message contains image content
    const hasImages = messages.some(m => Array.isArray(m.content));

    // Vision model doesn't support streaming on Groq — fall back to non-streaming
    // but still wrap in ReadableStream so the frontend interface stays identical
    if (hasImages) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            { role: "system", content: fullSystemPrompt },
            ...FEW_SHOT,
            ...injectReminder(messages),
          ],
          max_tokens: 300,
          temperature: 0,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Groq vision error:", err);
        return Response.json({ error: "Groq API error" }, { status: 500 });
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      const encoder = new TextEncoder();
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(text));
            controller.close();
          },
        }),
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    // Text-only path — streaming with the fast model
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...FEW_SHOT,
          ...injectReminder(messages),
        ],
        max_tokens: 300,
        stream: true,
        temperature: 0,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return Response.json({ error: "Groq API error" }, { status: 500 });
    }

    const encoder = new TextEncoder();
    let thinkBuf = "";
    let thinkingDone = false;

    const readable = new ReadableStream({
      async start(controller) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const chunk = json.choices?.[0]?.delta?.content;
              if (!chunk) continue;

              if (thinkingDone) {
                // Past the thinking block — stream directly
                controller.enqueue(encoder.encode(chunk));
              } else {
                thinkBuf += chunk;
                const endIdx = thinkBuf.indexOf("</think>");
                if (endIdx !== -1) {
                  // Found end of thinking — stream everything after it
                  thinkingDone = true;
                  const after = thinkBuf.slice(endIdx + 8).trimStart();
                  if (after) controller.enqueue(encoder.encode(after));
                  thinkBuf = "";
                } else if (!thinkBuf.startsWith("<think>") && thinkBuf.length > 20) {
                  // Model didn't use thinking — flush buffer as-is
                  thinkingDone = true;
                  controller.enqueue(encoder.encode(thinkBuf));
                  thinkBuf = "";
                }
                // else: still accumulating inside <think>, hold
              }
            } catch { }
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Solver error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}