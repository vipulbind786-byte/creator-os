// /lib/billing/taxPolicy.ts

/* ======================================================
   TAX / GST POLICY — P4 STEP 4 (LOCKED)

   ✔ India-ready (GST)
   ✔ Stripe-agnostic
   ✔ Deterministic
   ✔ Auditable
   ✔ Future multi-country safe

   ❌ No DB
   ❌ No Stripe SDK
   ❌ No UI
====================================================== */

import type { BillingPlanId } from "./types"

/* ===============================
   TAX REGION
=============================== */

export type TaxRegion =
  | "IN"        // India
  | "ROW"       // Rest of World (future)

/* ===============================
   TAX RESULT
=============================== */

export type TaxComputation = {
  taxableAmount: number        // base amount (paise)
  taxAmount: number            // GST amount (paise)
  totalAmount: number          // final payable (paise)
  taxRate: number              // percentage (e.g. 18)
  taxLabel: string             // display label
}

/* ===============================
   GST CONFIG (INDIA)
   🔒 Single source of truth
=============================== */

const INDIA_GST_RATE = 18 // %

/* ===============================
   HELPERS (PURE)
=============================== */

function round(amount: number): number {
  return Math.round(amount)
}

/* ===============================
   CORE — TAX COMPUTATION
=============================== */

/**
 * Compute tax for a billing amount.
 *
 * CONTRACT:
 * - amount is ALWAYS base price (without tax)
 * - returns paise-safe integers
 */
export function computeTax(params: {
  amount: number               // base amount (paise)
  region: TaxRegion
  planId: BillingPlanId
}): TaxComputation {
  const { amount, region } = params

  // Defensive guard
  if (amount <= 0) {
    return {
      taxableAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      taxRate: 0,
      taxLabel: "No tax",
    }
  }

  /* ===============================
     INDIA — GST
  =============================== */
  if (region === "IN") {
    const taxAmount = round(
      (amount * INDIA_GST_RATE) / 100
    )

    return {
      taxableAmount: amount,
      taxAmount,
      totalAmount: amount + taxAmount,
      taxRate: INDIA_GST_RATE,
      taxLabel: "GST (18%)",
    }
  }

  /* ===============================
     ROW — NO TAX (FOR NOW)
  =============================== */
  return {
    taxableAmount: amount,
    taxAmount: 0,
    totalAmount: amount,
    taxRate: 0,
    taxLabel: "No tax",
  }
}

/* ======================================================
   🔐 HARD RULES (DO NOT BREAK)
====================================================== */
/**
 * 1. UI must NEVER compute tax
 * 2. Stripe checkout must use returned totals
 * 3. Tax logic lives ONLY here
 * 4. Future VAT/GST added via region switch
 * 5. This file is legally auditable
 */