/* ======================================================
   SUBSCRIPTION TYPES — SINGLE SOURCE OF TRUTH

   ✔ Pure type definitions
   ✔ No business logic
   ✔ Foundation for subscription state management
====================================================== */

/* ===============================
   Subscription Status
=============================== */

/**
 * Canonical subscription status values
 * 
 * - free: User has no paid subscription
 * - trialing: User is in trial period
 * - active: Subscription is active and paid
 * - past_due: Payment failed, grace period active
 * - expired: Subscription ended (trial or paid period)
 * - cancelled: User cancelled, may have access until period end
 */
export type SubscriptionStatus =
  | "free"
  | "trialing"
  | "active"
  | "past_due"
  | "expired"
  | "cancelled"

/* ===============================
   Core Subscription Object
=============================== */

/**
 * Subscription state object
 * 
 * All date fields are nullable to handle:
 * - Free tier users (no dates)
 * - Incomplete subscription data
 * - Edge cases during transitions
 */
export type Subscription = {
  /**
   * Current subscription status
   */
  status: SubscriptionStatus

  /**
   * When the subscription started
   * null for free tier or uninitialized subscriptions
   */
  startedAt: Date | null

  /**
   * When the trial period ends
   * null if not in trial or trial already ended
   */
  trialEndsAt: Date | null

  /**
   * When the current billing period ends
   * null for free tier or expired subscriptions
   */
  currentPeriodEnd: Date | null

  /**
   * When the subscription was cancelled
   * null if never cancelled or currently active
   * Note: Cancelled subscriptions may still have access until currentPeriodEnd
   */
  cancelledAt: Date | null
}
