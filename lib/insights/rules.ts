import type {
  DashboardMetrics,
  Insight,
  InsightRule,
} from "@/types/insight"
import { INSIGHT_IDS } from "@/lib/insights/ids"

/* ======================================================
   INSIGHT RULES — P3 (LOCKED)

   ✔ Pure logic
   ✔ Deterministic
   ✔ Engine-safe
   ✔ i18n-safe
   ✔ Monetization-ready
====================================================== */

/* ------------------------------------------------------
   CRITICAL — FAILED PAYMENTS
------------------------------------------------------ */
export const checkFailedPayments: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  const THRESHOLD = 3

  if (metrics.failedPayments7d >= THRESHOLD) {
    return {
      id: INSIGHT_IDS.FAILED_PAYMENTS,
      kind: "warning",
      title: "Customers are facing payment issues",
      body:
        "Multiple customers failed to complete payments recently. This may be causing lost sales and needs attention.",
      priority: 1,

      meta: {
        ruleName: "FAILED_PAYMENTS_7D",
        metricKey: "failedPayments7d",
      },
    }
  }

  return null
}

/* ------------------------------------------------------
   WARNING — HIGH REFUND RATE
------------------------------------------------------ */
export const checkHighRefundRate: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  const CRITICAL_THRESHOLD = 0.2 // 20%

  if (metrics.totalRevenue > 0 && metrics.refundedAmount7d > 0) {
    const refundRate =
      metrics.refundedAmount7d / metrics.totalRevenue

    if (refundRate >= CRITICAL_THRESHOLD) {
      return {
        id: INSIGHT_IDS.HIGH_REFUND_RATE,
        kind: "warning",
        title: "Refunds are unusually high",
        body:
          "A significant portion of your revenue was refunded recently. This is a strong signal to review product quality, pricing, or customer expectations.",
        priority: 2,

        meta: {
          ruleName: "HIGH_REFUND_RATE",
          metricKey: "refundedAmount7d",
        },
      }
    }
  }

  return null
}

/* ------------------------------------------------------
   INFO — REFUNDS ISSUED
------------------------------------------------------ */
export const checkRefunds: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  if (metrics.refundedAmount7d > 0) {
    return {
      id: INSIGHT_IDS.REFUNDS,
      kind: "info",
      title: "Refunds issued recently",
      body:
        "Some refunds were issued in the last 7 days. This may indicate unmet expectations or product confusion.",
      priority: 3,

      meta: {
        ruleName: "REFUNDS_7D",
        metricKey: "refundedAmount7d",
      },
    }
  }

  return null
}

/* ------------------------------------------------------
   SUCCESS — STRONG PERFORMANCE
------------------------------------------------------ */
export const checkStrongPerformance: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  const EXCEPTIONAL_THRESHOLD = 0.1 // 10%

  if (
    metrics.totalRevenue > 0 &&
    metrics.todayRevenue > 0 &&
    metrics.todayRevenue / metrics.totalRevenue >=
      EXCEPTIONAL_THRESHOLD
  ) {
    return {
      id: INSIGHT_IDS.STRONG_PERFORMANCE,
      kind: "success",
      title: "Today is an exceptional day",
      body:
        "A significant share of your total revenue was earned today. This is a standout performance worth doubling down on.",
      priority: 3,

      meta: {
        ruleName: "STRONG_PERFORMANCE",
        metricKey: "todayRevenue",
      },
    }
  }

  return null
}

/* ------------------------------------------------------
   SUCCESS — REVENUE TODAY
------------------------------------------------------ */
export const checkRevenueToday: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  if (metrics.todayRevenue > 0) {
    return {
      id: INSIGHT_IDS.REVENUE_TODAY,
      kind: "success",
      title: "Sales are coming in today",
      body:
        "You've already made sales today. Whatever you're doing is working — keep the momentum going.",
      priority: 4,

      meta: {
        ruleName: "REVENUE_TODAY",
        metricKey: "todayRevenue",
      },
    }
  }

  return null
}

/* ------------------------------------------------------
   INFO — NO BEST SELLER
------------------------------------------------------ */
export const checkNoBestSeller: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  if (metrics.totalRevenue > 0 && !metrics.bestSellingProduct) {
    return {
      id: INSIGHT_IDS.NO_BEST_SELLER,
      kind: "info",
      title: "No clear top-selling product yet",
      body:
        "Your sales are spread across multiple products. Once a top performer emerges, doubling down on it could boost growth.",
      priority: 5,

      meta: {
        ruleName: "NO_BEST_SELLER",
        metricKey: "bestSellingProduct",
      },
    }
  }

  return null
}

/* ------------------------------------------------------
   INFO — ZERO REVENUE
------------------------------------------------------ */
export const checkZeroRevenue: InsightRule = (
  metrics: DashboardMetrics
): Insight | null => {
  if (metrics.totalRevenue === 0) {
    return {
      id: INSIGHT_IDS.ZERO_REVENUE,
      kind: "info",
      title: "You're ready for your first sale",
      body:
        "Everything is set up. Share your product links and start bringing your first customers onboard.",
      priority: 6,

      meta: {
        ruleName: "ZERO_REVENUE",
        metricKey: "totalRevenue",
      },
    }
  }

  return null
}

/* ======================================================
   RULE REGISTRY — EXECUTION ORDER
====================================================== */

export const ALL_RULES: InsightRule[] = [
  checkFailedPayments,
  checkHighRefundRate,
  checkRefunds,
  checkStrongPerformance,
  checkRevenueToday,
  checkNoBestSeller,
  checkZeroRevenue,
]