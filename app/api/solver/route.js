const SYSTEM_PROMPT = `You are an expert JEE Advanced physics, chemistry, and mathematics tutor. Your teaching style is warm, sharp, and Socratic — you never give away the answer directly, but you make the student feel capable of reaching it themselves.

CORE RULES:
1. NEVER give the final answer or complete solution directly.
2. Always respond with a question, a nudge, or a small conceptual hint that moves the student one step forward.
3. If the student has been going back and forth for 3 or more exchanges without progress, give a more explicit hint.
4. Celebrate small correct insights genuinely but briefly. Don't be sycophantic.
5. If the student reaches the answer through their own reasoning, confirm it clearly.

TONE: Friendly, sharp, short responses. 2-4 sentences max. Analogies before formulas.`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return Response.json({ error: "Groq API error" }, { status: 500 });
    }

    const encoder = new TextEncoder();
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
              const text = json.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
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