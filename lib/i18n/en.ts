import type { TranslationKey } from "./keys"

export const en: Record<TranslationKey, string> = {
  /* ---------- Common ---------- */
  "common.ok": "OK",
  "common.cancel": "Cancel",
  "common.close": "Close",

  /* ---------- Dashboard ---------- */
  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "Your revenue at a glance",
  "dashboard.create_product": "Create product",
  "dashboard.metric.failed_payments": "Failed payments (7 days)",

  /* ---------- Suggestions ---------- */
  "suggestions.title": "Suggestions",
  "suggestions.subtitle":
    "Share ideas, feedback, or feature requests",

  /* ---------- Dashboard Metrics ---------- */
  "dashboard.metric.today_revenue": "Today's Revenue",
  "dashboard.metric.total_revenue": "Total Revenue",
  "dashboard.metric.best_selling_product": "Best Selling Product",

  /* ---------- Orders ---------- */
  "orders.title": "Orders",
  "orders.subtitle": "View all your sales",
  "orders.empty": "No orders yet",

  /* ---------- Billing / Pricing (Transactions) ---------- */
  "billing.price": "Price",
  "billing.amount": "Amount",
  "billing.total": "Total",
  "billing.buyer": "Buyer",
  "billing.product": "Product",
  "billing.date": "Date",

  "billing.status.paid": "Paid",
  "billing.status.failed": "Failed",
  "billing.status.refunded": "Refunded",

  /* ---------- Pricing (Product Messaging) ---------- */
  "pricing.title": "Simple, Serious Pricing",
  "pricing.subtitle":
    "Built for long-term creators, not trial-and-error users.",

  "pricing.plan.free.title": "Free",
  "pricing.plan.free.description": "Explore the system safely",

  "pricing.plan.pro.title": "OS+",
  "pricing.plan.pro.description":
    "For serious builders & long-term users",

  "pricing.price.free": "₹0",
  "pricing.price.per_month": "/ month",

  "pricing.badge.most_popular": "Power Users",

  "pricing.cta.current": "Current Plan",
  "pricing.cta.upgrade": "Upgrade to OS+",

  /* ---------- Insights ---------- */
  "insight.failed_payments.title": "Payment failures detected",
  "insight.failed_payments.body":
    "Some payments have failed recently.",

  "insight.refunds.title": "Refunds issued",
  "insight.refunds.body":
    "Refunds were issued in the last few days.",

  "insight.zero_revenue.title": "No revenue yet",
  "insight.zero_revenue.body":
    "No revenue has been recorded recently.",

  "insight.high_refund_rate.title": "High refund rate detected",
  "insight.high_refund_rate.body":
    "A significant portion of your revenue has been refunded.",

  "insight.strong_performance.title": "Exceptional performance today",
  "insight.strong_performance.body":
    "Today's revenue represents a strong share of total earnings.",

  "insight.no_best_seller.title": "No clear best seller yet",
  "insight.no_best_seller.body":
    "Sales are spread across products.",

  /* ---------- Explain Drawer ---------- */
  "explain.title": "Why am I seeing this?",
  "explain.loading": "Loading…",
  "explain.error": "Could not load explanation.",
  "explain.insight": "Insight",
  "explain.triggered_by": "Triggered by",
  "explain.current_value": "Current value",
  "explain.previous_value": "Previous value",
  "explain.status": "Status",
  "explain.why_now": "Why now?",
  "explain.suggestion": "Suggestion",

  /* ---------- CTA (Call-to-Action) ---------- */
  "cta.upgrade.label": "Upgrade Now",
  "cta.upgrade.helper": "Unlock this feature with a paid plan",

  "cta.pay_now.label": "Update Payment",
  "cta.pay_now.helper": "Your payment method needs attention",

  "cta.fix_limit.label": "Increase Limit",
  "cta.fix_limit.helper": "You've reached your usage limit",

  "cta.contact_support.label": "Contact Support",
  "cta.contact_support.helper": "We're here to help",
}