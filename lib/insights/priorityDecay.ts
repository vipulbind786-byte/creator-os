import type { Insight } from "@/types/insight"
import type { InsightStateRow } from "./state"

/* ======================================================
   Priority Decay Logic
====================================================== */

export function applyPriorityDecay(
  insight: Insight,
  state: InsightStateRow | undefined,
  now: Date
): Insight {
  if (!state?.first_seen_at) return insight

  const firstSeen = new Date(state.first_seen_at)
  if (isNaN(firstSeen.getTime())) return insight

  // Only decay INFO insights
  if (insight.kind !== "info") return insight

  const daysVisible =
    (now.getTime() - firstSeen.getTime()) /
    (1000 * 60 * 60 * 24)

  const decaySteps = Math.floor(daysVisible / 3)

  return {
    ...insight,
    priority: Math.min(insight.priority + decaySteps, 5),
  }
}