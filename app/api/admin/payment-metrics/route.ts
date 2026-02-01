// 🔒 ADMIN METRICS — FINAL C6 HARD LOCK
// READ ONLY • SAFE • ADMIN ONLY
// ❌ public blocked
// ❌ normal users blocked
// ✔ only is_admin = true

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    /* =====================================================
       1️⃣ AUTH
    ===================================================== */
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

    /* 🔴 NOT LOGGED IN */
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    /* 🔴 NOT ADMIN */
    if (!user.user_metadata?.is_admin) {
      return NextResponse.json(
        { error: "FORBIDDEN" },
        { status: 403 }
      )
    }

    /* =====================================================
       2️⃣ FETCH METRICS (READ ONLY VIEW)
    ===================================================== */
    const { data, error } = await supabaseAdmin
      .from("payment_metrics")
      .select("*")
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "FAILED" },
        { status: 500 }
      )
    }

    /* =====================================================
       3️⃣ DERIVED METRICS
    ===================================================== */
    const total = Number(data.total_orders ?? 0)
    const success = Number(data.success_orders ?? 0)
    const failed = Number(data.failed_orders ?? 0)
    const revenuePaise = Number(data.total_revenue ?? 0)

    const successRate =
      total > 0 ? Math.round((success / total) * 100) : 0

    const failureRate =
      total > 0 ? Math.round((failed / total) * 100) : 0

    /* =====================================================
       4️⃣ RESPONSE
    ===================================================== */
    return NextResponse.json({
      ...data,
      total_revenue: revenuePaise,
      total_revenue_rupees: revenuePaise / 100,
      success_rate: successRate,
      failure_rate: failureRate,
    })
  } catch {
    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}