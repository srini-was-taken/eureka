import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";

const GROQ_DIAGNOSIS_PROMPT = `You are an expert JEE tutor diagnosing a student's mistake. Given a problem and the student's note about what went wrong, provide a clear, precise diagnosis (2-4 sentences) identifying the exact conceptual or procedural error and what they should know instead. Be honest, specific, and actionable. Return ONLY the diagnosis text — no JSON, no markdown.`;

export async function GET(req) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}

export async function POST(req) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, subject, problem, user_note } = await req.json();
    if (!topic || !subject || !problem) {
        return Response.json({ error: "topic, subject, and problem are required" }, { status: 400 });
    }

    // Generate AI diagnosis via Groq
    let ai_diagnosis = "";
    try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: GROQ_DIAGNOSIS_PROMPT },
                    { role: "user", content: `PROBLEM: ${problem}\n\nSTUDENT'S NOTE: ${user_note || "No note provided."}` },
                ],
                max_tokens: 300,
                temperature: 0.4,
            }),
        });
        if (groqRes.ok) {
            const groqData = await groqRes.json();
            ai_diagnosis = groqData.choices?.[0]?.message?.content?.trim() || "";
        }
    } catch (err) {
        console.error("Groq diagnosis error:", err);
    }

    // Insert using service client to ensure write succeeds
    const service = createServiceClient();
    const { data, error } = await service.from("mistakes").insert({
        user_id: user.id,
        topic,
        subject,
        problem,
        user_note: user_note || "",
        ai_diagnosis,
        status: "unresolved",
    }).select().single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}
