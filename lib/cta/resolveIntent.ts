// lib/cta/resolveIntent.ts

import type { Subscription } from "@/types/subscription"
import type { CTAIntent } from "@/types/cta"
import { needsPaymentAttention, canAccessPaidFeatures } from "@/lib/subscription/state"

/* ======================================================
   CTA INTENT RESOLVER — PURE FUNCTION

   ✔ Deterministic
   ✔ No side effects
   ✔ Explicit priority order
   ✔ Production-ready

   🚫 NO UI logic
   🚫 NO routing
   🚫 NO strings (except intent enums)
====================================================== */

/* ===============================
   Capability Result Type
=============================== */

/**
 * Result of a capability check
 * 
 * - true: User has access
 * - false: User does not have access
 * - "limit_reached": User hit a usage limit
 * - "feature_locked": Feature requires upgrade
 */
export type CapabilityResult = boolean | "limit_reached" | "feature_locked"

/* ===============================
   Normalized Error Type
=============================== */

/**
 * Normalized error from capability check
 * 
 * - null: No error
 * - "payment_required": Payment issue
 * - "limit_exceeded": Usage limit exceeded
 * - "unknown": Unknown error (fallback to support)
 */
export type NormalizedError = null | "payment_required" | "limit_exceeded" | "unknown"

/* ===============================
   Intent Resolution Input
=============================== */

export type ResolveIntentInput = {
  /**
   * Current subscription state (from PART 1)
   */
  subscription: Subscription

  /**
   * Result of capability check
   * Optional - if not provided, only subscription state is used
   */
  capabilityResult?: CapabilityResult

  /**
   * Normalized error from capability check
   * Optional - if not provided, no error handling
   */
  error?: NormalizedError
}

/* ===============================
   CTA Intent Resolver
=============================== */

/**
 * Resolve CTA intent based on subscription state and capability
 * 
 * Priority Order (highest to lowest):
 * 1. PAY_NOW - Payment attention needed (past_due)
 * 2. CONTACT_SUPPORT - Unknown errors
 * 3. FIX_LIMIT - Limit exceeded
 * 4. UPGRADE - No paid access or feature locked
 * 5. NONE - All good
 * 
 * @param input - Subscription, capability result, and error
 * @returns CTAIntent enum
 * 
 * @example
 * // Past due subscription
 * resolveCTAIntent({
 *   subscription: { status: 'past_due', ... }
 * }) // "PAY_NOW"
 * 
 * @example
 * // Free user hitting limit
 * resolveCTAIntent({
 *   subscription: { status: 'free', ... },
 *   capabilityResult: 'limit_reached'
 * }) // "FIX_LIMIT"
 * 
 * @example
 * // Free user trying locked feature
 * resolveCTAIntent({
 *   subscription: { status: 'free', ... },
 *   capabilityResult: 'feature_locked'
 * }) // "UPGRADE"
 */
export function resolveCTAIntent(input: ResolveIntentInput): CTAIntent {
  const { subscription, capabilityResult, error } = input

  /* ===============================
     PRIORITY 1: Payment Issues
  =============================== */
  // If subscription needs payment attention, that's the highest priority
  if (needsPaymentAttention(subscription)) {
    return "PAY_NOW"
  }

  // If there's a payment-related error
  if (error === "payment_required") {
    return "PAY_NOW"
  }

  /* ===============================
     PRIORITY 2: Unknown Errors
  =============================== */
  // Unknown errors should route to support
  if (error === "unknown") {
    return "CONTACT_SUPPORT"
  }

  /* ===============================
     PRIORITY 3: Limit Exceeded
  =============================== */
  // User hit a usage limit
  if (capabilityResult === "limit_reached" || error === "limit_exceeded") {
    return "FIX_LIMIT"
  }

  /* ===============================
     PRIORITY 4: Upgrade Needed
  =============================== */
  // Feature is locked behind paid plan
  if (capabilityResult === "feature_locked") {
    return "UPGRADE"
  }

  // User doesn't have paid access and capability check failed
  if (capabilityResult === false && !canAccessPaidFeatures(subscription)) {
    return "UPGRADE"
  }

  /* ===============================
     PRIORITY 5: No Action Needed
  =============================== */
  // Everything is fine, or capability check passed
  return "NONE"
}
