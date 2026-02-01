"use client"

import { useEffect, useRef, useState } from "react"
import type { Insight, InsightKind } from "@/types/insight"

/* ======================================================
   PROPS (LOCKED)
====================================================== */

type Props = {
  insights: Insight[]
}

/* ======================================================
   SEVERITY UI MAP (ENGINE SAFE)
====================================================== */

const SEVERITY_UI: Record<
  InsightKind,
  { border: string; bg: string }
> = {
  warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
  },
  success: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
  },
  info: {
    border: "border-slate-200",
    bg: "bg-slate-50",
  },
}

/* ======================================================
   COMPONENT (P2 — FINAL, DUMB & SAFE)
====================================================== */

export default function InsightStack({ insights }: Props) {
  const seenRef = useRef<Set<string>>(new Set())
  const dismissedRef = useRef<Set<string>>(new Set())

  const [visibleInsights, setVisibleInsights] =
    useState<Insight[]>([])

  /* -------------------------------
     SYNC INPUT → STATE
  -------------------------------- */
  useEffect(() => {
    setVisibleInsights(
      insights.filter(
        (i) => !dismissedRef.current.has(i.id)
      )
    )
  }, [insights])

  /* -------------------------------
     MARK AS SEEN (ONCE)
  -------------------------------- */
  useEffect(() => {
    if (!visibleInsights.length) return

    const unseenIds: string[] = []

    for (const i of visibleInsights) {
      if (!seenRef.current.has(i.id)) {
        seenRef.current.add(i.id)
        unseenIds.push(i.id)
      }
    }

    if (!unseenIds.length) return

    fetch("/api/insights/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightIds: unseenIds }),
      keepalive: true,
    }).catch(() => {})
  }, [visibleInsights])

  /* -------------------------------
     DISMISS
  -------------------------------- */
  function dismissInsight(id: string) {
    dismissedRef.current.add(id)
    setVisibleInsights((prev) =>
      prev.filter((i) => i.id !== id)
    )

    fetch("/api/insights/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId: id }),
    }).catch(() => {})
  }

  if (visibleInsights.length === 0) return null

  return (
    <div className="space-y-3">
      {visibleInsights.map((i) => {
        const ui = SEVERITY_UI[i.kind]

        return (
          <div
            key={i.id}
            className={`rounded-xl border p-4 ${ui.border} ${ui.bg}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  {i.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {i.body}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismissInsight(i.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
                aria-label="Dismiss insight"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}