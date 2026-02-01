// app/pricing/page.tsx
// 🔒 P4 — PRICING UI (SAFE, READ-ONLY, PRODUCTION-GRADE)

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/* ===============================
   i18n (SERVER)
=============================== */
import { detectLocale } from "@/lib/i18n/detectLocale"
import { loadDictionary } from "@/lib/i18n"
import { createTranslator } from "@/lib/i18n/runtime"
import { formatCurrency } from "@/lib/i18n/format"

/* ===============================
   Billing (READ-ONLY CONTRACTS)
=============================== */
import { ALL_BILLING_PLANS } from "@/lib/billing/plans"
import {
  BILLING_PLANS,
  type BillingPlan,
} from "@/lib/billing/types"

/* ======================================================
   PRICING PAGE — UI ONLY (LOCK SAFE)
====================================================== */

export default async function PricingPage() {
  const locale = await detectLocale()
  const dictionary = loadDictionary(locale)
  const t = createTranslator(dictionary)

  /* -------------------------------
     UI helpers (PURE)
  -------------------------------- */
  function getMonthlyPrice(plan: BillingPlan) {
    return plan.prices.find(
      (p) => p.interval === "monthly"
    )
  }

  function isPopularPlan(planId: string) {
    return planId === BILLING_PLANS.CREATOR_PRO
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold mb-3">
          {t("pricing.title")}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {ALL_BILLING_PLANS.map((plan) => {
          const monthly = getMonthlyPrice(plan)
          const featureKeys = plan.features
            ? Object.keys(plan.features)
            : []

          return (
            <Card
              key={plan.id}
              className={
                isPopularPlan(plan.id)
                  ? "border-primary relative"
                  : undefined
              }
            >
              {isPopularPlan(plan.id) && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {t("pricing.badge.most_popular")}
                </Badge>
              )}

              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                {plan.description && (
                  <CardDescription>
                    {plan.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                {/* Price */}
                <p className="text-4xl font-bold mb-4">
                  {monthly
                    ? formatCurrency(
                        monthly.amount / 100,
                        locale
                      )
                    : t("pricing.price.free")}
                  {monthly && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      {t("pricing.price.per_month")}
                    </span>
                  )}
                </p>

                {/* Features (display-only) */}
                {featureKeys.length > 0 && (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {featureKeys.map((key) => (
                      <li key={key}>
                        • {key.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={
                    plan.id === BILLING_PLANS.FREE
                      ? "outline"
                      : "default"
                  }
                  disabled={plan.id === BILLING_PLANS.FREE}
                >
                  {plan.id === BILLING_PLANS.FREE
                    ? t("pricing.cta.current")
                    : t("pricing.cta.upgrade")}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}