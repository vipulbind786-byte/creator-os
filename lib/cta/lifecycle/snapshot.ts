// lib/cta/lifecycle/snapshot.ts

import type {
  LifecycleSignalInput,
  LifecycleSnapshot,
  ConfidenceLevel,
  SignalBucket,
} from "@/types/cta-lifecycle"
import { resolveLifecycleState, getStateDescription } from "./resolve"
import {
  normalizeAllSignals,
  countUnknownSignals,
  getMissingSignalNames,
} from "./normalize"
import { CTA_LIFECYCLE_VERSION } from "./versioning"
import { CTA_ANALYTICS_VERSION } from "@/lib/cta/analytics/versioning"
import { CTA_GOVERNANCE_VERSION } from "@/lib/cta/governance/versioning"

/* ======================================================
   LIFECYCLE SNAPSHOT BUILDER — PURE FUNCTION

   ✔ Build audit-grade snapshot
   ✔ Calculate confidence
   ✔ Track signals used
   
   🚫 NO decisions
   🚫 NO actions
   🚫 NO side effects
   🚫 NEVER imported by PART 1-6
   
   📊 SNAPSHOT ONLY
====================================================== */

/* ===============================
   Confidence Calculation
=============================== */

/**
 * Calculate confidence level
 * 
 * Confidence decreases when:
 * - Signals are missing
 * - Signals are conflicting
 * - Many unknowns present
 * 
 * Rules:
 * - 0-1 unknowns: high
 * - 2-3 unknowns: medium
 * - 4+ unknowns: low
 * 
 * @param unknownCount - Count of unknown signals
 * @returns Confidence level
 */
function calculateConfidence(unknownCount: number): ConfidenceLevel {
  if (unknownCount <= 1) return "high"
  if (unknownCount <= 3) return "medium"
  return "low"
}

/* ===============================
   Signal Tracking
=============================== */

/**
 * Build signals used array
 * 
 * For audit trail - shows what data was used.
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns Array of signals used
 */
function buildSignalsUsed(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): ReadonlyArray<{
  name: string
  value: string | number | boolean
  bucket?: SignalBucket
}> {
  const signals: Array<{
    name: string
    value: string | number | boolean
    bucket?: SignalBucket
  }> = []

  // Days since first seen
  if (input.days_since_first_seen !== undefined) {
    signals.push({
      name: "days_since_first_seen",
      value: input.days_since_first_seen,
      bucket: normalized.days_since_first_seen,
    })
  }

  // Days since last activity
  if (input.days_since_last_activity !== undefined) {
    signals.push({
      name: "days_since_last_activity",
      value: input.days_since_last_activity,
      bucket: normalized.days_since_last_activity,
    })
  }

  // Total exposures
  if (input.total_exposures !== undefined) {
    signals.push({
      name: "total_exposures",
      value: input.total_exposures,
      bucket: normalized.exposure_count,
    })
  }

  // Total interactions
  if (input.total_interactions !== undefined) {
    signals.push({
      name: "total_interactions",
      value: input.total_interactions,
      bucket: normalized.interaction_count,
    })
  }

  // Dismissal count
  if (input.dismissal_count !== undefined) {
    signals.push({
      name: "dismissal_count",
      value: input.dismissal_count,
    })
  }

  // Dismissed as annoying
  if (input.dismissed_as_annoying !== undefined) {
    signals.push({
      name: "dismissed_as_annoying",
      value: input.dismissed_as_annoying,
    })
  }

  // Fatigue severity
  if (input.fatigue_severity !== undefined) {
    signals.push({
      name: "fatigue_severity",
      value: input.fatigue_severity,
      bucket: normalized.fatigue_severity,
    })
  }

  // Has compliance flags
  if (input.has_compliance_flags !== undefined) {
    signals.push({
      name: "has_compliance_flags",
      value: input.has_compliance_flags,
    })
  }

  // Subscription status
  if (input.subscription_status !== undefined) {
    signals.push({
      name: "subscription_status",
      value: input.subscription_status,
    })
  }

  // Engagement ratio (calculated)
  if (normalized.engagement_ratio !== "unknown") {
    signals.push({
      name: "engagement_ratio",
      value: "calculated",
      bucket: normalized.engagement_ratio,
    })
  }

  return signals
}

/* ===============================
   Snapshot Builder
=============================== */

/**
 * Build lifecycle snapshot
 * 
 * Pure function - creates complete diagnostic snapshot.
 * 
 * @param input - Signal input
 * @param now - Current timestamp
 * @returns Lifecycle snapshot
 */
export function buildLifecycleSnapshot(
  input: LifecycleSignalInput,
  now: Date
): LifecycleSnapshot {
  // Normalize signals
  const normalized = normalizeAllSignals(input)

  // Resolve state
  const state = resolveLifecycleState(input)

  // Calculate confidence
  const unknownCount = countUnknownSignals(normalized)
  const confidence = calculateConfidence(unknownCount)

  // Build signals used
  const signals_used = buildSignalsUsed(input, normalized)

  // Get missing signals
  const signals_missing = getMissingSignalNames(normalized)

  return {
    state,
    confidence,
    signals_used,
    signals_missing,
    computed_at: now,
    lifecycle_version: CTA_LIFECYCLE_VERSION,
    analytics_version: CTA_ANALYTICS_VERSION,
    governance_version: CTA_GOVERNANCE_VERSION,
  }
}

/* ===============================
   Snapshot Helpers
=============================== */

/**
 * Get snapshot summary
 * 
 * Human-readable summary for reporting.
 * 
 * @param snapshot - Lifecycle snapshot
 * @returns Summary string
 */
export function getSnapshotSummary(snapshot: LifecycleSnapshot): string {
  const description = getStateDescription(snapshot.state)
  return `${snapshot.state} (${snapshot.confidence} confidence): ${description}`
}

/**
 * Check if snapshot has high confidence
 * 
 * For filtering low-confidence classifications.
 * 
 * @param snapshot - Lifecycle snapshot
 * @returns true if high confidence
 */
export function hasHighConfidence(snapshot: LifecycleSnapshot): boolean {
  return snapshot.confidence === "high"
}

/**
 * Check if snapshot is recent
 * 
 * For cache invalidation.
 * 
 * @param snapshot - Lifecycle snapshot
 * @param now - Current timestamp
 * @param maxAgeMs - Max age in milliseconds
 * @returns true if recent
 */
export function isSnapshotRecent(
  snapshot: LifecycleSnapshot,
  now: Date,
  maxAgeMs: number
): boolean {
  const age = now.getTime() - snapshot.computed_at.getTime()
  return age <= maxAgeMs
}
