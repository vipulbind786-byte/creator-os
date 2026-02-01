// ⚠️ DO NOT ADD KEYS HERE WITHOUT UPDATING en.ts AND hi.ts

/* ======================================================
   CANONICAL TRANSLATION KEYS
   ❗ Single source of truth
====================================================== */

export const TRANSLATION_KEYS = {
  /* ---------- Common ---------- */
  "common.ok": true,
  "common.cancel": true,
  "common.close": true,

  /* ---------- Dashboard ---------- */
  "dashboard.title": true,
  "dashboard.subtitle": true,
  "dashboard.create_product": true,

/* ---------- Suggestions ---------- */
  "suggestions.title": true,
  "suggestions.subtitle": true,


  /* ---------- Dashboard Metrics ---------- */
  "dashboard.metric.today_revenue": true,
  "dashboard.metric.total_revenue": true,
  "dashboard.metric.best_selling_product": true,
  "dashboard.metric.failed_payments": true,
  // Orders
  "orders.title": true,
  "orders.subtitle": true,
  "orders.empty": true,

  /* ---------- Billing / Pricing (Transactions) ---------- */
  "billing.price": true,
  "billing.amount": true,
  "billing.total": true,
  "billing.buyer": true,
  "billing.product": true,
  "billing.date": true,

  "billing.status.paid": true,
  "billing.status.failed": true,
  "billing.status.refunded": true,

  /* ---------- Pricing (Product Messaging) ---------- */
  "pricing.title": true,
  "pricing.subtitle": true,

  "pricing.plan.free.title": true,
  "pricing.plan.free.description": true,

  "pricing.plan.pro.title": true,
  "pricing.plan.pro.description": true,

  "pricing.price.free": true,
  "pricing.price.per_month": true,

  "pricing.badge.most_popular": true,

  "pricing.cta.current": true,
  "pricing.cta.upgrade": true,

  /* ---------- Insights ---------- */
  "insight.failed_payments.title": true,
  "insight.failed_payments.body": true,

  "insight.refunds.title": true,
  "insight.refunds.body": true,

  "insight.zero_revenue.title": true,
  "insight.zero_revenue.body": true,

  "insight.high_refund_rate.title": true,
  "insight.high_refund_rate.body": true,

  "insight.strong_performance.title": true,
  "insight.strong_performance.body": true,

  "insight.no_best_seller.title": true,
  "insight.no_best_seller.body": true,

  /* ---------- Explain Drawer ---------- */
  "explain.title": true,
  "explain.loading": true,
  "explain.error": true,
  "explain.insight": true,
  "explain.triggered_by": true,
  "explain.current_value": true,
  "explain.previous_value": true,
  "explain.status": true,
  "explain.why_now": true,
  "explain.suggestion": true,

  /* ---------- CTA (Call-to-Action) ---------- */
  "cta.upgrade.label": true,
  "cta.upgrade.helper": true,

  "cta.pay_now.label": true,
  "cta.pay_now.helper": true,

  "cta.fix_limit.label": true,
  "cta.fix_limit.helper": true,

  "cta.contact_support.label": true,
  "cta.contact_support.helper": true,
} as const

/* ======================================================
   TYPE
====================================================== */

export type TranslationKey = keyof typeof TRANSLATION_KEYS