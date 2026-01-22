import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // ✅ Runtime safety check
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay env missing" },
        { status: 500 }
      );
    }

    // ✅ IMPORT INSIDE FUNCTION (VERY IMPORTANT)
    const Razorpay = (await import("razorpay")).default;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: 50000,        // paise (₹500)
      currency: "INR",
      receipt: "order_rcptid_1",
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Razorpay error:", err);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}