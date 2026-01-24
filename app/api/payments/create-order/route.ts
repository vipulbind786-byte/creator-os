import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { validateRazorpayEnv } from "@/lib/env"

export const runtime = "nodejs"   // 🔴 VERY IMPORTANT
export const dynamic = "force-dynamic"

export async function POST() {
  try {
    // Validate environment variables
    const { keyId, keySecret } = validateRazorpayEnv()

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount: 50000, // ₹500 in paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    })

    return NextResponse.json(order)
  } catch (err: any) {
    console.error("❌ CREATE ORDER ERROR:", err)
    return NextResponse.json(
      { error: "Failed to create order", raw: err?.message },
      { status: 500 }
    )
  }
}
