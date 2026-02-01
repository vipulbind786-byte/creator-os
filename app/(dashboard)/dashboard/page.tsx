// 🔒 STEP-10: DASHBOARD — GUARDED & REVENUE SAFE
// UI = CONSUMER ONLY
// ❌ NO FEATURE LOGIC
// ❌ NO ADDON LOGIC
// ❌ NO PLAN LOGIC

import Link from "next/link"
import { Plus } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"

import { Button } from "@/components/ui/button"

/* ===============================
   i18n
=============================== */
import { detectLocale } from "@/lib/i18n/detectLocale"
import { loadDictionary } from "@/lib/i18n"
import { createTranslator } from "@/lib/i18n/runtime"
import { formatCurrency } from "@/lib/i18n/format"

/* ===============================
   Insights
=============================== */
import { runInsightPipeline } from "@/lib/insights/pipeline"
import { translateInsight } from "@/lib/insights/translateInsight"
import type { DashboardMetrics } from "@/types/insight"

import InsightStack from "@/components/insights/InsightStack.client"

/* ===============================
   Billing UI
=============================== */
import {
  BillingSummaryCard,
  type BillingPlan,
} from "@/components/billing/BillingSummaryCard"
import { SubscriptionStatusCard } from "@/components/billing/SubscriptionStatusCard"
import { PaymentFailureCard } from "@/components/billing/PaymentFailureCard"

/* ===============================
   Suggestions
=============================== */
import SuggestionBoxEntry from "@/components/suggestions/SuggestionBoxEntry.client"
import { SuggestionAccessNotice } from "@/components/suggestions/SuggestionAccessNotice"

/* ===============================
   Metrics
=============================== */
import { getDashboardMetrics } from "@/lib/metrics/getDashboardMetrics"

/* ===============================
   🔐 GUARD (ONLY AUTHORITY)
=============================== */
import { checkAccess } from "@/lib/billing/guard"
import {
  BILLING_PLANS,
  type BillingPlanId,
} from "@/lib/billing/types"

/* ===============================
   PLAN → UI ADAPTER
=============================== */
function mapPlanToUi(planId: BillingPlanId): BillingPlan {
  switch (planId) {
    case BILLING_PLANS.CREATOR_STARTER:
    case BILLING_PLANS.CREATOR_PRO:
    case BILLING_PLANS.CREATOR_BUSINESS:
      return "os_plus"
    default:
      return "free"
  }
}

export default async function DashboardPage() {
  /* -------------------------------
     Locale
  -------------------------------- */
  const locale = await detectLocale()
  const dict = loadDictionary(locale)
  const rawT = createTranslator(dict)
  const t = (k: string) => {
    try {
      return rawT(k as any)
    } catch {
      return k
    }
  }

  /* -------------------------------
     Auth
  -------------------------------- */
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  /* -------------------------------
     Metrics
  -------------------------------- */
  const metrics: DashboardMetrics =
    await getDashboardMetrics(user.id)

  /* -------------------------------
     Insight state
  -------------------------------- */
  const { data: insightStateRows } = await supabase
    .from("insight_state")
    .select("*")
    .eq("user_id", user.id)

  const visibleInsights = runInsightPipeline({
    metrics,
    insightStates: insightStateRows ?? [],
  }).map((i) => translateInsight(i, t))

  /* -------------------------------
     Plan (ENGINE)
  -------------------------------- */
  const { data: creatorPlan } = await supabase
    .from("creator_plan")
    .select("plan_id, status")
    .eq("user_id", user.id)
    .maybeSingle()

  const enginePlanId: BillingPlanId =
    (creatorPlan?.plan_id as BillingPlanId) ??
    BILLING_PLANS.FREE

  /* -------------------------------
     🔐 GUARD CALL (ONLY ONCE)
  -------------------------------- */
  const access = await checkAccess({
    userId: user.id,
    planId: enginePlanId,
  })

  const uiPlan = mapPlanToUi(enginePlanId)

  /* ===============================
     UI
  =============================== */
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <Link href="/products/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboard.create_product")}
          </Button>
        </Link>
      </div>

      {/* Billing */}
      <section className="grid md:grid-cols-3 gap-4">
        <SubscriptionStatusCard
          status={creatorPlan?.status ?? "free"}
        />
        <BillingSummaryCard plan={uiPlan} />
        {metrics.failedPayments7d > 0 && (
          <PaymentFailureCard
            reason="Payment issue detected"
            lastAttemptDate={new Date().toISOString()}
          />
        )}
      </section>

      {/* Insights */}
      <InsightStack insights={visibleInsights} />

      {/* Suggestions */}
      <SuggestionBoxEntry
        title={t("dashboard.create_product")}
        disabled={!access.canSeeAdvancedInsights}
        notice={
          !access.canSeeAdvancedInsights ? (
            <SuggestionAccessNotice
              allowed={false}
              reason="PLATFORM_LOCKED"
              requiredPaidUsers={1000}
            />
          ) : null
        }
      />

      {/* Metrics */}
      <section className="grid md:grid-cols-3 gap-4">
        <div>
          <p>{t("dashboard.metric.total_revenue")}</p>
          <p className="text-2xl font-mono">
            {formatCurrency(metrics.totalRevenue, locale)}
          </p>
        </div>

        <div>
          <p>{t("dashboard.metric.best_selling_product")}</p>
          <p>{metrics.bestSellingProduct ?? "—"}</p>
        </div>

        <div>
          <p>{t("dashboard.metric.product_limit")}</p>
          <p>{access.productLimit}</p>
        </div>
      </section>
    </div>
  )
}