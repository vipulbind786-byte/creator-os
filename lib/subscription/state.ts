// lib/subscription/state.ts

import type { Subscription, SubscriptionStatus } from "@/types/subscription"

/* ======================================================
   SUBSCRIPTION STATE HELPERS — PURE FUNCTIONS

   ✔ No side effects
   ✔ No Date.now() (accept dates as input)
   ✔ Defensive against nulls
   ✔ Exhaustive type checking
   ✔ Production-ready

   🚫 NO UI logic
   🚫 NO billing logic
   🚫 NO database access
   🚫 NO feature flags
====================================================== */

/* ===============================
   Status Checks
=============================== */

/**
 * Check if subscription is currently active
 * 
 * @param subscription - The subscription object to check
 * @returns true if status is 'active'
 * 
 * @example
 * isActive({ status: 'active', ... }) // true
 * isActive({ status: 'trialing', ... }) // false
 */
export function isActive(subscription: Subscription): boolean {
  return subscription.status === "active"
}

/**
 * Check if subscription is in trial period
 * 
 * @param subscription - The subscription object to check
 * @returns true if status is 'trialing'
 * 
 * @example
 * isTrial({ status: 'trialing', ... }) // true
 * isTrial({ status: 'active', ... }) // false
 */
export function isTrial(subscription: Subscription): boolean {
  return subscription.status === "trialing"
}

/* ===============================
   Access Control Helpers
=============================== */

/**
 * Check if subscription is in read-only mode
 * 
 * Read-only states:
 * - expired: Subscription has ended
 * - cancelled: User cancelled (may still have access until period end)
 * - past_due: Payment failed, limited access
 * 
 * @param subscription - The subscription object to check
 * @returns true if user should have read-only access
 * 
 * @example
 * isReadOnly({ status: 'expired', ... }) // true
 * isReadOnly({ status: 'active', ... }) // false
 */
export function isReadOnly(subscription: Subscription): boolean {
  const status = subscription.status

  // Exhaustive check for read-only states
  switch (status) {
    case "expired":
    case "cancelled":
    case "past_due":
      return true

    case "free":
    case "trialing":
    case "active":
      return false

    default:
      // Exhaustive type check - TypeScript will error if new status added
      const _exhaustive: never = status
      return _exhaustive
  }
}

/**
 * Check if user can access paid features
 * 
 * Paid feature access granted for:
 * - active: Full paid subscription
 * - trialing: Trial period with full access
 * 
 * @param subscription - The subscription object to check
 * @returns true if user can access paid features
 * 
 * @example
 * canAccessPaidFeatures({ status: 'active', ... }) // true
 * canAccessPaidFeatures({ status: 'trialing', ... }) // true
 * canAccessPaidFeatures({ status: 'free', ... }) // false
 */
export function canAccessPaidFeatures(subscription: Subscription): boolean {
  const status = subscription.status

  // Exhaustive check for paid feature access
  switch (status) {
    case "active":
    case "trialing":
      return true

    case "free":
    case "past_due":
    case "expired":
    case "cancelled":
      return false

    default:
      // Exhaustive type check
      const _exhaustive: never = status
      return _exhaustive
  }
}

/* ===============================
   Payment Attention Checks
=============================== */

/**
 * Check if subscription needs payment attention
 * 
 * Payment attention required for:
 * - past_due: Payment failed, user needs to update payment method
 * 
 * @param subscription - The subscription object to check
 * @returns true if user needs to take payment action
 * 
 * @example
 * needsPaymentAttention({ status: 'past_due', ... }) // true
 * needsPaymentAttention({ status: 'active', ... }) // false
 */
export function needsPaymentAttention(subscription: Subscription): boolean {
  return subscription.status === "past_due"
}

/* ===============================
   Date-Based Helpers (Optional)
=============================== */

/**
 * Check if trial has expired
 * 
 * Defensive against:
 * - null trialEndsAt
 * - null now parameter
 * 
 * @param subscription - The subscription object to check
 * @param now - Current date/time for comparison
 * @returns true if trial period has ended
 * 
 * @example
 * const now = new Date()
 * hasTrialExpired({ trialEndsAt: new Date('2024-01-01'), ... }, now) // depends on now
 * hasTrialExpired({ trialEndsAt: null, ... }, now) // false
 */
export function hasTrialExpired(
  subscription: Subscription,
  now: Date
): boolean {
  // Defensive: if no trial end date, trial hasn't expired
  if (!subscription.trialEndsAt) {
    return false
  }

  // Defensive: if now is invalid, assume not expired
  if (!now || !(now instanceof Date) || isNaN(now.getTime())) {
    return false
  }

  return now > subscription.trialEndsAt
}

/**
 * Check if current period has ended
 * 
 * Defensive against:
 * - null currentPeriodEnd
 * - null now parameter
 * 
 * @param subscription - The subscription object to check
 * @param now - Current date/time for comparison
 * @returns true if current billing period has ended
 * 
 * @example
 * const now = new Date()
 * hasPeriodEnded({ currentPeriodEnd: new Date('2024-01-01'), ... }, now) // depends on now
 * hasPeriodEnded({ currentPeriodEnd: null, ... }, now) // false
 */
export function hasPeriodEnded(
  subscription: Subscription,
  now: Date
): boolean {
  // Defensive: if no period end date, period hasn't ended
  if (!subscription.currentPeriodEnd) {
    return false
  }

  // Defensive: if now is invalid, assume not ended
  if (!now || !(now instanceof Date) || isNaN(now.getTime())) {
    return false
  }

  return now > subscription.currentPeriodEnd
}
