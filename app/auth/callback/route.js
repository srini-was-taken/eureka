import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Handles the OAuth callback — exchanges the code for a session
export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return the user to an error page or login with an error message
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
