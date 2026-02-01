// 🔒 PHASE-B HARD LOCK
// PAYMENT STATUS CHECK — AUTHORITATIVE
// ENTITLEMENT = SINGLE SOURCE OF TRUTH
// ✔ ownership enforced in query
// ✔ fail closed
// ✔ webhook race safe
// ✔ production safe

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ status: "invalid" }, { status: 400 })
    }

    /* -----------------------------
       AUTH
    ----------------------------- */
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
      return NextResponse.json({ status: "unauthorized" }, { status: 401 })
    }

    /* =====================================================
       🔐 ORDER (OWNERSHIP ENFORCED IN QUERY)
    ===================================================== */
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, product_id, user_id, status")
      .eq("razorpay_order_id", orderId)
      .eq("user_id", user.id) // 🔐 HARD OWNERSHIP
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ status: "not_found" })
    }

    /* =====================================================
       🔐 ENTITLEMENT (ONLY TRUTH)
    ===================================================== */
    const { data: entitlement } = await supabaseAdmin
      .from("entitlements")
      .select("id")
      .eq("order_id", order.id)
      .eq("status", "active")
      .maybeSingle()

    /* ---------- SUCCESS ---------- */
    if (entitlement) {
      return NextResponse.json({ status: "success" })
    }

    /* ---------- FAILED ---------- */
    if (order.status === "failed" || order.status === "cancelled") {
      return NextResponse.json({
        status: "failed",
        productId: order.product_id,
      })
    }

    /* ---------- STILL PROCESSING ---------- */
    return NextResponse.json({ status: "pending" })
  } catch {
    /* FAIL CLOSED */
    return NextResponse.json({ status: "failed" })
  }
}