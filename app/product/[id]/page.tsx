"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

declare global {
  interface Window {
    Razorpay: any
  }
}

const product = {
  id: "1",
  name: "Complete UI Kit",
  description:
    "A comprehensive collection of 200+ professionally designed UI components.",
  price: 500, // INR
  creator: "John Doe",
}

export default function ProductSalesPage() {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setLoading(true)

      // 1️⃣ Create order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
      })

      const order = await res.json()
      console.log("ORDER =", order)

      if (!order?.id) {
        alert("Order create failed")
        return
      }

      // 2️⃣ Load Razorpay script
      if (!window.Razorpay) {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true

        script.onload = () => openRazorpay(order)
        document.body.appendChild(script)
      } else {
        openRazorpay(order)
      }
    } catch (err) {
      console.error(err)
      alert("Payment failed")
    } finally {
      setLoading(false)
    }
  }

  const openRazorpay = (order: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Creator OS",
      description: product.name,
      order_id: order.id,
      handler: function (response: any) {
        console.log("PAYMENT SUCCESS =", response)
        alert("Payment successful 🎉")
      },
      prefill: {
        name: "Test User",
        email: "test@example.com",
      },
      theme: {
        color: "#22c55e",
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-xl rounded-xl border p-8">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-3 text-muted-foreground">{product.description}</p>

        <div className="mt-6 text-3xl font-semibold">₹{product.price}</div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="mt-6 w-full text-lg"
        >
          {loading ? "Processing..." : "Buy Now"}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Secure payment via Razorpay
        </p>
      </div>
    </div>
  )
}