// /lib/billing/featureFlags.ts

/* ======================================================
   GLOBAL BILLING FEATURE FLAGS — P4 STEP 1 (LOCKED)

   ✔ Pure logic
   ✔ No DB access
   ✔ No UI coupling
   ✔ No plan checks
   ✔ Feature-flag first (future-proof)

   ❌ Do NOT import Stripe
   ❌ Do NOT import plans
   ❌ Do NOT import entitlements
====================================================== */

/* ===============================
   GLOBAL THRESHOLDS (LOCKED)
=============================== */

/**
 * Paid users required to unlock
 * advanced product-wide features
 */
export const PAID_USERS_THRESHOLD = 1000

/* ===============================
   FLAG INPUT SHAPE
=============================== */

/**
 * This object is intentionally minimal.
 * It can be populated from:
 * - analytics table
 * - cron snapshot
 * - cache
 * - admin override (future)
 */
export type FeatureFlagContext = {
  paidUsersCount: number
}

/* ===============================
   FEATURE FLAGS (PURE)
=============================== */

/**
 * Unlocks the advanced suggestion system:
 * - paid-only suggestions
 * - community voting
 * - UI/UX roadmap proposals
 */
export function isAdvancedSuggestionSystemEnabled(
  ctx: FeatureFlagContext
): boolean {
  return ctx.paidUsersCount >= PAID_USERS_THRESHOLD
}

/**
 * Whether community voting is enabled.
 * (kept separate for future tuning)
 */
export function isCommunityVotingEnabled(
  ctx: FeatureFlagContext
): boolean {
  return isAdvancedSuggestionSystemEnabled(ctx)
}

/**
 * Whether paid users can request
 * custom dashboard work (paid add-on).
 */
export function isCustomDashboardRequestsEnabled(
  ctx: FeatureFlagContext
): boolean {
  return isAdvancedSuggestionSystemEnabled(ctx)
}

/* ===============================
   SAFE DEFAULTS (FAIL CLOSED)
=============================== */

/**
 * When context is unavailable,
 * system must fail CLOSED.
 */
export const DISABLED_FEATURE_FLAGS = {
  advancedSuggestions: false,
  communityVoting: false,
  customDashboardRequests: false,
} as const