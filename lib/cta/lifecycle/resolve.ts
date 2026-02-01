// lib/cta/lifecycle/resolve.ts

import type {
  LifecycleState,
  LifecycleSignalInput,
  SignalBucket,
} from "@/types/cta-lifecycle"
import { normalizeAllSignals } from "./normalize"

/* ======================================================
   LIFECYCLE STATE RESOLVER — PURE FUNCTION

   ✔ Deterministic classification
   ✔ Stateless
   ✔ No memory
   ✔ No randomness
   
   🚫 NO decisions
   🚫 NO actions
   🚫 NO side effects
   🚫 NEVER imported by PART 1-6
   
   📊 CLASSIFY ONLY
====================================================== */

/* ===============================
   Priority Order (Top Wins)
=============================== */

/**
 * Resolve lifecycle state
 * 
 * Pure function - deterministic classification.
 * 
 * Priority order (top wins):
 * 1. CHURNED - User has left
 * 2. DORMANT - Inactive for extended period
 * 3. AT_RISK - Showing churn signals
 * 4. POWER_USER - High engagement
 * 5. ACTIVE - Regular usage
 * 6. ACTIVATING - Building habits
 * 7. ONBOARDING - Learning product
 * 8. NEW_USER - Just signed up
 * 
 * @param input - Signal input
 * @returns Lifecycle state
 */
export function resolveLifecycleState(
  input: LifecycleSignalInput
): LifecycleState {
  // Normalize all signals
  const normalized = normalizeAllSignals(input)

  // Priority 1: CHURNED
  if (isChurned(input, normalized)) {
    return "CHURNED"
  }

  // Priority 2: DORMANT
  if (isDormant(input, normalized)) {
    return "DORMANT"
  }

  // Priority 3: AT_RISK
  if (isAtRisk(input, normalized)) {
    return "AT_RISK"
  }

  // Priority 4: POWER_USER
  if (isPowerUser(input, normalized)) {
    return "POWER_USER"
  }

  // Priority 5: ACTIVE
  if (isActive(input, normalized)) {
    return "ACTIVE"
  }

  // Priority 6: ACTIVATING
  if (isActivating(input, normalized)) {
    return "ACTIVATING"
  }

  // Priority 7: ONBOARDING
  if (isOnboarding(input, normalized)) {
    return "ONBOARDING"
  }

  // Priority 8: NEW_USER (default)
  return "NEW_USER"
}

/* ===============================
   State Detection Functions
=============================== */

/**
 * Check if user is CHURNED
 * 
 * Signals:
 * - Subscription cancelled or expired
 * - OR: Very long inactivity (30+ days)
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns true if churned
 */
function isChurned(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): boolean {
  // Subscription cancelled or expired
  if (
    input.subscription_status === "cancelled" ||
    input.subscription_status === "expired"
  ) {
    return true
  }

  // Very long inactivity (30+ days)
  if (
    input.days_since_last_activity !== undefined &&
    input.days_since_last_activity >= 30
  ) {
    return true
  }

  return false
}

/**
 * Check if user is DORMANT
 * 
 * Signals:
 * - Inactive for 15-29 days
 * - No recent engagement
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns true if dormant
 */
function isDormant(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): boolean {
  // Inactive for 15-29 days
  if (
    input.days_since_last_activity !== undefined &&
    input.days_since_last_activity >= 15 &&
    input.days_since_last_activity < 30
  ) {
    return true
  }

  return false
}

/**
 * Check if user is AT_RISK
 * 
 * Signals:
 * - High fatigue severity
 * - OR: Dismissed as annoying
 * - OR: Has compliance flags
 * - OR: Moderate inactivity (7-14 days) + low engagement
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns true if at risk
 */
