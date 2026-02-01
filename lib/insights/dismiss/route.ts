// app/api/insights/dismiss/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { insightId, feedback, cooldownDays = 7 } = body

    if (!insightId) {
      return NextResponse.json(
        { error: "Missing insightId" },
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
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const cooldownUntil = new Date()
    cooldownUntil.setDate(cooldownUntil.getDate() + cooldownDays)

    const { error } = await supabase
      .from("insight_state")
      .update({
        status: "dismissed",
        cooldown_until: cooldownUntil.toISOString(),
        last_seen_at: new Date().toISOString(),
        feedback_reason: feedback ?? null,
      })
      .eq("user_id", user.id)
      .eq("insight_id", insightId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}