// lib/i18n/format.ts

/* ======================================================
   NUMBER & CURRENCY FORMATTER (PURE)
   ✔ Locale aware
   ✔ Currency safe
   ✔ No UI / No DB
====================================================== */

const LOCALE_CURRENCY_MAP: Record<
  string,
  { locale: string; currency: string }
> = {
  en: { locale: "en-IN", currency: "INR" },
  hi: { locale: "hi-IN", currency: "INR" },

  // 🔮 future ready
  "en-US": { locale: "en-US", currency: "USD" },
  "en-EU": { locale: "de-DE", currency: "EUR" },
}

export function formatCurrency(
  amount: number,
  userLocale: string
): string {
  const config =
    LOCALE_CURRENCY_MAP[userLocale] ??
    LOCALE_CURRENCY_MAP["en"]

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(
  value: number,
  userLocale: string
): string {
  const config =
    LOCALE_CURRENCY_MAP[userLocale] ??
    LOCALE_CURRENCY_MAP["en"]

  return new Intl.NumberFormat(config.locale).format(
    value
  )
}