function isAtRisk(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): boolean {
  // High fatigue
  if (normalized.fatigue_severity === "high") {
    return true
  }

  // Dismissed as annoying
  if (input.dismissed_as_annoying === true) {
    return true
  }

  // Has compliance flags
  if (input.has_compliance_flags === true) {
    return true
  }

  // Moderate inactivity + low engagement
  if (
    input.days_since_last_activity !== undefined &&
    input.days_since_last_activity >= 7 &&
    input.days_since_last_activity < 15 &&
    normalized.engagement_ratio === "low"
  ) {
    return true
  }

  return false
}

/**
 * Check if user is POWER_USER
 * 
 * Signals:
 * - High engagement ratio
 * - Active subscription
 * - Established user (31+ days)
 * - Recent activity (0-3 days)
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns true if power user
 */
function isPowerUser(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): boolean {
  // High engagement
  if (normalized.engagement_ratio !== "high") {
    return false
  }

  // Active subscription
  if (
    input.subscription_status !== "active" &&
    input.subscription_status !== "trialing"
  ) {
    return false
  }

  // Established user
  if (normalized.days_since_first_seen !== "high") {
    return false
  }

  // Recent activity
  if (normalized.days_since_last_activity !== "low") {
    return false
  }

  return true
}

/**
 * Check if user is ACTIVE
 * 
 * Signals:
 * - Recent activity (0-3 days)
 * - Moderate or high engagement
 * - Established user (8+ days)
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns true if active
 */
function isActive(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): boolean {
  // Recent activity
  if (normalized.days_since_last_activity !== "low") {
    return false
  }

  // Moderate or high engagement
  if (normalized.engagement_ratio === "low") {
    return false
  }

  // Established user (8+ days)
  if (normalized.days_since_first_seen === "low") {
    return false
  }

  return true
}

/**
 * Check if user is ACTIVATING
 * 
 * Signals:
 * - Recent activity (0-6 days)
 * - Some engagement (not zero)
 * - New-ish user (8-30 days)
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns true if activating
 */
function isActivating(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): boolean {
  // Recent activity
  if (
    input.days_since_last_activity !== undefined &&
    input.days_since_last_activity > 6
  ) {
    return false
  }

  // Some engagement
  if (
    input.total_interactions !== undefined &&
    input.total_interactions === 0
  ) {
    return false
  }

  // New-ish user (8-30 days)
  if (normalized.days_since_first_seen !== "medium") {
    return false
  }

  return true
}

/**
 * Check if user is ONBOARDING
 * 
 * Signals:
 * - Very new user (0-7 days)
 * - Some activity
 * 
 * @param input - Raw input
 * @param normalized - Normalized signals
 * @returns true if onboarding
 */
function isOnboarding(
  input: LifecycleSignalInput,
  normalized: Record<string, SignalBucket>
): boolean {
  // Very new user
  if (normalized.days_since_first_seen !== "low") {
    return false
  }

  // Some activity (not completely inactive)
  if (
    input.days_since_last_activity !== undefined &&
    input.days_since_last_activity > 7
  ) {
    return false
  }

  return true
}

/* ===============================
   State Description (Audit)
=============================== */

/**
 * Get human-readable description of state
 * 
 * For audit trail and reporting.
 * 
 * @param state - Lifecycle state
 * @returns Description
 */
export function getStateDescription(state: LifecycleState): string {
  switch (state) {
    case "NEW_USER":
      return "User just signed up, minimal activity"

    case "ONBOARDING":
      return "User is learning the product (0-7 days)"

    case "ACTIVATING":
      return "User is building habits (8-30 days)"

    case "ACTIVE":
      return "User has regular usage patterns"

    case "POWER_USER":
      return "User has high engagement and active subscription"

    case "AT_RISK":
      return "User showing churn signals (fatigue, inactivity, complaints)"

    case "DORMANT":
      return "User inactive for 15-29 days"

    case "CHURNED":
      return "User has left (cancelled subscription or 30+ days inactive)"

    default:
      // Exhaustive check
      const _exhaustive: never = state
      return _exhaustive
  }
}
