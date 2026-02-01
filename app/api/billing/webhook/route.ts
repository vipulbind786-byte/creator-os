// /app/api/billing/webhook/route.ts

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

import { createClient } from "@supabase/supabase-js"
import type { BillingPlanId } from "@/lib/billing/types"

/* ======================================================
   STRIPE CLIENT (SERVER ONLY)
   ❌ DO NOT set apiVersion manually
====================================================== */

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
)

/* ======================================================
   SUPABASE (SERVICE ROLE — REQUIRED)
   ⚠️ NEVER use anon key here
====================================================== */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

/* ======================================================
   POST /api/billing/webhook
====================================================== */

export async function POST(req: Request) {
  const body = await req.text()

  const headerList = await headers()
  const signature = headerList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "MISSING_SIGNATURE" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err) {
    console.error("❌ Stripe signature verification failed", err)
    return NextResponse.json(
      { error: "INVALID_SIGNATURE" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      /* ----------------------------------
         CHECKOUT COMPLETED
      ---------------------------------- */
      case "checkout.session.completed": {
        const session =
          event.data.object as Stripe.Checkout.Session

        const userId = session.metadata?.user_id
        const planId =
          session.metadata?.plan_id as
            | BillingPlanId
            | undefined

        const subscriptionId =
          session.subscription as string | null

        if (!userId || !planId || !subscriptionId) {
          console.warn("⚠️ Missing checkout metadata")
          break
        }

        await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: subscriptionId,
            status: "active",
          })

        break
      }

      /* ----------------------------------
         SUBSCRIPTION CANCELLED
      ---------------------------------- */
      case "customer.subscription.deleted": {
        const sub =
          event.data.object as Stripe.Subscription

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", sub.id)

        break
      }

      /* ----------------------------------
         PAYMENT FAILED
      ---------------------------------- */
      case "invoice.payment_failed": {
  const invoice =
    event.data.object as Stripe.Invoice

  const subscriptionId =
    typeof (invoice as any).subscription === "string"
      ? (invoice as any).subscription
      : null

  if (!subscriptionId) break

  await supabase
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", subscriptionId)

  break
}

      default:
        // Safe ignore
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("🔥 WEBHOOK HANDLER FAILED", err)

    return NextResponse.json(
      { error: "WEBHOOK_FAILED" },
      { status: 500 }
    )
  }
}