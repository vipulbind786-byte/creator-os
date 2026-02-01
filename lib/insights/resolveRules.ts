// lib/insights/resolveRules.ts

import type { Insight, DashboardMetrics } from "@/types/insight"

/* ======================================================
   AUTO-RESOLVE ENGINE (PURE LOGIC)
   
   ✔ Deterministic
   ✔ No DB
   ✔ No UI
   ✔ Metrics-driven
====================================================== */

export type ResolveDecision =
  | { shouldResolve: false }
  | { shouldResolve: true; reason: string }

/**
 * Decide whether an insight should be auto-resolved
 * based on CURRENT dashboard metrics.
 *
 * ⚠️ IMPORTANT:
 * Insight IDs MUST match rules.ts
 */
export function resolveInsightByRules(
  insight: Insight,
  metrics: DashboardMetrics
): ResolveDecision {
  switch (insight.id) {
    /* ===============================
       FAILED PAYMENTS
    =============================== */
    case "failed_payments": {
      if (metrics.failedPayments7d <= 1) {
        return {
          shouldResolve: true,
          reason: "failed_payments_normalized",
        }
      }
      return { shouldResolve: false }
    }

    /* ===============================
       HIGH REFUND RATE
    =============================== */
    case "high_refund_rate": {
      if (
        metrics.totalRevenue > 0 &&
        metrics.refundedAmount7d / metrics.totalRevenue < 0.1
      ) {
        return {
          shouldResolve: true,
          reason: "refund_rate_recovered",
        }
      }
      return { shouldResolve: false }
    }

    /* ===============================
       ZERO REVENUE
    =============================== */
    case "zero_revenue": {
      if (metrics.totalRevenue > 0) {
        return {
          shouldResolve: true,
          reason: "first_sale_made",
        }
      }
      return { shouldResolve: false }
    }

    /* ===============================
       NO BEST SELLER
    =============================== */
    case "no_best_seller": {
      if (metrics.bestSellingProduct) {
        return {
          shouldResolve: true,
          reason: "best_seller_identified",
        }
      }
      return { shouldResolve: false }
    }

    /* ===============================
       DEFAULT — DO NOTHING
    =============================== */
    default:
      return { shouldResolve: false }
  }
}