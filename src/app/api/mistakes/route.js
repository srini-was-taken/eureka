import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";

const GROQ_DIAGNOSIS_PROMPT = `You are a JEE tutor. In exactly 1-2 sentences: identify the specific conceptual or procedural error the student made and state the correct understanding. Be blunt and precise — no preamble, no encouragement, no markdown. Return only the diagnosis.`;

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

    const { topic, subject, problem, user_note, imageBase64 = null } = await req.json();
    if (!topic || !subject || (!problem && !imageBase64)) {
        return Response.json({ error: "topic, subject, and either problem or an image are required" }, { status: 400 });
    }

    // Generate AI diagnosis via Groq (vision-capable if image provided)
    let ai_diagnosis = "";
    try {
        const userText = `PROBLEM: ${problem || "(see attached image)"}\n\nSTUDENT'S NOTE: ${user_note || "No note provided."}`;

        const userContent = imageBase64
            ? [
                { type: "text", text: userText },
                { type: "image_url", image_url: { url: imageBase64 } },
            ]
            : userText;

        const model = imageBase64
            ? "meta-llama/llama-4-scout-17b-16e-instruct"
            : "llama-3.3-70b-versatile";

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: GROQ_DIAGNOSIS_PROMPT },
                    { role: "user", content: userContent },
                ],
                max_tokens: 120,
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
        problem: problem || "",
        user_note: user_note || "",
        ai_diagnosis,
        status: "unresolved",
    }).select().single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}
