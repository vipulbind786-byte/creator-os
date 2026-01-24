import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    /* =====================================================
       1️⃣ VERIFY RAZORPAY WEBHOOK SIGNATURE (RAW BODY)
    ===================================================== */
    const rawBody = await req.text();

    const signature =
      req.headers.get("x-razorpay-signature") ??
      req.headers.get("X-Razorpay-Signature");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    /* =====================================================
       2️⃣ PARSE EVENT + IDEMPOTENCY CHECK
    ===================================================== */
    const event = JSON.parse(rawBody);
    const eventId: string | null = event?.id ?? null;

    if (eventId) {
      const { data: existing } = await supabaseAdmin
        .from("webhook_events")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ status: "duplicate_ignored" });
      }
    }

    // Store raw webhook for audit/debug
    await supabaseAdmin.from("webhook_events").insert({
      event_id: eventId,
      event_type: event.event,
      payload: event,
    });

    /* =====================================================
       3️⃣ ONE-TIME PRODUCT PAYMENTS → ENTITLEMENTS
    ===================================================== */
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("id, user_id, product_id, status")
        .eq("razorpay_order_id", payment.order_id)
        .maybeSingle();

      if (order && order.status !== "paid") {
        await supabaseAdmin
          .from("orders")
          .update({
            razorpay_payment_id: payment.id,
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        await supabaseAdmin.from("entitlements").upsert(
          {
            user_id: order.user_id,
            product_id: order.product_id,
            order_id: order.id,
            status: "active",
          },
          { onConflict: "user_id,product_id" }
        );

        // 🔐 AUDIT
        await writeAuditLog({
          event_type: "payment.captured",
          entity_type: "order",
          entity_id: order.id,
          actor_type: "system",
          context: {
            razorpay_order_id: payment.order_id,
            amount: payment.amount,
          },
        });
      }
    }

    if (
      event.event === "payment.failed" ||
      event.event === "refund.processed"
    ) {
      const payment =
        event.payload?.payment?.entity ??
        event.payload?.refund?.entity;

      if (payment?.order_id) {
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("razorpay_order_id", payment.order_id)
          .maybeSingle();

        if (order) {
          await supabaseAdmin
            .from("entitlements")
            .update({
              status: "revoked",
              revoked_at: new Date().toISOString(),
            })
            .eq("order_id", order.id);

          // 🔐 AUDIT
          await writeAuditLog({
            event_type: event.event,
            entity_type: "order",
            entity_id: order.id,
            actor_type: "system",
            context: {
              razorpay_order_id: payment.order_id,
            },
          });
        }
      }
    }

    /* =====================================================
       4️⃣ SUBSCRIPTIONS → CREATOR PLAN CONTROL
    ===================================================== */
    if (event.event === "subscription.activated") {
      const sub = event.payload.subscription.entity;

      await supabaseAdmin.from("creator_plan").upsert(
        {
          user_id: sub.notes?.user_id ?? null,
          plan_id: sub.notes?.plan_id ?? null,
          razorpay_subscription_id: sub.id,
          status: "active",
          started_at: new Date(sub.start_at * 1000).toISOString(),
        },
        { onConflict: "razorpay_subscription_id" }
      );

      // 🔐 AUDIT
      await writeAuditLog({
        event_type: "subscription.activated",
        entity_type: "subscription",
        entity_id: sub.id,
        actor_type: "system",
        context: {
          plan_id: sub.plan_id,
        },
      });
    }

    if (
      event.event === "subscription.cancelled" ||
      event.event === "subscription.halted" ||
      event.event === "subscription.completed"
    ) {
      const sub = event.payload.subscription.entity;

      await supabaseAdmin
        .from("creator_plan")
        .update({
          status: "cancelled",
          ends_at: new Date().toISOString(),
        })
        .eq("razorpay_subscription_id", sub.id);

      // 🔐 AUDIT
      await writeAuditLog({
        event_type: event.event,
        entity_type: "subscription",
        entity_id: sub.id,
        actor_type: "system",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}