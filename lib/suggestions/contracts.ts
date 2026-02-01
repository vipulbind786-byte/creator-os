// /lib/suggestions/contracts.ts

/* ======================================================
   SUGGESTION BOX — INTEGRATION CONTRACT (LOCKED)

   ✔ UI-safe
   ✔ API-safe
   ✔ Analytics-safe
   ✔ No logic
   ✔ No side effects

   ❌ Do NOT add rules here
   ❌ Do NOT infer access here
====================================================== */

import type { SuggestionType } from "./types"

/* ======================================================
   INPUT CONTRACT (UI / API → DOMAIN)
====================================================== */

/**
 * Minimal data required to evaluate suggestion access.
 * Must be resolved BEFORE calling evaluator.
 */
export type SuggestionAccessContext = {
  suggestionType: SuggestionType

  /**
   * Simplified category only
   * (resolved from billing / entitlements elsewhere)
   */
  userPlanType: "free" | "paid"

  /**
   * Platform-level metric
   * (cached / aggregated)
   */
  paidUsersCount: number

  /**
   * Optional paid add-ons
   */
  activeAddOns?: string[]
}

/* ======================================================
   OUTPUT CONTRACT (DOMAIN → UI / API)
====================================================== */

export type SuggestionAccessResponse =
  | {
      allowed: true
    }
  | {
      allowed: false

      /**
       * UI-displayable reason key
       * (mapped to copy via i18n / UI layer)
       */
      reason:
        | "PLAN_NOT_ALLOWED"
        | "PLATFORM_LOCKED"
        | "ADDON_REQUIRED"
        | "UNKNOWN_SUGGESTION_TYPE"

      /**
       * Optional hints for UI messaging
       */
      requiredPaidUsers?: number
      requiredAddOn?: string
    }

/* ======================================================
   UI MAPPING RULES (HARD)
====================================================== */

/**
 * UI MUST:
 * - read only `allowed` + `reason`
 * - NEVER infer logic
 * - NEVER guess thresholds
 *
 * UI MUST NOT:
 * - hardcode paid user counts
 * - hardcode add-on names
 * - check billing plan IDs
 */