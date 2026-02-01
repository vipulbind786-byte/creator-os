// app/payment/failed/page.tsx
// 🔒 PHASE-B HARD LOCK — FAILED PAGE
// PURE UI ONLY
// ❌ NO DB
// ❌ NO TRUST
// ❌ NO BUSINESS LOGIC
// ✅ RETRY ALWAYS VIA /payment/start

import { AlertCircle, ArrowRight, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

type Props = {
  searchParams: {
    productId?: string
  }
}

export default function PaymentFailedPage({ searchParams }: Props) {
  const productId = searchParams.productId

  /* -----------------------------
     HARD GUARD
  ----------------------------- */
  if (!productId) redirect("/")

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border p-8 text-center bg-card">
        <AlertCircle className="mx-auto h-14 w-14 text-amber-500" />

        <h1 className="mt-4 text-xl font-semibold">
          Payment not completed
        </h1>

        <p className="mt-2 text-muted-foreground text-sm">
          Your payment didn’t go through.  
          No money has been deducted.
        </p>

        {/* -----------------------------
           SAFE RETRY ONLY
        ----------------------------- */}
        <div className="mt-6 space-y-3">
          <Button asChild className="w-full">
            <Link href={`/payment/start?productId=${productId}`}>
              Try Again
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <CreditCard className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Access is granted only after successful payment.
        </p>
      </div>
    </main>
  )
}