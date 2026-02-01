// /lib/billing/plans.ts
// 🔒 PHASE-1: PRICING & PSYCHOLOGY ALIGNMENT — FINAL
// SINGLE SOURCE OF TRUTH
// DO NOT MODIFY AFTER LOCK

import {
  BILLING_PLANS,
  BILLING_FEATURES,
  type BillingPlan,
} from "./types"

/* ======================================================
   BILLING PLANS — PSYCHOLOGY-FIRST (LOCKED)

   ✔ Pricing aligned with ₹699 / ₹1199 / ₹1999
   ✔ Feature system untouched
   ✔ No UI promises
   ✔ No limit marketing
   ✔ Revenue + upgrade pressure safe

   ❌ Do NOT change features here
   ❌ Do NOT add new plans
   ❌ Do NOT surface limits in UI
====================================================== */

/* ===============================
   FREE PLAN — CONTROLLED ENTRY
=============================== */
const FREE_PLAN: BillingPlan = {
  id: BILLING_PLANS.FREE,
  name: "Free",
  description: "Explore Creator OS",

  prices: [
    {
      amount: 0,
      currency: "INR",
      interval: "monthly",
    },
  ],

  features: {
    [BILLING_FEATURES.INSIGHTS_BASIC]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.PRODUCT_LIMIT]: {
      type: "limit",
      limit: 3,
    },
  },
}

/* ===============================
   ENTRY CONTROL — ₹699
=============================== */
const CREATOR_STARTER_PLAN: BillingPlan = {
  id: BILLING_PLANS.CREATOR_STARTER,
  name: "Entry Control",
  description: "Unlock consistent creation",

  prices: [
    {
      amount: 69900, // ₹699
      currency: "INR",
      interval: "monthly",
    },
  ],

  features: {
    [BILLING_FEATURES.INSIGHTS_BASIC]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.INSIGHTS_ADVANCED]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.PRODUCT_LIMIT]: {
      type: "limit",
      limit: 10,
    },
  },
}

/* ===============================
   PRIORITY OUTCOME — ₹1199
=============================== */
const CREATOR_PRO_PLAN: BillingPlan = {
  id: BILLING_PLANS.CREATOR_PRO,
  name: "Priority Outcome",
  description: "Move faster with clarity",

  prices: [
    {
      amount: 119900, // ₹1,199
      currency: "INR",
      interval: "monthly",
    },
  ],

  features: {
    [BILLING_FEATURES.INSIGHTS_BASIC]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.INSIGHTS_ADVANCED]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.INSIGHT_HISTORY]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.PRODUCT_LIMIT]: {
      type: "limit",
      limit: 50,
    },

    [BILLING_FEATURES.EXPORT_CSV]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.PRIORITY_SUPPORT]: {
      type: "boolean",
      enabled: true,
    },
  },
}

/* ===============================
   ELITE CONTROL — ₹1999
=============================== */
const CREATOR_BUSINESS_PLAN: BillingPlan = {
  id: BILLING_PLANS.CREATOR_BUSINESS,
  name: "Elite Control",
  description: "Full control. No friction.",

  prices: [
    {
      amount: 199900, // ₹1,999
      currency: "INR",
      interval: "monthly",
    },
  ],

  features: {
    [BILLING_FEATURES.INSIGHTS_BASIC]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.INSIGHTS_ADVANCED]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.INSIGHT_HISTORY]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.PRODUCT_LIMIT]: {
      type: "limit",
      limit: 9999,
    },

    [BILLING_FEATURES.EXPORT_CSV]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.EXPORT_PDF]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.PRIORITY_SUPPORT]: {
      type: "boolean",
      enabled: true,
    },

    [BILLING_FEATURES.CUSTOM_DOMAIN]: {
      type: "boolean",
      enabled: true,
    },
  },
}

/* ======================================================
   PLAN REGISTRY — HARD LOCK
====================================================== */

export const BILLING_PLANS_REGISTRY = {
  [BILLING_PLANS.FREE]: FREE_PLAN,
  [BILLING_PLANS.CREATOR_STARTER]: CREATOR_STARTER_PLAN,
  [BILLING_PLANS.CREATOR_PRO]: CREATOR_PRO_PLAN,
  [BILLING_PLANS.CREATOR_BUSINESS]: CREATOR_BUSINESS_PLAN,
} as const

export const ALL_BILLING_PLANS = Object.values(
  BILLING_PLANS_REGISTRY
)