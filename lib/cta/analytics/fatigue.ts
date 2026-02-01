// lib/cta/analytics/fatigue.ts

import type { CTAMemoryRecord } from "@/types/cta-governance"
import type { CTAFatigueSignals } from "@/types/cta-analytics"

/* ======================================================
   CTA FATIGUE ANALYSIS — DESCRIPTIVE ONLY

   ✔ Fatigue = signal, not decision
   ✔ Severity levels + context
   ✔ Human-interpretable
   
   🚫 NO mitigation logic
   🚫 NO suppression logic
   🚫 NO auto-actions
   🚫 NEVER imported by PART 1-5
   
   📊 DESCRIPTIVE ONLY
====================================================== */

/* ===============================
   Fatigue Severity Calculation
=============================== */

/**
 * Calculate fatigue severity
 * 
 * Pure function - descriptive severity only.
 * NO mitigation, NO suppression.
 * 
 * Heuristic (for human review):
 * - none: < 3 exposures OR has interaction
 * - low: 3-5 exposures, no interaction
 * - moderate: 6-10 exposures, no interaction
 * - high: 11-20 exposures, no interaction
 * - critical: > 20 exposures, no interaction OR dismissed as annoying
 * 
 * @param record - Memory record
 * @param now - Current timestamp
 * @returns Fatigue severity
 */
function calculateFatigueSeverity(
  record: CTAMemoryRecord,
  now: Date
): "none" | "low" | "moderate" | "high" | "critical" {
  const { exposure_count, last_action, dismiss_reason } = record

  // Critical: Dismissed as annoying
  if (dismiss_reason === "annoying") {
    return "critical"
  }

  // None: Has interaction
  if (last_action !== null) {
    return "none"
  }

  // Severity based on exposure count (no interaction)
  if (exposure_count < 3) return "none"
  if (exposure_count <= 5) return "low"
  if (exposure_count <= 10) return "moderate"
  if (exposure_count <= 20) return "high"
  return "critical"
}

/**
 * Calculate days since first exposure
 * 
 * Pure function - time calculation only.
 * 
 * @param record - Memory record
 * @param now - Current timestamp
 * @returns Days since first exposure
 */
function calculateDaysSinceFirstExposure(
  record: CTAMemoryRecord,
  now: Date
): number {
  const ms = now.getTime() - record.first_seen_at.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

/* ===============================
   Fatigue Signal Generation
=============================== */

/**
 * Generate fatigue signals for record
 * 
 * Pure function - descriptive signals only.
 * NO mitigation, NO suppression.
 * 
 * @param record - Memory record
 * @param now - Current timestamp
 * @returns Fatigue signals
 */
export function generateFatigueSignals(
  record: CTAMemoryRecord,
  now: Date
): CTAFatigueSignals {
  return {
    severity: calculateFatigueSeverity(record, now),
    exposure_count: record.exposure_count,
    days_since_first_exposure: calculateDaysSinceFirstExposure(record, now),
    has_interaction: record.last_action !== null,
    dismissed_as_annoying: record.dismiss_reason === "annoying",
    context: {
      intent: record.intent,
      surface: record.surface,
      last_seen_at: record.last_seen_at,
    },
  }
}

/**
 * Generate fatigue signals for multiple records
 * 
 * Pure function - maps over records.
 * 
 * @param records - Memory records
 * @param now - Current timestamp
 * @returns Array of fatigue signals
 */
export function generateFatigueSignalsForRecords(
  records: CTAMemoryRecord[],
  now: Date
): CTAFatigueSignals[] {
  return records.map((record) => generateFatigueSignals(record, now))
}

/* ===============================
   Fatigue Filtering (Read-Only)
=============================== */

/**
 * Filter records by fatigue severity
 * 
 * Pure function - filtering only.
 * For reporting, NOT for suppression.
 * 
 * @param signals - Fatigue signals
 * @param minSeverity - Minimum severity to include
 * @returns Filtered signals
 */
export function filterByFatigueSeverity(
  signals: CTAFatigueSignals[],
  minSeverity: "low" | "moderate" | "high" | "critical"
): CTAFatigueSignals[] {
  const severityOrder = {
    none: 0,
    low: 1,
    moderate: 2,
    high: 3,
    critical: 4,
  }

  const minLevel = severityOrder[minSeverity]

  return signals.filter((s) => severityOrder[s.severity] >= minLevel)
}

/**
 * Count records by fatigue severity
 * 
 * Pure function - counting only.
 * 
 * @param signals - Fatigue signals
 * @returns Count by severity
 */
export function countByFatigueSeverity(signals: CTAFatigueSignals[]): Record<
  "none" | "low" | "moderate" | "high" | "critical",
  number
> {
  const counts = {
    none: 0,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
  }

  signals.forEach((s) => {
    counts[s.severity]++
  })

  return counts
}

/* ===============================
   Fatigue Summary
=============================== */

/**
 * Generate fatigue summary
 * 
 * Pure function - aggregation only.
 * For human review, NOT for auto-action.
 * 
 * @param signals - Fatigue signals
 * @returns Summary statistics
 */
export function generateFatigueSummary(signals: CTAFatigueSignals[]): {
  total_users: number
  by_severity: Record<
    "none" | "low" | "moderate" | "high" | "critical",
    number
  >
  percentage_fatigued: number
  avg_exposure_count: number
  avg_days_active: number
} {
  const total_users = signals.length

  const by_severity = countByFatigueSeverity(signals)

  // Fatigued = moderate or higher
  const fatigued_count =
    by_severity.moderate + by_severity.high + by_severity.critical

  const percentage_fatigued =
    total_users > 0 ? fatigued_count / total_users : 0

  const avg_exposure_count =
    total_users > 0
      ? signals.reduce((sum, s) => sum + s.exposure_count, 0) / total_users
      : 0

  const avg_days_active =
    total_users > 0
      ? signals.reduce((sum, s) => sum + s.days_since_first_exposure, 0) /
        total_users
      : 0

  return {
    total_users,
    by_severity,
    percentage_fatigued,
    avg_exposure_count,
    avg_days_active,
  }
}
