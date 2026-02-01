// lib/billing/resolveUserEntitlements.ts

/* ======================================================
   STEP-7: USER ENTITLEMENTS RESOLVER — FINAL
   🔒 SERVER-ONLY • READ-ONLY • HARD LOCK

   ✔ Feature-based (plan driven)
   ✔ Add-on aware (separate channel)
   ✔ Deterministic
   ✔ Audit-safe

   ❌ No DB writes
   ❌ No UI logic
====================================================== */

import type {
  BillingFeatureKey,
  FeatureDefinition,
} from "@/lib/billing/types"

import { BILLING_PLANS_REGISTRY } from "@/lib/billing/plans"

/* ===============================
   INPUT
=============================== */
export type ResolveUserEntitlementsParams = {
  planId: string
  activeAddOns: string[]
}

/* ===============================
   OUTPUT (LOCKED SHAPE)
=============================== */
export type ResolvedUserEntitlements = {
  /**
   * Plan-based feature entitlements ONLY
   */
  features: Partial<
    Record<BillingFeatureKey, FeatureDefinition>
  >

  /**
   * Active add-ons (explicit, non-inferred)
   */
  addOns: string[]
}

/* ======================================================
   CORE RESOLVER — SINGLE AUTHORITY
====================================================== */
export function resolveUserEntitlements(
  params: ResolveUserEntitlementsParams
): ResolvedUserEntitlements {
  const { planId, activeAddOns } = params

  /* -------------------------------
     1️⃣ Resolve plan features
  -------------------------------- */
  const plan =
    BILLING_PLANS_REGISTRY[
      planId as keyof typeof BILLING_PLANS_REGISTRY
    ]

  const features =
    plan?.features ??
    ({} as Partial<
      Record<BillingFeatureKey, FeatureDefinition>
    >)

  /* -------------------------------
     2️⃣ Add-ons are NOT features
     (kept isolated by design)
  -------------------------------- */
  return {
    features,
    addOns: activeAddOns,
  }
}