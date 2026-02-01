// /lib/billing/currencyPolicy.ts

/* ======================================================
   CURRENCY POLICY — P4 STEP 5 (LOCKED)

   ✔ Multi-currency ready
   ✔ Stripe-safe
   ✔ Tax-policy compatible
   ✔ Deterministic
   ✔ Auditable

   ❌ No DB
   ❌ No Stripe SDK
   ❌ No UI
====================================================== */

import type { BillingInterval } from "./types"

/* ===============================
   SUPPORTED CURRENCIES
=============================== */

export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"   // future
  | "GBP"   // future

/* ===============================
   CURRENCY META
=============================== */

export type CurrencyMeta = {
  code: CurrencyCode
  symbol: string
  minorUnit: number     // decimals (INR = 2, JPY = 0 etc.)
  stripeSupported: boolean
}

/* ===============================
   REGISTRY — SOURCE OF TRUTH
=============================== */

export const CURRENCY_REGISTRY: Record<
  CurrencyCode,
  CurrencyMeta
> = {
  INR: {
    code: "INR",
    symbol: "₹",
    minorUnit: 2,
    stripeSupported: true,
  },

  USD: {
    code: "USD",
    symbol: "$",
    minorUnit: 2,
    stripeSupported: true,
  },

  EUR: {
    code: "EUR",
    symbol: "€",
    minorUnit: 2,
    stripeSupported: true,
  },

  GBP: {
    code: "GBP",
    symbol: "£",
    minorUnit: 2,
    stripeSupported: true,
  },
}

/* ===============================
   DEFAULT CURRENCY
=============================== */

export const DEFAULT_CURRENCY: CurrencyCode =
  "INR"

/* ===============================
   PRICE CONVERSION POLICY
=============================== */

/**
 * NOTE:
 * - We DO NOT convert prices dynamically yet
 * - Stripe price objects define canonical amounts
 * - This layer exists to future-proof FX logic
 */

export type CurrencyConversionResult = {
  originalAmount: number
  convertedAmount: number
  currency: CurrencyCode
  fxRate: number
}

/* ===============================
   CORE — CONVERSION (NO-OP FOR NOW)
=============================== */

/**
 * Converts an amount from base currency to target currency.
 *
 * CURRENT BEHAVIOR:
 * - INR is canonical
 * - No FX conversion applied
 *
 * FUTURE:
 * - Plug FX rates here
 * - Add rounding per currency minor unit
 */
export function convertCurrency(params: {
  amount: number              // base amount (paise)
  from: CurrencyCode
  to: CurrencyCode
  interval: BillingInterval
}): CurrencyConversionResult {
  const { amount, from, to } = params

  // Guard
  if (amount <= 0) {
    return {
      originalAmount: 0,
      convertedAmount: 0,
      currency: to,
      fxRate: 1,
    }
  }

  // 🔒 NO-OP conversion (intentional)
  if (from === to) {
    return {
      originalAmount: amount,
      convertedAmount: amount,
      currency: to,
      fxRate: 1,
    }
  }

  /**
   * FUTURE FX:
   * - Fetch FX rate
   * - Apply rounding based on minorUnit
   */
  return {
    originalAmount: amount,
    convertedAmount: amount,
    currency: to,
    fxRate: 1,
  }
}

/* ===============================
   HELPERS
=============================== */

export function isCurrencySupported(
  currency: CurrencyCode
): boolean {
  return Boolean(CURRENCY_REGISTRY[currency])
}

export function getCurrencyMeta(
  currency: CurrencyCode
): CurrencyMeta {
  return (
    CURRENCY_REGISTRY[currency] ??
    CURRENCY_REGISTRY[DEFAULT_CURRENCY]
  )
}

/* ======================================================
   🔐 HARD RULES (DO NOT BREAK)
====================================================== */
/**
 * 1. Prices are canonical in Stripe
 * 2. FX conversion lives ONLY here
 * 3. UI must NEVER assume symbol/decimals
 * 4. Tax policy runs BEFORE currency formatting
 * 5. This file unlocks global billing later
 */