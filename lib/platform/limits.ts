/* ======================================================
   PLATFORM LIMITS & GLOBAL GATES — P4 (LOCKED)

   ✔ Centralized
   ✔ UI-agnostic
   ✔ DB-agnostic
   ✔ Feature rollout safe
====================================================== */

/**
 * Global platform thresholds.
 * These are NOT user-specific.
 * Changing these does NOT require UI changes.
 */
export const PLATFORM_LIMITS = {
  /**
   * Paid users required to unlock
   * community voting & UI-wide suggestions.
   */
  COMMUNITY_SUGGESTION_UNLOCK_PAID_USERS: 1000,
} as const

/**
 * Platform gate identifiers.
 * Used by policy + analytics.
 */
export const PLATFORM_GATES = {
  COMMUNITY_SUGGESTIONS: "community_suggestions",
} as const

export type PlatformGateKey =
  typeof PLATFORM_GATES[keyof typeof PLATFORM_GATES]