/* ======================================================
   INSIGHT ID REGISTRY — P3 (LOCKED)

   🔒 SINGLE SOURCE OF TRUTH
   🔒 Compile-time safety
   🔒 Analytics / monetization ready

   ❌ Do NOT rename existing IDs
   ❌ Do NOT delete IDs once shipped
   ✅ New IDs require product decision
====================================================== */

/**
 * Insight IDs are intentionally grouped
 * for analytics, UX, and monetization layers.
 */
export const INSIGHT_IDS = {
  /* ===============================
     BILLING / PAYMENTS (CRITICAL)
  =============================== */
  FAILED_PAYMENTS: "failed_payments",
  REFUNDS: "refunds",
  HIGH_REFUND_RATE: "high_refund_rate",

  /* ===============================
     REVENUE / PERFORMANCE
  =============================== */
  REVENUE_TODAY: "revenue_today",
  STRONG_PERFORMANCE: "strong_performance",

  /* ===============================
     GROWTH / DISCOVERY
  =============================== */
  NO_BEST_SELLER: "no_best_seller",

  /* ===============================
     ONBOARDING / EARLY STAGE
  =============================== */
  ZERO_REVENUE: "zero_revenue",
} as const

/**
 * 🔒 InsightId
 * Auto-derived union from registry above.
 *
 * Used by:
 * - Engine
 * - UI
 * - DB
 * - Analytics
 * - Explainability
 */
export type InsightId =
  typeof INSIGHT_IDS[keyof typeof INSIGHT_IDS]

/* ======================================================
   🔐 ADDING NEW INSIGHTS — READ THIS
====================================================== */
/**
 * To add a new InsightId:
 * 1. Product decision approved
 * 2. Add here (grouped correctly)
 * 3. Add rule in rules.ts
 * 4. Add translations
 * 5. Add explain mapping
 *
 * Skipping any step = BUG
 */