/* ======================================================
   🔒 PHASE-1 HARD LOCK
   CREATE ORDER — AUTHORITATIVE

   ✔ single source of truth
   ✔ webhook-safe (notes injected)
   ✔ idempotent
   ✔ entitlement safe
   ✔ audit safe
   ✔ rate limited
   ✔ zod validated
   ✔ production hardened

   DO NOT MODIFY AGAIN
====================================================== */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { z } from "zod"

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { razorpay } from "@/lib/razorpay"
import { hasActiveEntitlement } from "@/lib/entitlement"
import { writeAuditLog } from "@/lib/audit"
import { guardAPI } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   INPUT SCHEMA (STRICT)
====================================================== */

const schema = z.object({
  productId: z.string().uuid(),
})

/* ======================================================
   ROUTE
====================================================== */

export async function POST(req: Request) {
  try {
    /* =====================================================
       1️⃣ RATE LIMIT (cheap first)
    ===================================================== */

    if (!guardAPI(req)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    /* =====================================================
       2️⃣ VALIDATE INPUT
    ===================================================== */

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { productId } = parsed.data

    /* =====================================================
       3️⃣ AUTH
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

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* =====================================================
       PRODUCT (ADMIN TRUTH)
    ===================================================== */

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, price, creator_id, status, publish_at")
      .eq("id", productId)
      .maybeSingle()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.status === "scheduled") {
      if (!product.publish_at || new Date(product.publish_at) > new Date()) {
        return NextResponse.json({ error: "Not live yet" }, { status: 403 })
      }
    }

    if (product.status !== "active" && product.status !== "scheduled") {
      return NextResponse.json({ error: "Not purchasable" }, { status: 403 })
    }

    /* =====================================================
       ENTITLEMENT HARD BLOCK
    ===================================================== */

    const alreadyOwned = await hasActiveEntitlement(user.id, productId)

    if (alreadyOwned) {
      return NextResponse.json({ error: "Already purchased" }, { status: 409 })
    }

    /* =====================================================
       REUSE PENDING ORDER (IDEMPOTENT)
    ===================================================== */

    const { data: existing } = await supabaseAdmin
      .from("orders")
      .select("razorpay_order_id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle()

    if (existing?.razorpay_order_id) {
      return NextResponse.json({
        checkoutUrl: `/api/payments/checkout?orderId=${existing.razorpay_order_id}`,
        reused: true,
      })
    }

    /* =====================================================
       CREATE RAZORPAY ORDER
    ===================================================== */

    const amountPaise = Math.round(Number(product.price) * 100)

    const rpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `prod_${productId}_${Date.now()}`,
      notes: {
        user_id: user.id,
        product_id: productId,
        creator_id: product.creator_id,
      },
    })

    /* =====================================================
       INSERT ORDER
    ===================================================== */

    await supabaseAdmin.from("orders").insert({
      product_id: productId,
      creator_id: product.creator_id,
      user_id: user.id,
      buyer_email: user.email,
      amount: amountPaise,
      currency: "INR",
      status: "pending",
      payment_provider: "razorpay",
      razorpay_order_id: rpOrder.id,
    })

    await writeAuditLog({
      event_type: "order.created",
      entity_type: "product",
      entity_id: productId,
      actor_type: "user",
      actor_id: user.id,
    })

    /* =====================================================
       RETURN
    ===================================================== */

    return NextResponse.json({
      checkoutUrl: `/api/payments/checkout?orderId=${rpOrder.id}`,
      reused: false,
    })
  } catch (err) {
    console.error("CREATE_ORDER_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */