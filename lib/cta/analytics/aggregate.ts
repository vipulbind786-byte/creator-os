// lib/cta/analytics/aggregate.ts

import type { CTAMemoryRecord } from "@/types/cta-governance"
import type {
  CTAExposureStats,
  CTAActionStats,
  CTADismissalStats,
  CTATimeWindow,
} from "@/types/cta-analytics"
import type { CTAIntent } from "@/types/cta"
import type { CTASurface } from "@/components/cta/surfaces"

/* ======================================================
   CTA ANALYTICS AGGREGATION — PURE FUNCTIONS

   ✔ Pure aggregation only
   ✔ Counts, percentages, ratios
   ✔ No thresholds, no opinions
   
   🚫 NO decisions
   🚫 NO recommendations
   🚫 NO "should" logic
   🚫 NEVER imported by PART 1-5
   
   📊 FACTUAL ONLY
====================================================== */

/* ===============================
   Time Window Helpers
=============================== */

/**
 * Create time window
 * 
 * Pure function - creates time window object.
 * 
 * @param start - Start date
 * @param end - End date
 * @returns Time window
 */
export function createTimeWindow(start: Date, end: Date): CTATimeWindow {
  return {
    start,
    end,
    duration_ms: end.getTime() - start.getTime(),
  }
}

/**
 * Check if record is within time window
 * 
 * Pure function - boolean check.
 * 
 * @param record - Memory record
 * @param window - Time window
 * @returns true if record is within window
 */
export function isWithinTimeWindow(
  record: CTAMemoryRecord,
  window: CTATimeWindow
): boolean {
  const recordTime = record.last_seen_at.getTime()
  return (
    recordTime >= window.start.getTime() &&
    recordTime <= window.end.getTime()
  )
}

/* ===============================
   Exposure Aggregation
=============================== */

/**
 * Aggregate exposure statistics
 * 
 * Pure function - counts and averages only.
 * NO thresholds, NO decisions.
 * 
 * @param records - Memory records
 * @param window - Time window
 * @returns Exposure statistics
 */
export function aggregateExposureStats(
  records: CTAMemoryRecord[],
  window: CTATimeWindow
): CTAExposureStats {
  // Filter records within window
  const windowRecords = records.filter((r) => isWithinTimeWindow(r, window))

  // Total exposures
  const total_exposures = windowRecords.reduce(
    (sum, r) => sum + r.exposure_count,
    0
  )

  // Unique users (assuming records are per user)
  const unique_users = windowRecords.length

  // Average exposures per user
  const avg_exposures_per_user =
    unique_users > 0 ? total_exposures / unique_users : 0

  // By intent
  const by_intent: Record<CTAIntent, number> = {
    NONE: 0,
    UPGRADE: 0,
    PAY_NOW: 0,
    FIX_LIMIT: 0,
    CONTACT_SUPPORT: 0,
  }

  windowRecords.forEach((r) => {
    by_intent[r.intent] += r.exposure_count
  })

  // By surface
  const by_surface: Record<CTASurface, number> = {
    dashboard_banner: 0,
    billing_alert: 0,
    product_gate: 0,
    empty_state: 0,
  }

  windowRecords.forEach((r) => {
    by_surface[r.surface] += r.exposure_count
  })

  return {
    total_exposures,
    unique_users,
    avg_exposures_per_user,
    by_intent,
    by_surface,
    time_window: window,
  }
}

/* ===============================
   Action Aggregation
=============================== */

/**
 * Aggregate action statistics
 * 
 * Pure function - counts and ratios only.
 * NO interpretation, NO recommendations.
 * 
 * @param records - Memory records
 * @param window - Time window
 * @returns Action statistics
 */
export function aggregateActionStats(
  records: CTAMemoryRecord[],
  window: CTATimeWindow
): CTAActionStats {
  // Filter records within window
  const windowRecords = records.filter((r) => isWithinTimeWindow(r, window))

  // Count actions
  let total_clicks = 0
  let total_dismissals = 0
  let total_no_action = 0

  const by_intent: Record<
    CTAIntent,
    { clicks: number; dismissals: number; no_action: number }
  > = {
    NONE: { clicks: 0, dismissals: 0, no_action: 0 },
    UPGRADE: { clicks: 0, dismissals: 0, no_action: 0 },
    PAY_NOW: { clicks: 0, dismissals: 0, no_action: 0 },
    FIX_LIMIT: { clicks: 0, dismissals: 0, no_action: 0 },
    CONTACT_SUPPORT: { clicks: 0, dismissals: 0, no_action: 0 },
  }

  windowRecords.forEach((r) => {
    if (r.last_action === "clicked") {
      total_clicks++
      by_intent[r.intent].clicks++
    } else if (r.last_action === "dismissed") {
      total_dismissals++
      by_intent[r.intent].dismissals++
    } else {
      total_no_action++
      by_intent[r.intent].no_action++
    }
  })

  const total = windowRecords.length

  // Calculate rates
  const click_rate = total > 0 ? total_clicks / total : 0
  const dismissal_rate = total > 0 ? total_dismissals / total : 0
  const no_action_rate = total > 0 ? total_no_action / total : 0

  return {
    total_clicks,
    total_dismissals,
    click_rate,
    dismissal_rate,
    no_action_rate,
    by_intent,
    time_window: window,
  }
}

/* ===============================
   Dismissal Aggregation
=============================== */

/**
 * Aggregate dismissal statistics
 * 
 * Pure function - counts by reason.
 * NO interpretation.
 * 
 * @param records - Memory records
 * @param window - Time window
 * @returns Dismissal statistics
 */
export function aggregateDismissalStats(
  records: CTAMemoryRecord[],
  window: CTATimeWindow
): CTADismissalStats {
  // Filter dismissed records within window
  const dismissedRecords = records.filter(
    (r) => r.last_action === "dismissed" && isWithinTimeWindow(r, window)
  )

  const total = dismissedRecords.length

  // Count by reason
  const by_reason = {
    not_relevant: 0,
    later: 0,
    annoying: 0,
  }

  let total_exposures_before_dismissal = 0

  dismissedRecords.forEach((r) => {
    if (r.dismiss_reason === "not_relevant") {
      by_reason.not_relevant++
    } else if (r.dismiss_reason === "later") {
      by_reason.later++
    } else if (r.dismiss_reason === "annoying") {
      by_reason.annoying++
    }

    total_exposures_before_dismissal += r.exposure_count
  })

  // Calculate percentages
  const percentage_by_reason = {
    not_relevant: total > 0 ? by_reason.not_relevant / total : 0,
    later: total > 0 ? by_reason.later / total : 0,
    annoying: total > 0 ? by_reason.annoying / total : 0,
  }

  // Average exposures before dismissal
  const avg_exposures_before_dismissal =
    total > 0 ? total_exposures_before_dismissal / total : 0

  return {
    total,
    by_reason,
    percentage_by_reason,
    avg_exposures_before_dismissal,
    time_window: window,
  }
}

/* ===============================
   Trend Calculation
=============================== */

/**
 * Calculate trend direction
 * 
 * Pure function - descriptive trend only.
 * NO predictions, NO recommendations.
 * 
 * @param current - Current value
 * @param previous - Previous value
 * @returns Trend direction
 */
export function calculateTrend(
  current: number,
  previous: number
): "up" | "down" | "flat" {
  if (current > previous) return "up"
  if (current < previous) return "down"
  return "flat"
}

/**
 * Calculate percentage change
 * 
 * Pure function - percentage only.
 * 
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (-1 to +∞)
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 1 : 0
  return (current - previous) / previous
}
