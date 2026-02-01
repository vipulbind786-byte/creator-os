// lib/metrics/getDashboardMetrics.ts
// 🔒 OP-15: DASHBOARD METRICS — SINGLE SOURCE OF TRUTH
// PURE SERVER • READ-ONLY • INSIGHT-SAFE • NO UI COUPLING

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { DashboardMetrics } from "@/types/insight"

/**
 * Final authority for dashboard metrics.
 *
 * HARD RULES:
 * - Server-side only
 * - Orders table = source of truth
 * - PAID orders only
 * - Amounts stored in paise → convert to INR here
 * - NEVER throws (fail-safe)
 */
export async function getDashboardMetrics(
  userId: string
): Promise<DashboardMetrics> {
  try {
    if (!userId) {
      return zeroMetrics()
    }

    /* -----------------------------
       Fetch creator products
    ----------------------------- */
    const { data: products, error: productError } =
      await supabaseAdmin
        .from("products")
        .select("id, name")
        .eq("creator_id", userId)

    if (productError || !products || products.length === 0) {
      return zeroMetrics()
    }

    const productIds = products.map((p) => p.id)

    /* -----------------------------
       Time window
    ----------------------------- */
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    /* -----------------------------
       Fetch orders
    ----------------------------- */
    const { data: orders, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select("amount, status, product_id, created_at")
        .in("product_id", productIds)

    if (orderError || !orders) {
      return zeroMetrics()
    }

    /* -----------------------------
       Metrics calculation (PURE)
    ----------------------------- */
    let totalRevenue = 0
    let todayRevenue = 0
    let failedPayments7d = 0
    let refundedAmount7d = 0

    const productSales: Record<string, number> = {}

    for (const o of orders) {
      const amountInInr = (Number(o.amount) || 0) / 100

      if (o.status === "paid") {
        totalRevenue += amountInInr

        if (new Date(o.created_at) >= today) {
          todayRevenue += amountInInr
        }

        if (o.product_id) {
          productSales[o.product_id] =
            (productSales[o.product_id] ?? 0) + 1
        }
      }

      if (
        o.status === "failed" &&
        new Date(o.created_at) >= sevenDaysAgo
      ) {
        failedPayments7d += 1
      }

      if (
        o.status === "refunded" &&
        new Date(o.created_at) >= sevenDaysAgo
      ) {
        refundedAmount7d += amountInInr
      }
    }

    const bestSellingProduct =
      products
        .map((p) => ({
          name: p.name,
          count: productSales[p.id] ?? 0,
        }))
        .sort((a, b) => b.count - a.count)[0]?.name ?? null

    return {
      todayRevenue,
      totalRevenue,
      bestSellingProduct,
      failedPayments7d,
      refundedAmount7d,
    }
  } catch (err) {
    console.error("METRICS_FATAL", err)
    return zeroMetrics()
  }
}

/* -----------------------------
   Fail-safe default
----------------------------- */
function zeroMetrics(): DashboardMetrics {
  return {
    todayRevenue: 0,
    totalRevenue: 0,
    bestSellingProduct: null,
    failedPayments7d: 0,
    refundedAmount7d: 0,
  }
}