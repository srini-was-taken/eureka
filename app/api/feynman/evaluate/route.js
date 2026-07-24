import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are evaluating a student's understanding of a concept based on their explanation. Your job is to identify exactly where their understanding is solid and where it breaks down — then probe the weak spots.

You will be given:
- TOPIC: the concept being explained
- SOURCE MATERIAL: the reference content (uploaded notes or textbook excerpt) — may be empty if no material was uploaded
- STUDENT EXPLANATION: what the student wrote in their own words

YOUR TASK:
Evaluate the explanation and return a JSON object with exactly this structure:
{
  "score": <integer 0-100>,
  "strong": [<string>, <string>],
  "gaps": [<string>, <string>],
  "followUp": <string>
}

SCORING GUIDE:
- 90-100: Near complete understanding, minor gaps only
- 70-89: Good grasp of core idea, missing important conditions or nuances
- 50-69: Partial understanding, got the intuition but missing key mechanisms
- 30-49: Surface level only, memorized phrases without real understanding
- 0-29: Fundamental misconceptions present

RULES:
- "strong" should name specific things they got right, not generic praise
- "gaps" should be precise and actionable — name exactly what's missing, not vague
- "followUp" should be one sharp question that directly targets their biggest gap
- Be honest and specific. A student who gets 60 should know exactly why.
- Do not add any text outside the JSON object. Return only valid JSON.`;

export async function POST(req) {
  try {
    const { topic, explanation, sourceMaterial = "" } = await req.json();

    const userMessage = `
TOPIC: ${topic}

SOURCE MATERIAL:
${sourceMaterial || "No source material uploaded — evaluate based on general knowledge of this topic."}

STUDENT EXPLANATION:
${explanation}
    `.trim();

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = response.content[0].text.trim();

    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return Response.json(result);
  } catch (err) {
    console.error("Feynman evaluate error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
