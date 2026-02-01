import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { logInsightEvent } from "@/lib/insights/auditLogger"

export async function POST(req: Request) {
  try {
    const { insightIds } = await req.json()

    if (!Array.isArray(insightIds) || insightIds.length === 0) {
      return NextResponse.json({ ok: true })
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

    const now = new Date().toISOString()

    /* ---------------------------------
       UPSERT seen state (idempotent)
    ---------------------------------- */
    const rows = insightIds.map((insightId: string) => ({
      user_id: user.id,
      insight_id: insightId,
      status: "active",
      first_seen_at: now,
      last_seen_at: now,
      cooldown_until: null,
      resolved_at: null,
      resolution_context: null,
    }))

    await supabase
      .from("insight_state")
      .upsert(rows, {
        onConflict: "user_id,insight_id",
      })

    /* ---------------------------------
       Audit log (non-blocking)
    ---------------------------------- */
    for (const insightId of insightIds) {
      await logInsightEvent({
        userId: user.id,
        insightId,
        event: "seen",
        metadata: {
          at: now,
          source: "dashboard_render",
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("🔥 SEEN API failed:", err)
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    )
  }
}