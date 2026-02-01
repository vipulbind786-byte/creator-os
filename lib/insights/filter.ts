import type { Insight } from "@/types/insight"
import type { InsightStateRow } from "./state"
import { applyPriorityDecay } from "./priorityDecay"

/* ======================================================
   HELPERS
====================================================== */

function isBlocked(state?: InsightStateRow): boolean {
  if (!state) return false
  if (state.status !== "active") return true

  if (state.cooldown_until) {
    const until = new Date(state.cooldown_until)
    if (!isNaN(until.getTime()) && until > new Date()) {
      return true
    }
  }

  return false
}

/* ======================================================
   MAIN FILTER
====================================================== */

export function filterVisibleInsights(
  engineInsights: Insight[],
  insightStates: InsightStateRow[]
): Insight[] {
  const now = new Date()
  const visible: Insight[] = []

  for (const insight of engineInsights) {
    const state = insightStates.find(
      (s) => s.insight_id === insight.id
    )

    if (isBlocked(state)) continue

    const decayed = applyPriorityDecay(insight, state, now)
    visible.push(decayed)
  }

  return visible.sort((a, b) => a.priority - b.priority)
}