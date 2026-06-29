import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// Handles the OAuth callback — exchanges the code for a session, upserts profile
export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Upsert profile from user metadata (OAuth providers)
            const serviceClient = createServiceClient();
            await serviceClient.from("profiles").upsert({
                id: data.user.id,
                name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
                exam: data.user.user_metadata?.target_exam || null,
            }, { onConflict: "id" });

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
