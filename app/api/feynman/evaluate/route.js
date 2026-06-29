const SYSTEM_PROMPT = `You are evaluating a student's understanding of a concept based on their explanation. Identify exactly where their understanding is solid and where it breaks down.

Return ONLY a valid JSON object with exactly this structure, no other text, no markdown:
{
  "score": <integer 0-100>,
  "strong": [<string>, <string>],
  "gaps": [<string>, <string>],
  "followUp": <string>
}

SCORING:
- 90-100: Near complete understanding
- 70-89: Good grasp, missing some nuances
- 50-69: Partial understanding, missing key mechanisms
- 30-49: Surface level only
- 0-29: Fundamental misconceptions

RULES:
- "strong": specific things they got right, not generic praise
- "gaps": precise and actionable, name exactly what's missing
- "followUp": one sharp question targeting their biggest gap
- Be honest. Return ONLY the JSON object.`;

export async function POST(req) {
  try {
    const { topic, explanation, sourceMaterial = "" } = await req.json();

    const userMessage = `TOPIC: ${topic}

SOURCE MATERIAL:
${sourceMaterial || "None — evaluate based on general knowledge of this topic."}

STUDENT EXPLANATION:
${explanation}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return Response.json({ error: "Groq API error" }, { status: 500 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);
    return Response.json(result);
  } catch (err) {
    console.error("Feynman evaluate error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}