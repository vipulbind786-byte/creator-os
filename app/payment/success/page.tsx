"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

        <h1 className="mt-4 text-2xl font-bold">
          Payment Successful 🎉
        </h1>

        <p className="mt-2 text-muted-foreground">
          Thank you for your purchase. Your payment has been verified successfully.
        </p>

        <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
          <p>
            ✅ Order confirmed
          </p>
          <p className="mt-1">
            📩 Access details will be sent to your email
          </p>
        </div>

        <Button
          className="mt-6 w-full"
          onClick={() => (window.location.href = "/")}
        >
          Go to Home
        </Button>
      </div>
    </div>
  )
}