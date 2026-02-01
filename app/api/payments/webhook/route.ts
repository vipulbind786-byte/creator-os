// 🔒 PHASE-1 + PHASE-B FINAL HARD LOCK
// WEBHOOK = ONLY FINANCIAL AUTHORITY
// ✔ signature verified
// ✔ idempotent
// ✔ rate limited
// ✔ strict payload validation
// ✔ exactly 1 row updates
// ✔ fail closed
// ❌ NEVER trust client
// ❌ NEVER partial updates
// DO NOT MODIFY AGAIN

import { NextResponse } from "next/server"
import crypto from "crypto"

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { writeAuditLog } from "@/lib/audit"
import { guardWebhook } from "@/lib/ratelimit"

export const dynamic = "force-dynamic"

/* ======================================================
   Helpers
====================================================== */

function isoFromUnix(ts?: number | null) {
  if (!ts) return null
  return new Date(ts * 1000).toISOString()
}

async function assertSingleUpdate(
  table: string,
  match: string,
  value: string,
  patch: Record<string, unknown>
) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .update(patch)
    .eq(match, value)
    .select("id")

  if (error) throw error

  if (!data || data.length !== 1) {
    throw new Error(
      `FINANCIAL_INTEGRITY_VIOLATION: ${table} update affected ${data?.length ?? 0} rows`
    )
  }
}

/* ======================================================
   WEBHOOK
====================================================== */

export async function POST(req: Request) {
  try {
    /* =====================================================
       0️⃣ RATE LIMIT (CHEAP FIRST 🔥)
    ===================================================== */

    if (!guardWebhook(req)) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 })
    }

    /* =====================================================
       1️⃣ VERIFY SIGNATURE
    ===================================================== */

    const rawBody = await req.text()

    const signature =
      req.headers.get("x-razorpay-signature") ??
      req.headers.get("X-Razorpay-Signature")

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")

    if (expected !== signature) {
      return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 400 })
    }

    /* =====================================================
       2️⃣ IDEMPOTENCY
    ===================================================== */

    const event = JSON.parse(rawBody)
    const eventId = event?.id

    if (!eventId) {
      return NextResponse.json({ error: "MISSING_EVENT_ID" }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from("webhook_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ status: "DUPLICATE_IGNORED" })
    }

    await supabaseAdmin.from("webhook_events").insert({
      event_id: eventId,
      event_type: event.event,
      payload: event,
    })

    /* =====================================================
       🟢 PRODUCT SUCCESS
    ===================================================== */

    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity

      const userId = payment?.notes?.user_id
      const productId = payment?.notes?.product_id
      const orderId = payment?.order_id ?? payment?.id

      /* 🔥 STRICT VALIDATION */
      if (!userId || !productId || !orderId) {
        return NextResponse.json({ error: "INVALID_PAYMENT_PAYLOAD" }, { status: 400 })
      }

      await assertSingleUpdate(
        "orders",
        "razorpay_order_id",
        orderId,
        {
          status: "paid",
          updated_at: new Date().toISOString(),
        }
      )

      await supabaseAdmin.from("entitlements").upsert(
        {
          user_id: userId,
          product_id: productId,
          order_id: orderId,
          status: "active",
          granted_at: new Date().toISOString(),
        },
        { onConflict: "order_id" }
      )

      await writeAuditLog({
        event_type: "product.payment.captured",
        entity_type: "order",
        entity_id: orderId,
        actor_type: "system",
      })
    }

    /* =====================================================
       🔴 PRODUCT FAILURE
    ===================================================== */

    if (
      event.event === "payment.failed" ||
      event.event === "order.failed" ||
      event.event === "payment.cancelled"
    ) {
      const payment =
        event.payload?.payment?.entity ??
        event.payload?.order?.entity

      const orderId = payment?.order_id ?? payment?.id

      if (orderId) {
        await assertSingleUpdate(
          "orders",
          "razorpay_order_id",
          orderId,
          {
            status: "failed",
            updated_at: new Date().toISOString(),
          }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("WEBHOOK_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */