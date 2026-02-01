/* ======================================================
   BILLING DOMAIN TYPES — P4 (LOCKED)

   ✔ Single source of truth
   ✔ Stripe / DB / Analytics safe
   ✔ Feature-gating ready
   ✔ Monetization future-proof
   ✔ Platform-level unlocks supported (1k users etc.)

   ❌ Do NOT shorten plan IDs
====================================================== */

/* ===============================
   BILLING PLAN IDS (LOCKED)
   ⚠️ Namespaced by product
=============================== */

export const BILLING_PLANS = {
  FREE: "free",

  CREATOR_STARTER: "creator_starter",
  CREATOR_PRO: "creator_pro",
  CREATOR_BUSINESS: "creator_business",
} as const

export type BillingPlanId =
  typeof BILLING_PLANS[keyof typeof BILLING_PLANS]

/* ===============================
   BILLING INTERVAL
=============================== */

export type BillingInterval =
  | "monthly"
  | "yearly"

/* ===============================
   FEATURE ACCESS MODE
=============================== */

export type FeatureAccessType =
  | "boolean"
  | "limit"
  | "usage"

/* ===============================
   ADD-ONS (SUPPORT ONLY)
=============================== */

export type BillingAddOn =
  | "dashboard_customization"


/* ===============================
   FEATURE KEYS (LOCKED)
   ➕ Suggestion Box + Platform Gates added
=============================== */

export const BILLING_FEATURES = {
  /* -------- INSIGHTS -------- */
  INSIGHTS_BASIC: "insights_basic",
  INSIGHTS_ADVANCED: "insights_advanced",
  INSIGHT_HISTORY: "insight_history",

  /* -------- EXPORTS -------- */
  EXPORT_CSV: "export_csv",
  EXPORT_PDF: "export_pdf",

  /* -------- PRODUCT -------- */
  PRODUCT_LIMIT: "product_limit",

  /* -------- SUPPORT -------- */
  PRIORITY_SUPPORT: "priority_support",
  CUSTOM_DOMAIN: "custom_domain",

  /* ==================================================
     🆕 SUGGESTION BOX (MONETIZATION CORE)
     --------------------------------------------------
     - FREE users: bugs / errors only
     - PAID users: custom dashboard + paid suggestions
     - PLATFORM GATE: unlocks only after 1000 paid users
  ================================================== */

  SUGGESTION_BOX_BASIC: "suggestion_box_basic",        // free bugs/errors
  SUGGESTION_BOX_PREMIUM: "suggestion_box_premium",    // paid custom work
  SUGGESTION_BOX_VOTING: "suggestion_box_voting",      // community voting
  SUGGESTION_BOX_PLATFORM_UNLOCK:
    "suggestion_box_platform_unlock",                  // 1k users gate
} as const

export type BillingFeatureKey =
  typeof BILLING_FEATURES[keyof typeof BILLING_FEATURES]

/* ===============================
   FEATURE DEFINITION
=============================== */

export type FeatureDefinition =
  | {
      type: "boolean"
      enabled: boolean
    }
  | {
      type: "limit"
      limit: number
    }
  | {
      type: "usage"
      quota: number
    }

/* ===============================
   PLAN FEATURE MAP
=============================== */

export type PlanFeatures = {
  [K in BillingFeatureKey]?: FeatureDefinition
}

/* ===============================
   PRICE STRUCTURE (DOMAIN)
=============================== */

export type PlanPrice = {
  amount: number
  currency: "INR"
  interval: BillingInterval
}

/* ===============================
   BILLING PLAN DEFINITION
=============================== */

export type BillingPlan = {
  id: BillingPlanId
  name: string
  description?: string
  prices: PlanPrice[]
  features: PlanFeatures
}

/* ===============================
   USER ENTITLEMENTS (RUNTIME)
=============================== */

export type UserEntitlements = {
  planId: BillingPlanId
  features: PlanFeatures
  validUntil?: string | null
}

/* ===============================
   FEATURE CHECK RESULT
=============================== */

export type FeatureAccessResult =
  | { allowed: true }
  | {
      allowed: false
      reason:
        | "not_in_plan"
        | "limit_exceeded"
        | "platform_locked" // ⬅️ for 1k paid users gate
    }

/* ======================================================
   🔐 HARD RULES (DO NOT BREAK)
====================================================== */
/**
 * 1. UI / API must check features — NOT planId
 * 2. Platform-wide gates (like 1k users) live OUTSIDE plans
 * 3. Suggestion monetization builds on top of this
 * 4. No pricing logic here
 * 5. This file is CONTRACT-LEVEL LOCKED
 */