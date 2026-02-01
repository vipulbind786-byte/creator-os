// /lib/billing/entitlements.ts

import {
  type BillingFeatureKey,
  type BillingPlanId,
  type FeatureDefinition,
} from "./types"
import { BILLING_PLANS_REGISTRY } from "./plans"

/* ======================================================
   ENTITLEMENTS RESOLVER — SINGLE SOURCE OF TRUTH (P4 LOCKED)

   ✔ Feature-based (NEVER plan-based)
   ✔ Runtime safe
   ✔ UI / API / Engine compatible
   ✔ Stripe-agnostic
   ✔ Usage-ready (future-proof)

   ❌ UI must NEVER check planId
   ❌ No hardcoded limits
====================================================== */

/* ===============================
   CORE — RESOLVE ONE FEATURE
=============================== */

/**
 * Resolve a single feature entitlement for a plan.
 * This is the ONLY correct access entry point.
 */
export function getFeatureEntitlement(
  planId: BillingPlanId,
  feature: BillingFeatureKey
): FeatureDefinition {
  const plan = BILLING_PLANS_REGISTRY[planId]

  if (!plan) {
    // Defensive default — zero access
    return { type: "boolean", enabled: false }
  }

  const featureConfig = plan.features[feature]

  if (!featureConfig) {
    // Feature not included in plan
    return { type: "boolean", enabled: false }
  }

  return featureConfig
}

/* ===============================
   BOOLEAN ACCESS CHECK
=============================== */

/**
 * Boolean feature check
 * Examples:
 * - insights_advanced
 * - export_csv
 * - custom_domain
 */
export function hasFeature(
  planId: BillingPlanId,
  feature: BillingFeatureKey
): boolean {
  const entitlement = getFeatureEntitlement(planId, feature)

  switch (entitlement.type) {
    case "boolean":
      return entitlement.enabled

    case "limit":
      return entitlement.limit > 0

    case "usage":
      return entitlement.quota > 0

    default:
      return false
  }
}

/* ===============================
   LIMIT ACCESS CHECK
=============================== */

/**
 * Limit-based feature check
 * Example:
 * - product_limit
 */
export function getFeatureLimit(
  planId: BillingPlanId,
  feature: BillingFeatureKey
): number {
  const entitlement = getFeatureEntitlement(planId, feature)

  if (entitlement.type === "limit") {
    return entitlement.limit
  }

  return 0
}

/* ===============================
   USAGE ACCESS CHECK (FUTURE)
=============================== */

/**
 * Usage-based feature quota
 * Example (future):
 * - AI requests
 * - exports per month
 */
export function getFeatureQuota(
  planId: BillingPlanId,
  feature: BillingFeatureKey
): number {
  const entitlement = getFeatureEntitlement(planId, feature)

  if (entitlement.type === "usage") {
    return entitlement.quota
  }

  return 0
}

/* ===============================
   BULK RESOLUTION (SAFE)
=============================== */

/**
 * Resolve ALL feature entitlements for a plan.
 * Used for:
 * - Billing UI
 * - Debug panels
 * - Analytics snapshots
 */
export function resolvePlanEntitlements(
  planId: BillingPlanId
) {
  const plan = BILLING_PLANS_REGISTRY[planId]

  if (!plan) {
    return {}
  }

  return plan.features
}

/* ======================================================
   🔐 HARD RULES (DO NOT BREAK)
====================================================== */
/**
 * 1. UI → hasFeature / getFeatureLimit ONLY
 * 2. API → hasFeature / getFeatureLimit ONLY
 * 3. Engine → NEVER checks planId
 * 4. Plans define features, NOT permissions
 * 5. This file is the ONLY resolver
 */