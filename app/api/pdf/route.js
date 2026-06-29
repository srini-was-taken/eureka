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

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const storagePath = `${user.id}/${Date.now()}_${filename}`;

    const service = createServiceClient();

    // Upload to Supabase Storage
    const { error: uploadError } = await service.storage
        .from("pdfs")
        .upload(storagePath, fileBuffer, {
            contentType: "application/pdf",
            upsert: false,
        });

    if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return Response.json({ error: uploadError.message }, { status: 500 });
    }

    // Insert record into pdfs table
    const { data, error: dbError } = await service
        .from("pdfs")
        .insert({ user_id: user.id, filename, storage_path: storagePath })
        .select()
        .single();

    if (dbError) {
        console.error("DB insert error:", dbError);
        return Response.json({ error: dbError.message }, { status: 500 });
    }

    return Response.json({ pdf_id: data.id, storage_path: storagePath });
}
