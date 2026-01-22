"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

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

      const res = await fetch("/api/payments/create-order", {
        method: "POST",
      })

      const order = await res.json()

      if (!order?.id) {
        alert("Order create failed")
        return
      }

      const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      if (!RAZORPAY_KEY) {
        alert("Razorpay key missing")
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"

      script.onload = () => {
        const options = {
          key: RAZORPAY_KEY,
          amount: order.amount,
          currency: "INR",
          name: "Creator OS",
          description: product.name,
          order_id: order.id,
          handler: function () {
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

        // @ts-ignore
        const rzp = new window.Razorpay(options)
        rzp.open()
      }

      document.body.appendChild(script)
    } catch (err) {
      console.error(err)
      alert("Payment failed")
    } finally {
      setLoading(false)
    }
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