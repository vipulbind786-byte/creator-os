// /lib/insights/pipeline.ts

import type { DashboardMetrics, Insight } from "@/types/insight"
import type { InsightCooldownState } from "./cooldown"

import { evaluateInsights } from "./evaluate"
import { dedupeInsights } from "./dedupe"
import { applySessionCap } from "./sessionCap"

/* ======================================================
   FINAL INSIGHT PIPELINE — P3 (LOCKED)

   ✔ Deterministic
   ✔ Time-consistent (single now)
   ✔ Cooldown / snooze aware
   ✔ Severity escalation preserved
   ✔ Priority-authoritative
   ✔ Dedup-safe
   ✔ Session-capped
   ✔ UI-safe (Insight[] ONLY)

   ❌ No DB
   ❌ No UI
   ❌ No engine-internal leakage
====================================================== */

export type InsightPipelineParams = {
  metrics: DashboardMetrics

  /**
   * Persisted insight state (DB-backed)
   * Used for:
   * - cooldown
   * - snooze
   * - escalation
   */
  insightStates?: Array<
    InsightCooldownState & {
      insight_id: string
    }
  >

  /**
   * Time injection for determinism
   * (tests / replay / audit)
   */
  now?: Date

  /**
   * UX safety cap
   */
  maxPerSession?: number
}

/**
 * 🔒 SINGLE ENTRY POINT
 * Dashboard MUST call only this function
 */
export function runInsightPipeline(
  params: InsightPipelineParams
): Insight[] {
  const {
    metrics,
    insightStates = [],
    now = new Date(),
    maxPerSession = 3,
  } = params

  /* ======================================================
     STEP 1 — ENGINE EVALUATION
     rules + cooldown + snooze + escalation
     (engine metadata still attached)
  ====================================================== */
  const evaluated = evaluateInsights({
    metrics,
    insightStates,
    now,
  })

  if (evaluated.length === 0) return []

  /* ======================================================
     STEP 2 — DEDUPLICATION (ENGINE LEVEL)
     - Keeps strongest priority version
     - Metadata preserved
  ====================================================== */
  const deduped = dedupeInsights(evaluated)
  if (deduped.length === 0) return []

  /* ======================================================
     STEP 3 — PRIORITY ORDER (AUTHORITATIVE)
     Lower number = higher importance
  ====================================================== */
  const ordered = [...deduped].sort(
    (a, b) => a.priority - b.priority
  )

  /* ======================================================
     STEP 4 — SESSION CAP (UX SAFETY)
     Deterministic AFTER ordering
  ====================================================== */
  const capped = applySessionCap(ordered, {
    maxPerSession,
  })

  if (capped.length === 0) return []

  /* ======================================================
     STEP 5 — STRIP ENGINE-ONLY FIELDS
     UI MUST receive Insight[] only
  ====================================================== */
  const uiInsights: Insight[] = capped.map(
    ({ decisionReason: _drop, ...rest }) => rest
  )

  return uiInsights
}