/* ======================================================
   DATE / TIME FORMATTER
   🔒 UI-only
   🔒 Locale aware
====================================================== */

export function formatDate(
  date: Date | string,
  locale: string = "en-IN",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(d)
}

export function formatDateTime(
  date: Date | string,
  locale: string = "en-IN"
): string {
  const d = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}