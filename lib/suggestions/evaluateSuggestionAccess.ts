// lib/suggestions/evaluateSuggestionAccess.ts
// 🔒 STEP-12: SUGGESTION ACCESS EVALUATOR — FINAL
// SINGLE AUTHORITY • PURE LOGIC • FUTURE-SAFE
// ❌ NO DB
// ❌ NO UI
// ❌ NO BILLING LOOKUPS

import type {
  SuggestionAccessRule,
  SuggestionAccessContext,
  SuggestionType,
} from "@/lib/suggestions/types"

/* ======================================================
   RESULT TYPE
====================================================== */
export type SuggestionAccessResult =
  | { allowed: true }
  | {
      allowed: false
      reason:
        | "platform_locked"
        | "plan_not_allowed"
        | "addon_required"
    }

/* ======================================================
   CORE EVALUATOR
====================================================== */

/**
 * Final decision engine for suggestion submission.
 *
 * Evaluation order (LOCKED):
 * 1. Platform gate (1k paid users etc.)
 * 2. User plan eligibility
 * 3. Required add-on (if any)
 */
export function evaluateSuggestionAccess(
  suggestionType: SuggestionType,
  rule: SuggestionAccessRule,
  ctx: SuggestionAccessContext
): SuggestionAccessResult {
  /* -------------------------------
     1️⃣ Platform-wide gate
  -------------------------------- */
  if (
    rule.requiresPlatformUnlock &&
    !ctx.platform.suggestionBoxUnlocked
  ) {
    return {
      allowed: false,
      reason: "platform_locked",
    }
  }

  /* -------------------------------
     2️⃣ Plan eligibility
  -------------------------------- */
  if (!rule.allowedPlans.includes(ctx.user.plan)) {
    return {
      allowed: false,
      reason: "plan_not_allowed",
    }
  }

  /* -------------------------------
     3️⃣ Paid add-on requirement
  -------------------------------- */
  if (
    rule.requiresAddOn &&
    !ctx.user.addOns?.includes(rule.requiresAddOn)
  ) {
    return {
      allowed: false,
      reason: "addon_required",
    }
  }

  /* -------------------------------
     ✅ ACCESS GRANTED
  -------------------------------- */
  return { allowed: true }
}