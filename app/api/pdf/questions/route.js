import { createClient } from "@/lib/supabase/server";
import { getExamConfig, DEFAULT_EXAM_KEY } from "@/lib/examConfig";

export async function POST(req) {
    try {
        const { text, topic, pageStart, pageEnd } = await req.json();
        if (!text || text.trim().length < 50) {
            return Response.json({ error: "Not enough text to generate questions" }, { status: 400 });
        }

        // Get user's exam for context
        let examKey = DEFAULT_EXAM_KEY;
        try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("exam").eq("id", user.id).single();
                if (profile?.exam) examKey = profile.exam;
            }
        } catch (_) { }

        const examCfg = getExamConfig(examKey);
        const pageRange = (pageStart && pageEnd) ? ` (pages ${pageStart}–${pageEnd})` : "";

        const prompt = `You are an expert ${examCfg.label} tutor. Generate EXACTLY 4 multiple-choice questions based ONLY on the following study material${pageRange}.

Rules:
- Questions must be answerable from the material provided only.
- Each question must have 4 options labeled (A) (B) (C) (D).
- One correct answer per question.
- Questions should test understanding, not just memorization.
- Vary difficulty: 1 easy, 2 medium, 1 hard.
- Keep questions concise.

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "question": "Question text here?",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "A",
    "explanation": "One sentence explaining why."
  }
]

STUDY MATERIAL:
${text.slice(0, 6000)}`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1200,
                temperature: 0.5,
                response_format: { type: "json_object" },
            }),
        });

        if (!res.ok) {
            console.error("Groq error:", await res.text());
            return Response.json({ error: "AI error" }, { status: 500 });
        }

        const data = await res.json();
        let raw = data.choices?.[0]?.message?.content?.trim() || "[]";

        // Parse — Groq with json_object wraps in an object sometimes
        let questions;
        try {
            const parsed = JSON.parse(raw);
            questions = Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed)[0] || []);
        } catch {
            questions = [];
        }

        return Response.json({ questions });
    } catch (err) {
        console.error("Generate questions error:", err);
        return Response.json({ error: "Something went wrong" }, { status: 500 });
    }
}
