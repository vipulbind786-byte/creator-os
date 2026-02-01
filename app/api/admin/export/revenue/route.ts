/* ======================================================
   🔒 PHASE-4 HARD LOCK — ADMIN REVENUE CSV EXPORT
   ------------------------------------------------------
   ✔ Admin only
   ✔ Server only
   ✔ Rate limited
   ✔ Uses payment_metrics VIEW (single source)
   ✔ Excel safe
   ✔ No business logic
   ✔ Production safe

   DO NOT MODIFY AGAIN
====================================================== */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { guardAPI } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   AUTH — ADMIN ONLY
====================================================== */

async function requireAdmin() {
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

  if (!user) return null

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_admin) return null

  return user
}

/* ======================================================
   CSV BUILDER
====================================================== */

function toCSV(row: any) {
  const headers = [
    "total_orders",
    "success_orders",
    "failed_orders",
    "pending_orders",
    "total_revenue_paise",
    "total_revenue_rupees",
    "success_rate_percent",
    "failure_rate_percent",
  ]

  const total = Number(row.total_orders ?? 0)
  const success = Number(row.success_orders ?? 0)
  const failed = Number(row.failed_orders ?? 0)
  const revenue = Number(row.total_revenue ?? 0)

  const successRate = total > 0 ? Math.round((success / total) * 100) : 0
  const failureRate = total > 0 ? Math.round((failed / total) * 100) : 0

  const values = [
    total,
    success,
    failed,
    row.pending_orders ?? 0,
    revenue,
    (revenue / 100).toFixed(2),
    successRate,
    failureRate,
  ]

  return [headers.join(","), values.join(",")].join("\n")
}

/* ======================================================
   ROUTE
====================================================== */

export async function GET(req: Request) {
  try {
    /* ----------------------------------
       RATE LIMIT
    ---------------------------------- */
    if (!guardAPI(req)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    /* ----------------------------------
       ADMIN CHECK
    ---------------------------------- */
    const admin = await requireAdmin()

    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* ----------------------------------
       FETCH VIEW (single source)
    ---------------------------------- */
    const { data, error } = await supabaseAdmin
      .from("payment_metrics")
      .select("*")
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to export" }, { status: 500 })
    }

    const csv = toCSV(data)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="revenue.csv"`,
      },
    })
  } catch (err) {
    console.error("ADMIN_EXPORT_REVENUE_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */