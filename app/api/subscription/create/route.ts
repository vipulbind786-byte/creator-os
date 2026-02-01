// app/api/subscription/create/route.ts
// 🔒 OP-10 (SECONDARY): SUBSCRIPTION CREATION — OWNERSHIP-BOUND
// BIRTH WITH OWNER • WEBHOOK-SAFE • ZERO AMBIGUITY

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import Razorpay from "razorpay"
import { writeAuditLog } from "@/lib/audit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  try {
    /* -------------------------------------------------
       ENV VALIDATION
    -------------------------------------------------- */
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET
    const PLAN_ID = process.env.RAZORPAY_PLAN_ID

    if (!key_id || !key_secret || !PLAN_ID) {
      return NextResponse.json(
        { error: "Razorpay configuration missing" },
        { status: 500 }
      )
    }

    /* -------------------------------------------------
       AUTH (SERVER — SOURCE OF TRUTH)
    -------------------------------------------------- */
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
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* -------------------------------------------------
       RAZORPAY CLIENT
    -------------------------------------------------- */
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    })

    /* -------------------------------------------------
       CREATE SUBSCRIPTION (OWNER BOUND AT BIRTH)
    -------------------------------------------------- */
    const subscription = await razorpay.subscriptions.create({
      plan_id: PLAN_ID,
      customer_notify: 1,
      total_count: 12, // monthly × 12
      notes: {
        user_id: user.id,          // 🔐 OWNER
        plan_id: PLAN_ID,          // 🔐 PLAN TRACEABILITY
        source: "creator_platform" // optional, audit-friendly
      },
    })

    /* -------------------------------------------------
       AUDIT (BEST-EFFORT)
    -------------------------------------------------- */
    await writeAuditLog({
      event_type: "subscription.created",
      entity_type: "subscription",
      entity_id: subscription.id,
      actor_type: "user",
      actor_id: user.id,
      context: {
        plan_id: PLAN_ID,
      },
    })

    return NextResponse.json({
      subscription_id: subscription.id,
    })
  } catch (err) {
    console.error("SUBSCRIPTION_CREATE_FATAL", err)
    return NextResponse.json(
      { error: "Subscription create failed" },
      { status: 500 }
    )
  }
}