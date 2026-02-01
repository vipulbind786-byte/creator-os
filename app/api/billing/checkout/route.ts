// app/api/billing/checkout/route.ts

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { cookies } from "next/headers"

import { createServerClient } from "@supabase/ssr"

import { getStripePriceForPlan } from "@/lib/billing/stripeMap"
import type { BillingPlanId } from "@/lib/billing/types"

/* ======================================================
   STRIPE CLIENT (SERVER ONLY)
   ❌ Never import in client
====================================================== */

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string,
)
/* ======================================================
   POST /api/billing/checkout

   ✔ Auth required
   ✔ Plan validated
   ✔ Stripe isolated
   ✔ Upgrade / downgrade ready
   ✔ Webhook-safe metadata
====================================================== */

export async function POST(req: Request) {
  try {
    /* -------------------------------
       Parse + validate input
    -------------------------------- */
    const body = await req.json()
    const planId = body?.planId as
      | BillingPlanId
      | undefined

    if (!planId) {
      return NextResponse.json(
        { error: "PLAN_ID_REQUIRED" },
        { status: 400 }
      )
    }

    const priceId =
      getStripePriceForPlan(planId)

    if (!priceId) {
      return NextResponse.json(
        { error: "INVALID_PLAN" },
        { status: 400 }
      )
    }

    /* -------------------------------
       Supabase Auth (SERVER)
    -------------------------------- */
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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
        { error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    /* -------------------------------
       Create Stripe Checkout Session
    -------------------------------- */
    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        customer_email: user.email ?? undefined,

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,

        /**
         * 🔒 METADATA CONTRACT
         * Used by webhook → DB sync
         */
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      })

    return NextResponse.json({
      url: session.url,
    })
  } catch (err) {
    console.error("🔥 BILLING CHECKOUT FAILED", err)

    return NextResponse.json(
      { error: "CHECKOUT_FAILED" },
      { status: 500 }
    )
  }
}