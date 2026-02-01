/* ======================================================
   🔒 PHASE-4 HARD LOCK — ADMIN ORDERS CSV EXPORT
   ------------------------------------------------------
   ✔ Admin only
   ✔ Server only
   ✔ Rate limited
   ✔ Stream safe
   ✔ No client trust
   ✔ Production safe
   ✔ Excel/Sheets compatible

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

function toCSV(rows: any[]) {
  const headers = [
    "order_id",
    "product_id",
    "user_id",
    "buyer_email",
    "amount_paise",
    "amount_rupees",
    "currency",
    "status",
    "provider",
    "created_at",
  ]

  const lines = [headers.join(",")]

  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.product_id,
        r.user_id,
        r.buyer_email ?? "",
        r.amount,
        (Number(r.amount) / 100).toFixed(2),
        r.currency,
        r.status,
        r.payment_provider,
        r.created_at,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
  }

  return lines.join("\n")
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
       FETCH ALL ORDERS (truth)
    ---------------------------------- */
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        product_id,
        user_id,
        buyer_email,
        amount,
        currency,
        status,
        payment_provider,
        created_at
        `
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("ADMIN_EXPORT_ORDERS_ERROR", error)
      return NextResponse.json({ error: "Failed to export" }, { status: 500 })
    }

    const csv = toCSV(data ?? [])

    /* ----------------------------------
       FILE RESPONSE
    ---------------------------------- */
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders.csv"`,
      },
    })
  } catch (err) {
    console.error("ADMIN_EXPORT_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */