import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay env missing" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const order = await razorpay.orders.create({
      amount: 50000, // 500 INR (paise)
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("RAZORPAY ERROR:", err);
    return NextResponse.json(
      {
        error: "Failed to create order",
        razorpayError: err?.error || err,
      },
      { status: 500 }
    );
  }
}