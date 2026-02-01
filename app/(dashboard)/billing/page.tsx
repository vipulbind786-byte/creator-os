import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"

/* ===============================
   i18n (SERVER)
=============================== */
import { detectLocale } from "@/lib/i18n/detectLocale"
import { loadDictionary } from "@/lib/i18n"
import { createTranslator } from "@/lib/i18n/runtime"
import { formatDate } from "@/lib/formatters/date"

/* ===============================
   Billing UI (READ-ONLY)
=============================== */
import { SubscriptionStatusCard } from "@/components/billing/SubscriptionStatusCard"
import { BillingSummaryCard } from "@/components/billing/BillingSummaryCard"
import { PaymentFailureCard } from "@/components/billing/PaymentFailureCard"

/* ======================================================
   BILLING PAGE (UI ONLY — LOCK SAFE)
====================================================== */

export default async function BillingPage() {
  /* -------------------------------
     Locale + Translator
  -------------------------------- */
  const locale = await detectLocale()
  const dictionary = loadDictionary(locale)
  const t = createTranslator(dictionary)

  /* -------------------------------
     Supabase (AUTH ONLY)
  -------------------------------- */
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

  if (!user) redirect("/login")

  /* -------------------------------
     Subscription (READ ONLY)
  -------------------------------- */
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(
      "plan_id, status, current_period_end, created_at"
    )
    .eq("user_id", user.id)
    .single()

  const isPaymentFailed =
    subscription?.status === "past_due"

  const renewalDate =
    subscription?.current_period_end
      ? formatDate(
          subscription.current_period_end,
          locale
        )
      : undefined

  const lastAttemptDate =
    subscription?.created_at
      ? formatDate(
          subscription.created_at,
          locale
        )
      : undefined

  /* -------------------------------
     UI
  -------------------------------- */
  return (
    <div className="space-y-10 px-1 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold lg:text-3xl">
          {t("dashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Subscription Status */}
      <section className="grid gap-4 md:grid-cols-3">
        <SubscriptionStatusCard
          status={subscription?.status ?? "free"}
          renewalDate={renewalDate}
        />

        <BillingSummaryCard
          plan={subscription?.plan_id ?? "free"}
          amount={0}
          currency="INR"
          renewalDate={renewalDate}
        />

        {isPaymentFailed && (
          <PaymentFailureCard
            reason={t("dashboard.subtitle")}
            lastAttemptDate={lastAttemptDate}
          />
        )}
      </section>

      {/* Info Notice */}
      <section className="rounded-xl border bg-muted/40 p-6">
        <p className="text-sm font-medium">
          {t("dashboard.title")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </section>
    </div>
  )
}