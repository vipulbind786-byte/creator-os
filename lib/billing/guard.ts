// lib/billing/guard.ts
// 🔒 STEP-10: ACCESS GUARD — SINGLE SOURCE OF TRUTH
// FEATURE + ADDON + PLAN RESOLUTION
// ❌ UI MUST NOT CHECK FEATURES / ADDONS DIRECTLY
// ❌ NO DOMAIN LEAKAGE

import {
  hasFeature,
  getFeatureLimit,
} from "@/lib/billing/entitlements"

import {
  BILLING_FEATURES,
  type BillingPlanId,
  type BillingAddOn,
} from "@/lib/billing/types"

import { getUserAddons } from "@/lib/billing/addons/getUserAddons"

/* ===============================
   TYPES
=============================== */

export type GuardContext = {
  userId: string
  planId: BillingPlanId
}

export type GuardResult = {
  canSeeAdvancedInsights: boolean
  productLimit: number
  addons: BillingAddOn[] // 🔑 canonical addon list (strings)
}

/* ===============================
   CORE GUARD (ONLY AUTHORITY)
=============================== */

export async function checkAccess(
  ctx: GuardContext
): Promise<GuardResult> {
  const { userId, planId } = ctx

  /* -------------------------------
     1️⃣ Plan-based features
  -------------------------------- */
  const canSeeAdvancedInsights = hasFeature(
    planId,
    BILLING_FEATURES.INSIGHTS_ADVANCED
  )

  const productLimit = getFeatureLimit(
    planId,
    BILLING_FEATURES.PRODUCT_LIMIT
  )

  /* -------------------------------
     2️⃣ Add-ons (support-granted)
     NOTE: getUserAddons returns string[]
  -------------------------------- */
  const addons: BillingAddOn[] =
    await getUserAddons(userId)

  /* -------------------------------
     3️⃣ FINAL RESOLUTION
  -------------------------------- */
  return {
    canSeeAdvancedInsights,
    productLimit,
    addons,
  }
}