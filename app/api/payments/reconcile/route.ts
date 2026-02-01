// app/api/payments/reconcile/route.ts
// 🔒 B11 RECONCILIATION GUARD
// BACKUP FOR MISSED WEBHOOKS
// SAFE • SERVER ONLY • CRON ONLY

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { razorpay } from "@/lib/razorpay"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    /* =====================================================
       1️⃣ find old pending orders (10+ min)
    ===================================================== */

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("id, razorpay_order_id, user_id, product_id")
      .eq("status", "pending")
      .lt("created_at", tenMinAgo)

    if (!orders?.length) {
      return NextResponse.json({ scanned: 0 })
    }

    let fixed = 0

    /* =====================================================
       2️⃣ verify each with razorpay
    ===================================================== */

    for (const o of orders) {
      const payments = await razorpay.orders.fetchPayments(
        o.razorpay_order_id
      )

      const paid = payments?.items?.some(
        (p: any) => p.status === "captured"
      )

      if (!paid) continue

      /* ---------- update order ---------- */

      await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", o.razorpay_order_id)

      /* ---------- grant entitlement ---------- */

      await supabaseAdmin.from("entitlements").upsert(
        {
          user_id: o.user_id,
          product_id: o.product_id,
          order_id: o.razorpay_order_id,
          status: "active",
          granted_at: new Date().toISOString(),
        },
        { onConflict: "order_id" }
      )

      fixed++
    }

    return NextResponse.json({
      scanned: orders.length,
      fixed,
    })
  } catch (err) {
    console.error("RECONCILE_FATAL", err)

    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}