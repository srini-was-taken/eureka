import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(req) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    const filename = formData.get("filename") || file?.name || "document.pdf";

    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const service = createServiceClient();

    // Try to upload to storage — non-fatal if bucket doesn't exist
    try {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const storagePath = `${user.id}/${Date.now()}_${filename}`;
        await service.storage
            .from("pdfs")
            .upload(storagePath, fileBuffer, { contentType: "application/pdf", upsert: false });
    } catch (e) {
        console.warn("PDF storage upload skipped:", e?.message);
    }

    // Always insert DB record so annotations can be linked
    const { data, error: dbError } = await service
        .from("pdfs")
        .insert({ user_id: user.id, filename, storage_path: null })
        .select()
        .single();

    if (dbError) {
        console.error("DB insert error:", dbError);
        return Response.json({ error: dbError.message }, { status: 500 });
    }

    return Response.json({ pdf_id: data.id });
}

