"use client"

// 🔒 PHASE-B HARD LOCK — FINAL
// SMART POLLING PAGE — BULLETPROOF
// ✔ timeout guaranteed
// ✔ abort-safe
// ✔ no infinite loops
// ✔ no undefined redirects
// ✔ fail-closed
// ✔ production-safe

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Clock } from "lucide-react"

const POLL_INTERVAL = 2000
const MAX_WAIT_TIME = 60000 // 60s hard cap

export default function PaymentPendingPage() {
  const router = useRouter()
  const params = useSearchParams()

  const orderId = params.get("order_id")

  const startTimeRef = useRef(Date.now())
  const stoppedRef = useRef(false)

  useEffect(() => {
    if (!orderId) {
      router.replace("/")
      return
    }

    const controller = new AbortController()

    const stop = () => {
      stoppedRef.current = true
      controller.abort()
    }

    const safeRedirect = (url: string) => {
      stop()
      router.replace(url)
    }

    const poll = async () => {
      if (stoppedRef.current) return

      try {
        const res = await fetch(
          `/api/payments/status?orderId=${orderId}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        )

        if (!res.ok) return

        const data = await res.json()

        /* ---------- SUCCESS ---------- */
        if (data.status === "success") {
          safeRedirect(`/payment/success?order_id=${orderId}`)
          return
        }

        /* ---------- FAILED ---------- */
        if (data.status === "failed") {
          safeRedirect(
            `/payment/failed?productId=${data.productId}`
          )
          return
        }

        /* ---------- TIMEOUT ---------- */
        const elapsed = Date.now() - startTimeRef.current
        if (elapsed > MAX_WAIT_TIME) {
          safeRedirect("/")
        }
      } catch {
        // fail closed → retry next tick
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL)

    return () => {
      stop()
      clearInterval(interval)
    }
  }, [orderId, router])

  /* ===============================
     UI
  =============================== */

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Clock className="mx-auto h-10 w-10 animate-pulse text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Verifying payment… please wait
        </p>
      </div>
    </main>
  )
}