"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { formatCurrency } from "@/lib/formatters/currency"

/* ======================================================
   TYPES (LOCKED — explain.ts CONTRACT)
   ⚠️ Do NOT tighten unions here
====================================================== */

type ExplainPayload = {
  insight: {
    id: string
    kind: "warning" | "info" | "success" | string
    title: string
  }
  trigger: {
    metric_key: string
    metric_value: string | number
    threshold?: string | number
    comparison: string
  }
  state: {
    status: "active" | "cooldown" | "dismissed" | string
    next_eligible_at?: string
    cooldown_reason?: string
  }
  why_now: {
    explanation: string
  }
  recommendation?: {
    message: string
    action_hint?: string
  }
}

/* ======================================================
   I18N KEYS (SINGLE SOURCE FOR UI TEXT)
   🔒 Never inline strings in JSX
====================================================== */

const I18N = {
  title: "explain.title",
  loading: "explain.loading",
  error: "explain.error",

  insight: "explain.insight",
  triggered_by: "explain.triggered_by",
  current_value: "explain.current_value",
  status: "explain.status",
  why_now: "explain.why_now",
  suggestion: "explain.suggestion",

  cooldown_title: "explain.cooldown.title",
  cooldown_reason: "explain.cooldown.reason",
  cooldown_next: "explain.cooldown.next",
} as const

/* ======================================================
   COMPONENT
====================================================== */

export function InsightExplainDrawer({
  insightId,
  open,
  onClose,
  t = (k: string) => k, // 🔒 fallback-safe
}: {
  insightId: string | null
  open: boolean
  onClose: () => void
  t?: (key: string) => string
}) {
  const [data, setData] = useState<ExplainPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* -------------------------------
     FETCH (ABORT + STALE SAFE)
  -------------------------------- */
  useEffect(() => {
    if (!open || !insightId) return

    const controller = new AbortController()

    setLoading(true)
    setError(null)
    setData(null)

    fetch("/api/insights/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((res) => {
        if (!controller.signal.aborted) {
          setData(res?.explanation ?? null)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(t(I18N.error))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [open, insightId, t])

  if (!open) return null

  /* -------------------------------
     PURE HELPERS
  -------------------------------- */
  const renderValue = (v: string | number) =>
    typeof v === "number" ? formatCurrency(v) : String(v)

  const renderDate = (iso?: string) => {
    if (!iso) return "—"
    const d = new Date(iso)
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
  }

  const isCooldown = data?.state.status === "cooldown"

  /* -------------------------------
     UI
  -------------------------------- */
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="insight-explain-title"
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-background p-6 shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X />
        </button>

        {/* Title */}
        <h2
          id="insight-explain-title"
          className="mb-6 text-lg font-semibold"
        >
          {t(I18N.title)}
        </h2>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-muted-foreground">
            {t(I18N.loading)}
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Content */}
        {data && (
          <div className="space-y-5 text-sm">
            {/* INSIGHT */}
            <section>
              <p className="font-medium">
                {t(I18N.insight)}
              </p>
              <p className="text-muted-foreground">
                {data.insight.title}
              </p>
            </section>

            <hr className="border-border/40" />

            {/* TRIGGER */}
            <section>
              <p className="font-medium">
                {t(I18N.triggered_by)}
              </p>
              <p className="text-muted-foreground">
                {data.trigger.metric_key}{" "}
                {data.trigger.comparison}{" "}
                {data.trigger.threshold ?? "—"}
              </p>
            </section>

            {/* CURRENT VALUE */}
            <section>
              <p className="font-medium">
                {t(I18N.current_value)}
              </p>
              <p className="text-muted-foreground">
                {renderValue(
                  data.trigger.metric_value
                )}
              </p>
            </section>

            {/* STATUS */}
            <section>
              <p className="font-medium">
                {t(I18N.status)}
              </p>
              <p className="text-muted-foreground capitalize">
                {data.state.status}
              </p>
            </section>

            <hr className="border-border/40" />

            {/* WHY NOW */}
            <section>
              <p className="font-medium">
                {t(I18N.why_now)}
              </p>
              <p className="text-muted-foreground">
                {data.why_now.explanation}
              </p>
            </section>

            {/* COOLDOWN */}
            {isCooldown && (
              <section className="rounded-md border border-dashed bg-muted/40 p-3">
                <p className="font-medium">
                  {t(I18N.cooldown_title)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {data.state.cooldown_reason ??
                    t(I18N.cooldown_reason)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t(I18N.cooldown_next)}{" "}
                  <span className="font-medium">
                    {renderDate(
                      data.state.next_eligible_at
                    )}
                  </span>
                </p>
              </section>
            )}

            {/* RECOMMENDATION */}
            {data.recommendation && (
              <section className="rounded-md bg-muted p-3">
                <p className="font-medium">
                  {t(I18N.suggestion)}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {data.recommendation.message}
                </p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}