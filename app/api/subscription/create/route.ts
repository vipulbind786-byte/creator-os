import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay keys missing" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // 🔒 Razorpay Dashboard se jo PLAN ID mila hai
    const PLAN_ID = process.env.RAZORPAY_PLAN_ID;

    if (!PLAN_ID) {
      return NextResponse.json(
        { error: "Razorpay plan id missing" },
        { status: 500 }
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: PLAN_ID,
      customer_notify: 1,
      total_count: 12, // monthly → 12 months
    });

    return NextResponse.json({
      subscription_id: subscription.id,
    });
  } catch (err) {
    console.error("SUBSCRIPTION CREATE ERROR:", err);
    return NextResponse.json(
      { error: "Subscription create failed" },
      { status: 500 }
    );
  }
}