import type { Insight } from "@/types/insight"
import type { TranslationKey } from "@/lib/i18n/keys"
import { formatCurrency } from "@/lib/formatters/currency"

/* ======================================================
   INSIGHT TRANSLATION + PRESENTATION
   🔒 No business logic change
   🔒 Compile-time contract hardened
====================================================== */

type TranslatorFn = (key: TranslationKey) => string

function insightTitleKey(id: Insight["id"]): TranslationKey {
  return `insight.${id}.title` as TranslationKey
}

function insightBodyKey(id: Insight["id"]): TranslationKey {
  return `insight.${id}.body` as TranslationKey
}

export function translateInsight(
  insight: Insight,
  t: TranslatorFn,
  locale: string = "en-IN"
): Insight {
  const title = t(insightTitleKey(insight.id))
  let body = t(insightBodyKey(insight.id))

  /* ----------------------------------
     💰 Currency-aware replacement
     SAFE, OPTIONAL, NON-DESTRUCTIVE
  ---------------------------------- */
  if (
    insight.id === "refunds" ||
    insight.id === "high_refund_rate"
  ) {
    const amountMatch = body.match(/₹?\d+(?:\.\d+)?/)
    if (amountMatch) {
      const amount = Number(
        amountMatch[0].replace(/[₹,]/g, "")
      )

      if (!Number.isNaN(amount)) {
        body = body.replace(
          amountMatch[0],
          formatCurrency(amount, locale)
        )
      }
    }
  }

  return {
    ...insight,
    title,
    body,
  }
}