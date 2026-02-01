// lib/cta/lifecycle/normalize.ts

import type { SignalBucket, LifecycleSignalInput } from "@/types/cta-lifecycle"

/* ======================================================
   LIFECYCLE SIGNAL NORMALIZATION — PURE FUNCTIONS

   ✔ Normalize signals into buckets
   ✔ Defensive against missing data
   ✔ unknown ≠ zero
   
   🚫 NO inference
   🚫 NO guessing
   🚫 NO side effects
   🚫 NEVER imported by PART 1-6
   
   📊 NORMALIZE ONLY
====================================================== */

/* ===============================
   Days Since First Seen
=============================== */

/**
 * Normalize days since first seen
 * 
 * Buckets:
 * - low: 0-7 days (new)
 * - medium: 8-30 days (establishing)
 * - high: 31+ days (established)
 * - unknown: data missing
 * 
 * @param days - Days since first seen
 * @returns Signal bucket
 */
export function normalizeDaysSinceFirstSeen(
  days: number | undefined
): SignalBucket {
  if (days === undefined || days === null || isNaN(days)) {
    return "unknown"
  }

  if (days < 0) return "unknown" // Invalid data

  if (days <= 7) return "low"
  if (days <= 30) return "medium"
  return "high"
}

/* ===============================
   Days Since Last Activity
=============================== */

/**
 * Normalize days since last activity
 * 
 * Buckets:
 * - low: 0-3 days (recent)
 * - medium: 4-14 days (moderate)
 * - high: 15+ days (stale)
 * - unknown: data missing
 * 
 * @param days - Days since last activity
 * @returns Signal bucket
 */
export function normalizeDaysSinceLastActivity(
  days: number | undefined
): SignalBucket {
  if (days === undefined || days === null || isNaN(days)) {
    return "unknown"
  }

  if (days < 0) return "unknown" // Invalid data

  if (days <= 3) return "low"
  if (days <= 14) return "medium"
  return "high"
}

/* ===============================
   Exposure Count
=============================== */

/**
 * Normalize total exposures
 * 
 * Buckets:
 * - low: 0-5 exposures
 * - medium: 6-15 exposures
 * - high: 16+ exposures
 * - unknown: data missing
 * 
 * @param count - Total exposures
 * @returns Signal bucket
 */
export function normalizeExposureCount(
  count: number | undefined
): SignalBucket {
  if (count === undefined || count === null || isNaN(count)) {
    return "unknown"
  }

  if (count < 0) return "unknown" // Invalid data

  if (count <= 5) return "low"
  if (count <= 15) return "medium"
  return "high"
}

/* ===============================
   Interaction Count
=============================== */

/**
 * Normalize total interactions
 * 
 * Buckets:
 * - low: 0-2 interactions
 * - medium: 3-7 interactions
 * - high: 8+ interactions
 * - unknown: data missing
 * 
 * @param count - Total interactions
 * @returns Signal bucket
 */
export function normalizeInteractionCount(
  count: number | undefined
): SignalBucket {
  if (count === undefined || count === null || isNaN(count)) {
    return "unknown"
  }

  if (count < 0) return "unknown" // Invalid data

  if (count <= 2) return "low"
  if (count <= 7) return "medium"
  return "high"
}

/* ===============================
   Engagement Ratio
=============================== */

/**
 * Calculate engagement ratio
 * 
 * Ratio = interactions / exposures
 * 
 * Buckets:
 * - low: < 0.2 (low engagement)
 * - medium: 0.2-0.5 (moderate engagement)
 * - high: > 0.5 (high engagement)
 * - unknown: cannot calculate
 * 
 * @param interactions - Total interactions
 * @param exposures - Total exposures
 * @returns Signal bucket
 */
export function normalizeEngagementRatio(
  interactions: number | undefined,
  exposures: number | undefined
): SignalBucket {
  if (
    interactions === undefined ||
    exposures === undefined ||
    interactions === null ||
    exposures === null ||
    isNaN(interactions) ||
    isNaN(exposures)
  ) {
    return "unknown"
  }

  if (interactions < 0 || exposures < 0) return "unknown"
  if (exposures === 0) return "unknown" // Cannot calculate ratio

  const ratio = interactions / exposures

  if (ratio < 0.2) return "low"
  if (ratio <= 0.5) return "medium"
  return "high"
}

/* ===============================
   Fatigue Severity
=============================== */

/**
 * Normalize fatigue severity to bucket
 * 
 * Direct mapping from PART 6 analytics.
 * 
 * @param severity - Fatigue severity from PART 6
 * @returns Signal bucket
 */
export function normalizeFatigueSeverity(
  severity: "none" | "low" | "moderate" | "high" | "critical" | undefined
): SignalBucket {
  if (severity === undefined || severity === null) {
    return "unknown"
  }

  // Map fatigue severity to signal bucket
  switch (severity) {
    case "none":
    case "low":
      return "low"

    case "moderate":
      return "medium"

    case "high":
    case "critical":
      return "high"

    default:
      // Exhaustive check
      const _exhaustive: never = severity
      return _exhaustive
  }
}

/* ===============================
   Batch Normalization
=============================== */

/**
 * Normalize all signals in input
 * 
 * Pure function - creates normalized view.
 * 
 * @param input - Raw signal input
 * @returns Normalized signals
 */
export function normalizeAllSignals(input: LifecycleSignalInput): {
  days_since_first_seen: SignalBucket
  days_since_last_activity: SignalBucket
  exposure_count: SignalBucket
  interaction_count: SignalBucket
  engagement_ratio: SignalBucket
  fatigue_severity: SignalBucket
} {
  return {
    days_since_first_seen: normalizeDaysSinceFirstSeen(
      input.days_since_first_seen
    ),
    days_since_last_activity: normalizeDaysSinceLastActivity(
      input.days_since_last_activity
    ),
    exposure_count: normalizeExposureCount(input.total_exposures),
    interaction_count: normalizeInteractionCount(input.total_interactions),
    engagement_ratio: normalizeEngagementRatio(
      input.total_interactions,
      input.total_exposures
    ),
    fatigue_severity: normalizeFatigueSeverity(input.fatigue_severity),
  }
}

/* ===============================
   Signal Quality Check
=============================== */

/**
 * Count unknown signals
 * 
 * Used to calculate confidence.
 * 
 * @param normalized - Normalized signals
 * @returns Count of unknown signals
 */
export function countUnknownSignals(
  normalized: Record<string, SignalBucket>
): number {
  return Object.values(normalized).filter((v) => v === "unknown").length
}

/**
 * Get missing signal names
 * 
 * For audit trail.
 * 
 * @param normalized - Normalized signals
 * @returns Array of missing signal names
 */
export function getMissingSignalNames(
  normalized: Record<string, SignalBucket>
): string[] {
  return Object.entries(normalized)
    .filter(([_, value]) => value === "unknown")
    .map(([key, _]) => key)
}
