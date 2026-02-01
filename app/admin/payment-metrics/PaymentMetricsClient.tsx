"use client"

import { useEffect, useRef, useState } from "react"

type Metrics = {
  total_orders: number
  success_orders: number
  failed_orders: number
  pending_orders: number

  total_revenue?: number
  total_revenue_rupees?: number
  success_rate?: number
  failure_rate?: number
}

const POLL_INTERVAL = 5000

export default function PaymentMetricsClient() {
  const [data, setData] = useState<Metrics | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  /* =============================
     SAFE POLLING
  ============================= */
  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        controllerRef.current?.abort()
        controllerRef.current = new AbortController()

        const res = await fetch("/api/admin/payment-metrics", {
          cache: "no-store",
          signal: controllerRef.current.signal,
        })

        if (!res.ok) return

        const json = await res.json()
        if (active) setData(json)
      } catch {}
    }

    load()
    const interval = setInterval(load, POLL_INTERVAL)

    return () => {
      active = false
      controllerRef.current?.abort()
      clearInterval(interval)
    }
  }, [])

  /* =============================
     LOADING
  ============================= */
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading metrics…</p>
      </main>
    )
  }

  const cards = [
    { label: "Total Orders", value: data.total_orders },
    { label: "Successful", value: data.success_orders },
    { label: "Failed", value: data.failed_orders },
    { label: "Pending", value: data.pending_orders },
    { label: "Revenue (₹)", value: data.total_revenue_rupees ?? 0 },
    { label: "Success %", value: `${data.success_rate ?? 0}%` },
    { label: "Failure %", value: `${data.failure_rate ?? 0}%` },
  ]

  /* =============================
     UI (🔥 HIGH CONTRAST FIX)
  ============================= */
  return (
    <main className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold mb-8 text-foreground">
        Payment Metrics (Live)
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="
              rounded-xl
              border
              p-6
              bg-card
              text-center
              shadow-sm
            "
          >
            {/* label */}
            <p className="text-sm text-muted-foreground">
              {c.label}
            </p>

            {/* 🔥 STRONG CONTRAST NUMBER */}
            <p className="text-3xl font-bold mt-2 text-black dark:text-white">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}