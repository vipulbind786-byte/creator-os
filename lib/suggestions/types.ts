// /lib/suggestions/types.ts

/* ======================================================
   SUGGESTION BOX — DOMAIN TYPES (LOCK-READY)

   ✔ Pure domain definitions
   ✔ No logic
   ✔ No DB
   ✔ No UI
   ✔ Monetization-safe
   ✔ Future-proof

   ❌ No imports from UI
   ❌ No billing logic
====================================================== */

/* ===============================
   PLATFORM GATES
=============================== */

/**
 * Platform-wide capability flags.
 * Derived from analytics / DB (read-only).
 */
export type PlatformSuggestionGates = {
  /**
   * True once total paid users >= 1000
   * Once enabled, MUST never revert.
   */
  suggestionBoxUnlocked: boolean
}

/* ===============================
   USER SEGMENT
=============================== */

export type UserPlanTier =
  | "free"
  | "paid"

/* ===============================
   PAID ADD-ONS
=============================== */

/**
 * Optional monetized capabilities
 * attached to a paid user.
 */
export type SuggestionAddOn =
  | "custom_dashboard_request"

/* ===============================
   SUGGESTION TYPES (LOCKED)
=============================== */

/**
 * All possible suggestion intents.
 * ❌ Do NOT rename once shipped
 * ✅ New types require product approval
 */
export const SUGGESTION_TYPES = {
  BUG_REPORT: "bug_report",
  ERROR_REPORT: "error_report",

  FEATURE_SUGGESTION: "feature_suggestion",
  UX_FEEDBACK: "ux_feedback",

  CUSTOM_REQUEST: "custom_request",
  COMMUNITY_PROPOSAL: "community_proposal",
} as const

export type SuggestionType =
  typeof SUGGESTION_TYPES[keyof typeof SUGGESTION_TYPES]

/* ===============================
   ACCESS REQUIREMENTS
=============================== */

/**
 * Declarative access requirements
 * for a suggestion type.
 */
export type SuggestionAccessRule = {
  /**
   * Requires global platform unlock
   * (1k paid users)
   */
  requiresPlatformUnlock: boolean

  /**
   * Allowed user tiers
   */
  allowedPlans: UserPlanTier[]

  /**
   * Optional paid add-on required
   */
  requiresAddOn?: SuggestionAddOn
}

/* ===============================
   RULE REGISTRY SHAPE
=============================== */

/**
 * Mapping between suggestion type
 * and its access requirements.
 *
 * NOTE:
 * - This file does NOT define rules
 * - Only the shape
 */
export type SuggestionAccessRegistry = {
  [K in SuggestionType]: SuggestionAccessRule
}

/* ===============================
   SUBMISSION CONTEXT (RUNTIME)
=============================== */

/**
 * Runtime context passed to
 * access evaluators (future).
 */
export type SuggestionAccessContext = {
  platform: PlatformSuggestionGates

  user: {
    plan: UserPlanTier
    addOns?: SuggestionAddOn[]
  }
}