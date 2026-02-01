// /lib/billing/upgradePolicy.ts

/* ======================================================
   UPGRADE / DOWNGRADE POLICY — P4 STEP 3 (LOCKED)

   ✔ Stripe-agnostic
   ✔ Deterministic
   ✔ Auditable
   ✔ Upgrade-safe
   ✔ Downgrade-safe
   ✔ Feature-based (NOT plan-based)

   ❌ No DB
   ❌ No Stripe SDK
   ❌ No UI
====================================================== */

import {
  type BillingPlanId,
  BILLING_PLANS,
} from "./types"

/* ===============================
   PLAN ORDER (AUTHORITATIVE)
   Lower index = lower tier
=============================== */

const PLAN_ORDER: BillingPlanId[] = [
  BILLING_PLANS.FREE,
  BILLING_PLANS.CREATOR_STARTER,
  BILLING_PLANS.CREATOR_PRO,
  BILLING_PLANS.CREATOR_BUSINESS,
]

/* ===============================
   POLICY TYPES
=============================== */

export type PlanChangeType =
  | "upgrade"
  | "downgrade"
  | "same_plan"

export type PlanChangeDecision = {
  type: PlanChangeType
  allowed: boolean

  /**
   * Stripe behavior hint
   * Used by checkout / portal layer
   */
  billingAction:
    | "immediate_charge"
    | "defer_to_period_end"
    | "no_change"

  /**
   * Human-readable reason (logs / audit)
   */
  reason: string
}

/* ===============================
   HELPERS (PURE)
=============================== */

function getPlanRank(planId: BillingPlanId): number {
  return PLAN_ORDER.indexOf(planId)
}

function isValidPlan(planId: BillingPlanId): boolean {
  return getPlanRank(planId) !== -1
}

/* ===============================
   CORE — PLAN CHANGE POLICY
=============================== */

/**
 * Decide how a plan change should behave.
 *
 * CONTRACT:
 * - Does NOT perform billing
 * - Does NOT touch DB
 * - Stripe layer MUST obey billingAction
 */
export function decidePlanChange(params: {
  currentPlan: BillingPlanId
  nextPlan: BillingPlanId
}): PlanChangeDecision {
  const { currentPlan, nextPlan } = params

  if (!isValidPlan(currentPlan) || !isValidPlan(nextPlan)) {
    return {
      type: "same_plan",
      allowed: false,
      billingAction: "no_change",
      reason: "INVALID_PLAN_ID",
    }
  }

  if (currentPlan === nextPlan) {
    return {
      type: "same_plan",
      allowed: false,
      billingAction: "no_change",
      reason: "SAME_PLAN",
    }
  }

  const currentRank = getPlanRank(currentPlan)
  const nextRank = getPlanRank(nextPlan)

  /* ===============================
     UPGRADE
  =============================== */
  if (nextRank > currentRank) {
    return {
      type: "upgrade",
      allowed: true,
      billingAction: "immediate_charge",
      reason: "UPGRADE_IMMEDIATE",
    }
  }

  /* ===============================
     DOWNGRADE
  =============================== */
  if (nextRank < currentRank) {
    return {
      type: "downgrade",
      allowed: true,
      billingAction: "defer_to_period_end",
      reason: "DOWNGRADE_AT_PERIOD_END",
    }
  }

  /* ===============================
     FALLBACK (SHOULD NEVER HAPPEN)
  =============================== */
  return {
    type: "same_plan",
    allowed: false,
    billingAction: "no_change",
    reason: "UNEXPECTED_STATE",
  }
}

/* ======================================================
   🔐 HARD RULES (DO NOT BREAK)
====================================================== */
/**
 * 1. UI must NEVER infer upgrade/downgrade itself
 * 2. Stripe checkout must follow billingAction
 * 3. Feature access updates ONLY after webhook
 * 4. Downgrades NEVER revoke mid-cycle
 * 5. This file is the single policy authority
 */