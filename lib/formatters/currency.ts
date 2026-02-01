/* ======================================================
   CURRENCY FORMATTER (SINGLE SOURCE OF TRUTH)
   ✔ Locale-aware
   ✔ Server + Client safe
====================================================== */

export function formatCurrency(
  value: number,
  locale: string = "en-IN",
  currency: string = "INR"
): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—"
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}