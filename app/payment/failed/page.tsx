"use client"

import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border p-8 text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500" />

        <h1 className="mt-4 text-2xl font-bold">
          Payment Failed ❌
        </h1>

        <p className="mt-2 text-muted-foreground">
          Your payment could not be completed. No money has been deducted.
        </p>

        <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
          <p>⚠️ Possible reasons:</p>
          <p className="mt-1">• Bank / UPI declined</p>
          <p>• Test mode limitation</p>
          <p>• Network issue</p>
        </div>

        <Button
          className="mt-6 w-full"
          onClick={() => (window.location.href = "/product/demo")}
        >
          Try Again
        </Button>

        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() => (window.location.href = "/")}
        >
          Go to Home
        </Button>
      </div>
    </div>
  )
}