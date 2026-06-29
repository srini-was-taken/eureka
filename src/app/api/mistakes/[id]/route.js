import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";

export async function PATCH(req, { params }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Get current status
    const { data: current } = await supabase
        .from("mistakes")
        .select("status")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!current) return Response.json({ error: "Not found" }, { status: 404 });

    const newStatus = current.status === "resolved" ? "unresolved" : "resolved";

    const service = createServiceClient();
    const { data, error } = await service
        .from("mistakes")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json(data);
}

export async function DELETE(req, { params }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const service = createServiceClient();
    const { error } = await service
        .from("mistakes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
}
