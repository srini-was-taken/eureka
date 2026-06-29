/**
 * lib/rateLimit.js
 * Per-user daily rate limiting via Supabase.
 *
 * - feynman   → counts rows in feynman_attempts (already tracked)
 * - solver    → counts rows in api_usage
 * - questions → counts rows in api_usage
 *
 * Fails OPEN (allows request) if Supabase is unreachable.
 */

const DAILY_LIMITS = {
    solver: 10,
    feynman: 10,
    questions: 10,
};

/** Returns { allowed: bool, used: number, limit: number } */
export async function checkRateLimit(supabase, userId, feature) {
    const limit = DAILY_LIMITS[feature] ?? 10;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    try {
        if (feature === "feynman") {
            const { count, error } = await supabase
                .from("feynman_attempts")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .gte("created_at", startOfDay.toISOString());
            if (error) return { allowed: true, used: 0, limit }; // fail open
            return { allowed: (count ?? 0) < limit, used: count ?? 0, limit };
        }

        // solver / questions → api_usage table
        const { count, error } = await supabase
            .from("api_usage")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("feature", feature)
            .gte("created_at", startOfDay.toISOString());
        if (error) return { allowed: true, used: 0, limit }; // fail open if table missing
        return { allowed: (count ?? 0) < limit, used: count ?? 0, limit };
    } catch {
        return { allowed: true, used: 0, limit }; // fail open on any error
    }
}

/** Fire-and-forget: record one usage event */
export async function trackUsage(supabase, userId, feature) {
    if (feature === "feynman") return; // feynman_attempts insert already tracks this
    try {
        await supabase.from("api_usage").insert({ user_id: userId, feature });
    } catch { /* non-fatal */ }
}
