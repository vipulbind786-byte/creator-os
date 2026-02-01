// lib/suggestions/addonAdapter.ts
// 🔒 STEP-11: ADD-ON ADAPTER — BILLING ➜ SUGGESTIONS
// SINGLE RESPONSIBILITY • PURE • FUTURE-SAFE
// ❌ NO DB
// ❌ NO UI
// ❌ NO BUSINESS LOGIC

import type { BillingAddOn } from "@/lib/billing/types"
import type { SuggestionAddOn } from "@/lib/suggestions/types"

/* ======================================================
   ADAPTER MAP (LOCKED)
   BillingAddOn  ➜  SuggestionAddOn
====================================================== */

const ADDON_ADAPTER_MAP: Record<
  BillingAddOn,
  SuggestionAddOn | null
> = {
  dashboard_customization: "custom_dashboard_request",
}

/* ======================================================
   ADAPTER FUNCTION
====================================================== */

/**
 * Converts billing add-ons into
 * suggestion-compatible add-ons.
 *
 * ❌ Unknown add-ons are dropped
 * ❌ No inference
 * ❌ No defaults
 */
export function mapBillingAddonsToSuggestionAddons(
  addons: BillingAddOn[]
): SuggestionAddOn[] {
  return addons
    .map((addon) => ADDON_ADAPTER_MAP[addon])
    .filter(
      (a): a is SuggestionAddOn =>
        Boolean(a)
    )
}