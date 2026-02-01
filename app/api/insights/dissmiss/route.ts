import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { computeNextCooldown } from "@/lib/insights/cooldown"
import { logInsightEvent } from "@/lib/insights/auditLogger"

export async function POST(req: Request) {
  try {
    const { insightId, currentSeverity = null } = await req.json()

    /* ---------------------------------
       Input validation (HARD GUARD)
    ---------------------------------- */
    if (!insightId || typeof insightId !== "string") {
      return NextResponse.json(
        { error: "invalid_insight_id" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )
    }

    /* ---------------------------------
       Load current state (SAFE)
    ---------------------------------- */
    const { data: existing, error: loadError } = await supabase
      .from("insight_state")
      .select("dismiss_count")
      .eq("user_id", user.id)
      .eq("insight_id", insightId)
      .maybeSingle()

    if (loadError) {
      console.error("🔥 Failed to load insight_state", loadError)
      return NextResponse.json(
        { error: "state_load_failed" },
        { status: 500 }
      )
    }

    const dismissCount = (existing?.dismiss_count ?? 0) + 1
    const now = new Date()

    /* ---------------------------------
       Cooldown ladder
    ---------------------------------- */
    const { cooldown_until, cooldown_days } = computeNextCooldown({
      dismissCount,
      now,
    })

    /* ---------------------------------
       Persist dismiss
    ---------------------------------- */
    const { error: updateError } = await supabase
      .from("insight_state")
      .update({
        status: "dismissed",
        dismissed_at: now.toISOString(),
        dismiss_count: dismissCount,
        cooldown_until,
        last_severity: currentSeverity,
      })
      .eq("user_id", user.id)
      .eq("insight_id", insightId)

    if (updateError) {
      console.error("🔥 Failed to update insight_state", updateError)
      return NextResponse.json(
        { error: "dismiss_update_failed" },
        { status: 500 }
      )
    }

    /* ---------------------------------
       Audit log (NON-BLOCKING)
    ---------------------------------- */
    try {
      await logInsightEvent({
        userId: user.id,
        insightId,
        event: "dismissed",
        metadata: {
          dismiss_count: dismissCount,
          cooldown_days,
          cooldown_until,
          last_severity: currentSeverity,
        },
      })
    } catch (auditErr) {
      // 🔕 audit must never block UX
      console.warn("⚠️ Audit log failed", auditErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("🔥 DISMISS API crashed", err)
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    )
  }
}