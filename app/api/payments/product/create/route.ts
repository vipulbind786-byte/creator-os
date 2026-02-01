// app/api/payments/product/create/route.ts
// 🔒 PHASE-B STEP-1: PRODUCT PAYMENT ORDER CREATION — FINAL
// SERVER ONLY • WEBHOOK AUTHORITY • NO TRUST CLIENT
// ❌ NO entitlement here
// ❌ NO order success here
// ✅ ONLY Razorpay order creation

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import Razorpay from "razorpay"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   Razorpay (SERVER SECRET ONLY)
====================================================== */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

/* ======================================================
   POST /api/payments/product/create
   body: { productId: string }
====================================================== */
export async function POST(req: Request) {
  try {
    /* -----------------------------
       Auth (REQUIRED)
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
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    /* -----------------------------
       Parse input
    ----------------------------- */
    const body = await req.json()
    const productId: string | undefined = body?.productId

    if (!productId) {
      return NextResponse.json(
        { error: "MISSING_PRODUCT_ID" },
        { status: 400 }
      )
    }

    /* -----------------------------
       Fetch product (SOURCE OF TRUTH)
       Only ACTIVE allowed
    ----------------------------- */
    const { data: product, error } = await supabase
      .from("products")
      .select("id, price, status, creator_id")
      .eq("id", productId)
      .eq("status", "active")
      .maybeSingle()

    if (error || !product) {
      return NextResponse.json(
        { error: "PRODUCT_NOT_AVAILABLE" },
        { status: 404 }
      )
    }

    /* -----------------------------
       Create Razorpay order
       Amount in paise
    ----------------------------- */
    const order = await razorpay.orders.create({
      amount: Number(product.price),
      currency: "INR",
      receipt: `prod_${product.id}_${user.id}`,
      notes: {
        user_id: user.id,
        product_id: product.id,
        creator_id: product.creator_id,
      },
    })

    /* -----------------------------
       Return ONLY order payload
       Client pays → webhook decides truth
    ----------------------------- */
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error("PRODUCT_PAYMENT_CREATE_ERROR", err)

    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}