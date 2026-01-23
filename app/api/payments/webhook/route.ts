import { NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    console.log("🔥 WEBHOOK HIT")
    console.log("➡️ RAW BODY:", body)
    console.log("➡️ SIGNATURE:", signature)

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!secret || !signature) {
      console.error("❌ Missing webhook secret or signature")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== signature) {
      console.error("❌ Signature mismatch")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    console.log("✅ VERIFIED WEBHOOK EVENT")
    console.log("📦 EVENT TYPE:", event.event)
    console.log("📦 EVENT DATA:", event.payload)

    if (event.event === "payment.captured") {
      console.log("💰 PAYMENT CAPTURED")
      console.log("💳 PAYMENT ID:", event.payload.payment.entity.id)
      console.log("💵 AMOUNT:", event.payload.payment.entity.amount)
    }

    if (event.event === "order.paid") {
      console.log("📦 ORDER PAID")
      console.log("🧾 ORDER ID:", event.payload.order.entity.id)
    }

    return NextResponse.json({ status: "ok" })
  } catch (err) {
    console.error("🔥 WEBHOOK ERROR:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}