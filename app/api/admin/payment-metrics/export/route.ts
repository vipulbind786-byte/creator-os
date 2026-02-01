// 🔒 ADMIN PAYMENT METRICS EXPORT — CSV (C5)
// READ ONLY • SERVER ONLY • SAFE
// ✔ auth required
// ✔ no writes
// ✔ stream CSV

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    /* ==============================
       AUTH (SERVER HARD GATE)
    ============================== */
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
        { error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    /* ==============================
       ORDERS (SOURCE OF TRUTH)
    ============================== */
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id, product_id, amount, currency, status, created_at")
      .order("created_at", { ascending: false })

    if (error || !orders) {
      return NextResponse.json(
        { error: "FAILED" },
        { status: 500 }
      )
    }

    /* ==============================
       CSV BUILD
    ============================== */
    const header =
      "order_id,product_id,amount_paise,amount_rupees,currency,status,created_at\n"

    const rows = orders
      .map(
        (o) =>
          `${o.id},${o.product_id},${o.amount},${o.amount / 100},${o.currency},${o.status},${o.created_at}`
      )
      .join("\n")

    const csv = header + rows

    /* ==============================
       RETURN FILE
    ============================== */
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          'attachment; filename="payment-report.csv"',
      },
    })
  } catch {
    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}