import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return NextResponse.json(
        { error: "Razorpay env missing" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 50000, // paise
      currency: "INR",
    });

    // ❌ JSON.parse mat kar
    // ✅ Direct object return kar
    return NextResponse.json(order);

  } catch (err: any) {
  console.error("Razorpay FULL error 👉", err);
  console.error("Razorpay message 👉", err?.message);
  console.error("Razorpay response 👉", err?.error);

  return NextResponse.json(
    {
      error: "Failed to create order",
      razorpayMessage: err?.message,
      razorpayError: err?.error,
    },
    { status: 500 }
  );
  }
}