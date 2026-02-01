import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import type { DashboardMetrics, Insight } from "@/types/insight"
import type { InsightId } from "@/lib/insights/ids"
import { explainInsight, type ExplainContext } from "@/lib/insights/explain"

/* ======================================================
   METRICS LOADER (STRICT + TYPED)
====================================================== */

async function loadDashboardMetrics(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<DashboardMetrics> {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    todayPaidOrders,
    allPaidOrders,
    paidOrdersForBestProduct,
    failedOrders7d,
    refundedOrders7d,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("amount")
      .eq("creator_id", userId)
      .eq("status", "paid")
      .gte("created_at", startOfToday.toISOString()),

    supabase
      .from("orders")
      .select("amount")
      .eq("creator_id", userId)
      .eq("status", "paid"),

    supabase
      .from("orders")
      .select("product_id, products(name)")
      .eq("creator_id", userId)
      .eq("status", "paid"),

    supabase
      .from("orders")
      .select("id")
      .eq("creator_id", userId)
      .eq("status", "failed")
      .gte("created_at", sevenDaysAgo.toISOString()),

    supabase
      .from("orders")
      .select("amount, entitlements(status)")
      .eq("creator_id", userId)
      .eq("status", "paid")
      .gte("created_at", sevenDaysAgo.toISOString()),
  ])

  const todayRevenue =
    todayPaidOrders.data?.reduce(
      (sum: number, r: { amount: number }) =>
        sum + (Number(r.amount) || 0) / 100,
      0
    ) ?? 0

  const totalRevenue =
    allPaidOrders.data?.reduce(
      (sum: number, r: { amount: number }) =>
        sum + (Number(r.amount) || 0) / 100,
      0
    ) ?? 0

  const productCount: Record<string, { name: string; count: number }> = {}

  paidOrdersForBestProduct.data?.forEach(
    (row: { product_id: string; products?: { name?: string } }) => {
      if (!row.product_id || !row.products?.name) return
      productCount[row.product_id] ??= {
        name: row.products.name,
        count: 0,
      }
      productCount[row.product_id].count++
    }
  )

  const bestSellingProduct =
    Object.values(productCount).sort((a, b) => b.count - a.count)[0]?.name ??
    null

  const failedPayments7d = failedOrders7d.data?.length ?? 0

  const refundedAmount7d =
    refundedOrders7d.data?.reduce(
      (
        sum: number,
        r: { amount: number; entitlements?: { status?: string } }
      ) =>
        r.entitlements?.status === "revoked"
          ? sum + (Number(r.amount) || 0) / 100
          : sum,
      0
    ) ?? 0

  return {
    todayRevenue,
    totalRevenue,
    bestSellingProduct,
    failedPayments7d,
    refundedAmount7d,
  }
}

/* ======================================================
   EXPLAIN CONTEXT MAP (LOCKED)
====================================================== */

const EXPLAIN_CONTEXT_BY_ID: Record<InsightId, ExplainContext> = {
  failed_payments: {
    rule_id: "failed_payments",
    metric_key: "failedPayments7d",
    threshold: 3,
    comparison: ">=",
  },
  refunds: {
    rule_id: "refunds",
    metric_key: "refundedAmount7d",
    threshold: 0,
    comparison: ">",
  },
  zero_revenue: {
    rule_id: "zero_revenue",
    metric_key: "totalRevenue",
    threshold: 0,
    comparison: "==",
  },
  high_refund_rate: {
    rule_id: "high_refund_rate",
    metric_key: "refundedAmount7d",
    threshold: 0.2,
    comparison: ">=",
  },
  strong_performance: {
    rule_id: "strong_performance",
    metric_key: "todayRevenue",
    threshold: 0.1,
    comparison: ">=",
  },
  no_best_seller: {
    rule_id: "no_best_seller",
    metric_key: "bestSellingProduct",
    threshold: 0,
    comparison: "==",
  },
  revenue_today: {
    rule_id: "revenue_today",
    metric_key: "todayRevenue",
    threshold: 0,
    comparison: ">",
  },
}

/* ======================================================
   GET — EXPLAIN INSIGHT
====================================================== */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const insightId = searchParams.get("insightId")

    if (!insightId) {
      return NextResponse.json(
        { error: "insightId required" },
        { status: 400 }
      )
    }

    const context = EXPLAIN_CONTEXT_BY_ID[insightId as InsightId]
    if (!context) {
      return NextResponse.json(
        { error: "no_explain_context" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      )
    }

    const metrics = await loadDashboardMetrics(supabase, user.id)

    const { data: stateRow } = await supabase
      .from("insight_state")
      .select("*")
      .eq("user_id", user.id)
      .eq("insight_id", insightId)
      .maybeSingle()

    /* ✅ DUMMY INSIGHT — BUT TYPE SAFE */
    const insight: Insight = {
      id: insightId as InsightId,
      kind: "info",
      title: "",
      body: "",
      priority: 0,
      meta: {
        ruleName: context.rule_id,
        metricKey: context.metric_key,
      },
    }

    const explanation = explainInsight({
      insight,
      metrics,
      state: stateRow ?? null,
      context,
    })

    return NextResponse.json(explanation)
  } catch (err) {
    console.error("🔥 explain insight failed", err)
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    )
  }
}