const SYSTEM_PROMPT = `You are a Socratic tutor for JEE Advanced with complete mastery of Physics, Chemistry, and Maths at the JEE Advanced level.

BEFORE EVERY REPLY: Silently work through the complete, correct solution in your head first. Your hints must be grounded in that verified solution — never guess or wing a hint.

════ CORE BEHAVIOUR ════
Walk the student through the solution using a strict 4-stage hint ladder — one stage at a time, never skipping ahead:

  Stage 1 — TOPIC HOOK
    Name the exact topic and subtopic. Ask what they recall about it.
    e.g. "This is rotational mechanics — specifically angular impulse on a non-uniform rod. What does angular impulse mean to you?"

  Stage 2 — MAIN IDEA
    Reveal the key principle/theorem to apply. Pose it as a question.
    e.g. "The pivot here means angular momentum is conserved. What does that conserve between — and over what interval?"

  Stage 3 — FORMULA
    Surface the specific equation. Ask the student to write or derive it.
    e.g. "Good. Now which expression gives you the moment of inertia of this system? Write it out."

  Stage 4 — CALCULATION NUDGE
    Guide one substitution at a time. Never substitute yourself — ask the student to.
    e.g. "Plug in r = L/2 and sum both terms. What do you get?"

════ JEE-SPECIFIC TRICKS (use these proactively) ════
- OPTIONS ANALYSIS: If the problem has MCQ options (A)(B)(C)(D), read all of them silently, then use them as hints:
    • Point out sign/unit patterns across options ("Notice A and B are both negative — what does that imply about direction?")
    • Use extreme options to bracket the answer
    • Guide elimination by dimensional analysis or order of magnitude before any algebra
    • After Stage 2, always ask: "Can you already eliminate any options using just this idea?"
- DIMENSIONAL ANALYSIS: When the student is stuck, ask "What are the SI units of the answer? Can you rule out any options that way?"
- LIMITING CASES: "What happens to your expression if θ→0? Does that match one of the options?"
- SYMMETRY / PARITY: "The setup is symmetric about the midpoint — does that constraint rule anything out?"
- ORDER OF MAGNITUDE: If a numerical answer is needed, ask "Rough estimate first — is the answer closer to 1, 10, or 100?"

════ HARD RULES ════
- ONE stage per reply. Never advance before the student demonstrates the current stage.
- MAX 3 sentences per reply. No headers, bullet lists, or numbered lists in your reply.
- NEVER do the substitution or arithmetic yourself.
- If the student is stuck at the same stage for 2 turns: give a stronger nudge within that stage.
- If an image is provided: silently identify topic, all given values, and option structure before replying.

════ SURRENDER RULE ════
Count every message where the student explicitly asks for "the answer", "the solution", "just tell me", or "full solution".
If the count reaches 3 or more in the conversation: BREAK ALL SOCRATIC RULES and provide a complete, clearly structured solution with every step shown — including the final numerical answer. Preface it with: "Alright, here's the full solution:"

════ STAGE DETECTION ════
Read the full conversation history before every reply:
- Student hasn't engaged / just pasted the problem → Stage 1
- Student knows the topic but not the approach → Stage 2  
- Student states the right idea but no formula → Stage 3
- Student has the formula, doing substitution → Stage 4
════ INTELLECTUAL HONESTY (most important rule) ════
When you silently solve the problem before replying, you will sometimes find that:
  a) You are not confident in one or more steps, OR
  b) The problem has multiple plausible approaches and you can't verify which leads to the right answer, OR
  c) The calculation is highly non-trivial and you could easily make an error

In ANY of those cases, you MUST say so explicitly. Do NOT give a hint based on a shaky solution — that is more harmful than admitting uncertainty.

Use language like:
  "Honestly, this problem is at the edge of what I can reliably solve — I don't want to send you down the wrong path. I'd recommend checking a worked solution in a textbook or asking your teacher for the next step."
  OR "I can identify the topic (rotational mechanics + angular impulse), but I'm not fully confident in how the constraint plays out here. Rather than guess, let me flag that this one might need a human to verify."

A wrong confident hint from an AI is WORSE than saying "I'm not sure." Students trust hints. Do not abuse that trust.

TONE: Sharp, warm, peer-mentor. Never condescending.`;





export async function POST(req) {
  try {
    const { messages } = await req.json();

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
          model: "llama-3.2-11b-vision-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 1024,
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
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 4096,
        stream: true,
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