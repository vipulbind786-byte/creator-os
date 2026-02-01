// /lib/billing/pricingPolicy.ts

/* ======================================================
   PRICING + GST POLICY — P4 STEP 2 (LOCKED)

   ✔ Pure domain logic
   ✔ India-ready (GST)
   ✔ Stripe-agnostic
   ✔ UI-agnostic
   ✔ Deterministic
   ✔ Auditable

   ❌ No DB
   ❌ No Stripe SDK
   ❌ No plan mutation
====================================================== */

/* ===============================
   POLICY CONSTANTS (LOCKED)
=============================== */

/**
 * India GST rate (services)
 * Change ONLY via product decision.
 */
export const GST_RATE = 0.18 as const

/**
 * Countries where GST applies.
 * (future: expand to VAT regions)
 */
export const GST_COUNTRIES = ["IN"] as const

export type CountryCode = (typeof GST_COUNTRIES)[number] | string

/* ===============================
   INPUT SHAPES
=============================== */

export type PricingContext = {
  amount: number            // base amount (minor units, e.g. paise)
  currency: "INR"
  country: CountryCode
}

/* ===============================
   OUTPUT SHAPE
=============================== */

export type PriceBreakdown = {
  baseAmount: number        // before tax
  taxAmount: number         // GST/VAT/etc
  totalAmount: number       // base + tax
  taxRate: number           // e.g. 0.18
  taxLabel: string          // e.g. "GST"
  taxApplied: boolean
}

/* ===============================
   HELPERS (PURE)
=============================== */

function isGSTApplicable(country: CountryCode): boolean {
  return GST_COUNTRIES.includes(country as any)
}

function round(amount: number): number {
  return Math.round(amount)
}

/* ===============================
   CORE — PRICE CALCULATION
=============================== */

/**
 * Compute final price with tax.
 *
 * CONTRACT:
 * - Input amount MUST be base price (pre-tax)
 * - Amounts are expected in MINOR units
 * - Output is safe for UI + invoices
 */
export function computePriceWithTax(
  ctx: PricingContext
): PriceBreakdown {
  const { amount, country } = ctx

  if (amount <= 0) {
    return {
      baseAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      taxRate: 0,
      taxLabel: "N/A",
      taxApplied: false,
    }
  }

  if (!isGSTApplicable(country)) {
    return {
      baseAmount: amount,
      taxAmount: 0,
      totalAmount: amount,
      taxRate: 0,
      taxLabel: "N/A",
      taxApplied: false,
    }
  }

  const taxAmount = round(amount * GST_RATE)
  const totalAmount = amount + taxAmount

  return {
    baseAmount: amount,
    taxAmount,
    totalAmount,
    taxRate: GST_RATE,
    taxLabel: "GST",
    taxApplied: true,
  }
}

/* ===============================
   INVOICE DISPLAY HELPERS
=============================== */

/**
 * Human-readable tax line for invoices / receipts.
 */
export function getTaxLineLabel(
  breakdown: PriceBreakdown
): string {
  if (!breakdown.taxApplied) return "No tax"
  return `${breakdown.taxLabel} @ ${Math.round(
    breakdown.taxRate * 100
  )}%`
}

/* ======================================================
   🔐 HARD RULES (DO NOT BREAK)
====================================================== */
/**
 * 1. Base prices in plans.ts are PRE-TAX
 * 2. Stripe prices MUST match baseAmount
 * 3. Tax is computed at display / invoice layer
 * 4. Never bake GST into plan prices
 * 5. Never guess country — pass explicitly
 */