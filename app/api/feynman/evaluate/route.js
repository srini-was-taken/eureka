import { createClient } from "@/lib/supabase/server";
import { getExamConfig, DEFAULT_EXAM_KEY } from "@/lib/examConfig";

const SYSTEM_PROMPT = `You are an expert evaluator assessing a student's depth of understanding of a concept, as if for a competitive entrance exam (JEE Advanced, JEE Mains, BITSAT, or NEET).

Your job is NOT to be encouraging — it is to find exactly where understanding breaks down.

EVALUATION CRITERIA:
- Can they define the concept precisely, not just vaguely describe it?
- Do they explain the WHY (mechanism/derivation), not just the WHAT?
- Can they connect it to related concepts or use cases?
- Are their examples correct and non-trivial?
- Do they use correct terminology?
- Do they make any physically/chemically/mathematically incorrect statements?

SCORING RUBRIC:
- 90-100: Precise, complete, correct — could teach this to someone else without errors
- 75-89: Good grasp. Minor gaps or imprecisions, no fundamental errors
- 55-74: Partial. Gets the gist but misses key mechanisms or makes vague statements
- 35-54: Surface level. Mostly correct vocabulary, no real mechanistic understanding
- 0-34: Fundamental misconceptions or significantly wrong

RULES:
- "strong": 1-3 things they specifically got right — NO generic praise like "good effort"
- "gaps": 1-3 precise, actionable gaps — name exactly what's missing or wrong. Be specific: e.g. "Did not explain why entropy increases — only stated that it does" is good. "Could have said more" is not.
- "followUp": ONE sharp question that would immediately expose whether they truly understand their biggest gap. Make it a question they cannot answer by restating their explanation.
- If an image is provided, use it as the reference material and compare their explanation against it.
- Be honest. Do NOT inflate scores. A score of 60 is not an insult — it's useful diagnostic information.
- Return ONLY a valid JSON object with no markdown, no extra text:
{
  "score": <integer 0-100>,
  "strong": [<string>, <string>],
  "gaps": [<string>, <string>],
  "followUp": <string>
}`;


export async function POST(req) {
  try {
    const { topic, explanation, sourceMaterial = "", imageBase64 = null } = await req.json();

    // Fetch user's exam from Supabase (non-fatal)
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
    } catch (_) { /* non-fatal */ }

    const examCfg = getExamConfig(examKey);

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
      ? "meta-llama/llama-4-scout-17b-16e-instruct"
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