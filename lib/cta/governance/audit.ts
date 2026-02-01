// lib/cta/governance/audit.ts

import type { CTAMemoryRecord, CTAGovernanceSnapshot } from "@/types/cta-governance"

/* ======================================================
   CTA AUDIT HELPERS — READ-ONLY ANALYZERS

   ✔ Pure analysis functions
   ✔ No side effects
   ✔ For human review only
   
   🚫 NO CTA logic
   🚫 NO behavior changes
   🚫 NEVER imported by PART 1-4
   
   📊 OBSERVATIONAL ONLY
   ⚠️ Results MUST NOT affect CTA decisions
====================================================== */

/* ===============================
   Exposure Analysis
=============================== */

/**
 * Check if user has excessive exposure
 * 
 * Pure function - read-only analysis.
 * For human review, NOT for CTA logic.
 * 
 * @param memory - Memory record
 * @param threshold - Exposure threshold
 * @returns true if exposure exceeds threshold
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function hasExcessiveExposure(
  memory: CTAMemoryRecord,
  threshold: number
): boolean {
  return memory.exposure_count > threshold
}

/**
 * Check if user might be fatigued
 * 
 * Pure function - read-only analysis.
 * Heuristic: high exposure + no interaction
 * 
 * @param memory - Memory record
 * @returns true if fatigue indicators present
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function isUserFatigued(memory: CTAMemoryRecord): boolean {
  // Heuristic: 5+ exposures with no interaction
  return memory.exposure_count >= 5 && memory.last_action === null
}

/**
 * Calculate engagement rate
 * 
 * Pure function - read-only analysis.
 * 
 * @param memory - Memory record
 * @returns Engagement rate (0-1)
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function calculateEngagementRate(memory: CTAMemoryRecord): number {
  if (memory.exposure_count === 0) return 0
  return memory.last_action !== null ? 1 : 0
}

/* ===============================
   Dismissal Analysis
=============================== */

/**
 * Check if dismissal indicates annoyance
 * 
 * Pure function - read-only analysis.
 * 
 * @param memory - Memory record
 * @returns true if user dismissed as "annoying"
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function isDismissedAsAnnoying(memory: CTAMemoryRecord): boolean {
  return memory.dismiss_reason === "annoying"
}

/**
 * Check if user dismissed quickly
 * 
 * Pure function - read-only analysis.
 * Quick dismissal = dismissed within 2 exposures
 * 
 * @param memory - Memory record
 * @returns true if dismissed quickly
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function wasQuicklyDismissed(memory: CTAMemoryRecord): boolean {
  return (
    memory.last_action === "dismissed" &&
    memory.exposure_count <= 2
  )
}

/* ===============================
   Governance Snapshot Analysis
=============================== */

/**
 * Check if snapshot needs human review
 * 
 * Pure function - read-only analysis.
 * Flags for review:
 * - Excessive exposure
 * - User fatigue
 * - High dismissal rate
 * 
 * @param snapshot - Governance snapshot
 * @returns true if human review recommended
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function needsHumanReview(snapshot: CTAGovernanceSnapshot): boolean {
  return (
    snapshot.risk_flags.includes("excessive_exposure") ||
    snapshot.risk_flags.includes("user_fatigue") ||
    snapshot.risk_flags.includes("high_dismissal_rate")
  )
}

/**
 * Check if snapshot has accessibility concerns
 * 
 * Pure function - read-only analysis.
 * 
 * @param snapshot - Governance snapshot
 * @returns true if accessibility concerns flagged
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function hasAccessibilityConcerns(
  snapshot: CTAGovernanceSnapshot
): boolean {
  return snapshot.risk_flags.includes("accessibility_concern")
}

/* ===============================
   Risk Flag Generation
=============================== */

/**
 * Generate risk flags for memory record
 * 
 * Pure function - read-only analysis.
 * 
 * @param memory - Memory record
 * @param thresholds - Configurable thresholds
 * @returns Array of risk flags
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function generateRiskFlags(
  memory: CTAMemoryRecord,
  thresholds: {
    excessiveExposure: number
    fatigueExposure: number
  } = {
    excessiveExposure: 10,
    fatigueExposure: 5,
  }
): ReadonlyArray<
  | "excessive_exposure"
  | "user_fatigue"
  | "low_engagement"
  | "high_dismissal_rate"
  | "accessibility_concern"
> {
  const flags: Array<
    | "excessive_exposure"
    | "user_fatigue"
    | "low_engagement"
    | "high_dismissal_rate"
    | "accessibility_concern"
  > = []

  // Excessive exposure
  if (hasExcessiveExposure(memory, thresholds.excessiveExposure)) {
    flags.push("excessive_exposure")
  }

  // User fatigue
  if (isUserFatigued(memory)) {
    flags.push("user_fatigue")
  }

  // Low engagement
  if (memory.exposure_count >= 3 && memory.last_action === null) {
    flags.push("low_engagement")
  }

  // High dismissal rate (dismissed as annoying)
  if (isDismissedAsAnnoying(memory)) {
    flags.push("high_dismissal_rate")
  }

  return flags
}

/* ===============================
   Snapshot Creation
=============================== */

/**
 * Create governance snapshot from memory
 * 
 * Pure function - creates snapshot for review.
 * 
 * @param memory - Memory record
 * @returns Governance snapshot
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 For governance review only
 */
export function createGovernanceSnapshot(
  memory: CTAMemoryRecord
): CTAGovernanceSnapshot {
  return {
    intent: memory.intent,
    surface: memory.surface,
    exposure_count: memory.exposure_count,
    last_action: memory.last_action,
    risk_flags: generateRiskFlags(memory),
  }
}
