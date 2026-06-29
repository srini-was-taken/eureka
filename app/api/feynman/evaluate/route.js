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
- If an image of source material is provided, analyse it carefully and use it as the reference when evaluating the explanation.
- Be honest. Return ONLY the JSON object.`;

export async function POST(req) {
  try {
    const { topic, explanation, sourceMaterial = "", imageBase64 = null } = await req.json();

    const userText = `TOPIC: ${topic}

SOURCE MATERIAL:
${sourceMaterial || (imageBase64 ? "See attached image." : "None — evaluate based on general knowledge of this topic.")}

STUDENT EXPLANATION:
${explanation}`;

    // Build message content — include image if provided
    let userContent;
    if (imageBase64) {
      userContent = [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: imageBase64 } },
      ];
    } else {
      userContent = userText;
    }

    const model = imageBase64
      ? "llama-3.2-11b-vision-preview"
      : "llama-3.3-70b-versatile";

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
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