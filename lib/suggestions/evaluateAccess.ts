// /lib/suggestions/evaluateAccess.ts

/* ======================================================
   SUGGESTION BOX — ACCESS EVALUATION LOGIC (LOCKED)

   ✔ Pure function
   ✔ Deterministic
   ✔ Auditable
   ✔ Business-rule accurate

   ❌ No UI
   ❌ No DB
   ❌ No billing SDK
====================================================== */

import type { SuggestionType } from "./types"
import type { SuggestionAccessResponse } from "./contracts"
import { SUGGESTION_ACCESS_RULES } from "./accessRules"

/* ======================================================
   INPUT SHAPE
====================================================== */

export type EvaluateSuggestionAccessParams = {
  suggestionType: SuggestionType

  /**
   * Simplified user category
   * (resolved elsewhere from billing)
   */
  userPlanType: "free" | "paid"

  /**
   * Global platform metric
   * (paid users count)
   */
  paidUsersCount: number

  /**
   * Optional paid add-ons
   */
  activeAddOns?: string[]
}

/* ======================================================
   PLATFORM THRESHOLDS (LOCKED)
====================================================== */

const PLATFORM_UNLOCK_PAID_USERS = 1000

/* ======================================================
   CORE EVALUATOR — SINGLE SOURCE OF TRUTH
====================================================== */

export function evaluateSuggestionAccess(
  params: EvaluateSuggestionAccessParams
): SuggestionAccessResponse {
  const {
    suggestionType,
    userPlanType,
    paidUsersCount,
    activeAddOns = [],
  } = params

  const rule = SUGGESTION_ACCESS_RULES[suggestionType]

  /* -------------------------------
     Safety: unknown suggestion type
  -------------------------------- */
  if (!rule) {
    return {
      allowed: false,
      reason: "UNKNOWN_SUGGESTION_TYPE",
    }
  }

  /* -------------------------------
     Plan gating
  -------------------------------- */
  if (!rule.allowedPlans.includes(userPlanType)) {
    return {
      allowed: false,
      reason: "PLAN_NOT_ALLOWED",
    }
  }

  /* -------------------------------
     Platform unlock gating
  -------------------------------- */
  if (
    rule.requiresPlatformUnlock &&
    paidUsersCount < PLATFORM_UNLOCK_PAID_USERS
  ) {
    return {
      allowed: false,
      reason: "PLATFORM_LOCKED",
      requiredPaidUsers: PLATFORM_UNLOCK_PAID_USERS,
    }
  }

  /* -------------------------------
     Add-on gating (monetization)
  -------------------------------- */
  if (
    rule.requiresAddOn &&
    !activeAddOns.includes(rule.requiresAddOn)
  ) {
    return {
      allowed: false,
      reason: "ADDON_REQUIRED",
      requiredAddOn: rule.requiresAddOn,
    }
  }

  /* -------------------------------
     Allowed
  -------------------------------- */
  return {
    allowed: true,
  }
}