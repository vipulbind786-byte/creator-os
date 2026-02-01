// /lib/insights/evaluate.ts

import type { DashboardMetrics, Insight } from "@/types/insight"
import { ALL_RULES } from "./rules"
import {
  evaluateInsightCooldown,
  type InsightCooldownState,
} from "./cooldown"

/* ======================================================
   INSIGHT EVALUATION ENGINE — P3 (LOCKED)

   ✔ Rule-based
   ✔ Cooldown + snooze + frequency-aware
   ✔ Severity escalation aware
   ✔ Deterministic (time-injected)
   ✔ Pure logic

   ❌ NO dedupe
   ❌ NO session cap
   ❌ NO DB
   ❌ NO UI
====================================================== */

export type EvaluateInsightParams = {
  metrics: DashboardMetrics
  insightStates?: Array<
    InsightCooldownState & { insight_id: string }
  >
  now?: Date
}

/**
 * 🔒 INTERNAL ENGINE OUTPUT
 * NEVER leak to UI directly
 */
export type EvaluatedInsight = Insight & {
  decisionReason:
    | "first_time"
    | "snoozed"
    | "frequency_capped"
    | "cooldown_active"
    | "cooldown_expired"
    | "severity_escalated"
}

export function evaluateInsights(
  params: EvaluateInsightParams
): EvaluatedInsight[] {
  try {
    const {
      metrics,
      insightStates = [],
      now = new Date(),
    } = params

    // 🔐 Guard: invalid metrics => no insights
    if (!isValidMetrics(metrics)) return []

    /* ----------------------------------
       Index persisted insight state
       O(1) lookup, deterministic
    ---------------------------------- */
    const stateMap = new Map<string, InsightCooldownState>()
    for (const s of insightStates) {
      stateMap.set(s.insight_id, s)
    }

    const evaluated: EvaluatedInsight[] = []

    for (const rule of ALL_RULES) {
      let insight: Insight | null = null

      try {
        insight = rule(metrics)
      } catch (err) {
        // Rule failure must NEVER crash engine
        if (process.env.NODE_ENV === "development") {
          console.error("🔥 Insight rule crashed:", err)
        }
        continue
      }

      if (!insight) continue

      const state = stateMap.get(insight.id) ?? null

      const decision = evaluateInsightCooldown({
        insight,
        state,
        now,
      })

      if (!decision.shouldShow) continue

      evaluated.push({
        ...insight,
        decisionReason: decision.reason,
      })
    }

    // DEV TRACE (engine-only)
    if (process.env.NODE_ENV === "development") {
      console.debug("[INSIGHTS_EVALUATE]", {
        count: evaluated.length,
        insights: evaluated.map((i) => ({
          id: i.id,
          priority: i.priority,
          reason: i.decisionReason,
        })),
      })
    }

    return evaluated
  } catch (err) {
    console.error("🔥 Insight evaluation failed:", err)
    return []
  }
}

/* ======================================================
   METRIC VALIDATION (STRICT)
====================================================== */

function isValidMetrics(
  metrics: DashboardMetrics
): boolean {
  const numericChecks: Array<
    [keyof DashboardMetrics, number]
  > = [
    ["todayRevenue", metrics.todayRevenue],
    ["totalRevenue", metrics.totalRevenue],
    ["failedPayments7d", metrics.failedPayments7d],
    ["refundedAmount7d", metrics.refundedAmount7d],
  ]

  for (const [key, value] of numericChecks) {
    if (typeof value !== "number" || value < 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `⚠️ Invalid metric: ${key} =`,
          value
        )
      }
      return false
    }
  }

  return true
}