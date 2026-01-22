"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

export default function ProductSalesPage() {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (!RAZORPAY_KEY) {
      alert("Razorpay key missing")
      return
    }

    const res = await fetch("/api/payments/create-order", {
      method: "POST",
    })

    const order = await res.json()

    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: "INR",
      name: "Creator OS",
      order_id: order.id,
      handler: () => alert("Payment success 🎉"),
    }

    // @ts-ignore
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div className="p-10">
      <Button onClick={handlePayment}>
        Buy Now
      </Button>
    </div>
  )
}