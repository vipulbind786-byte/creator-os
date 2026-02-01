// lib/cta/resolveCopy.ts

import type { CTAIntent } from "@/types/cta"
import type { TranslationKey } from "@/lib/i18n/keys"

/* ======================================================
   CTA COPY RESOLVER — PURE FUNCTION

   ✔ No raw strings
   ✔ Only TranslationKey references
   ✔ One-to-one mapping
   ✔ No fallback logic (UI handles missing keys)

   🚫 NO UI logic
   🚫 NO conditional rendering
====================================================== */

/* ===============================
   CTA Copy Contract
=============================== */

/**
 * CTA copy keys for UI rendering
 * 
 * - labelKey: Main button/link text
 * - helperKey: Optional helper/description text
 */
export type CTACopy = {
  /**
   * Translation key for the main CTA label
   */
  labelKey: TranslationKey

  /**
   * Translation key for helper text (optional)
   */
  helperKey?: TranslationKey
}

/* ===============================
   Copy Resolver
=============================== */

/**
 * Map CTAIntent to translation keys
 * 
 * One-to-one mapping with NO fallback logic.
 * UI is responsible for handling missing translations.
 * 
 * @param intent - The CTA intent to resolve
 * @returns CTACopy with translation keys
 * 
 * @example
 * resolveCTACopy("UPGRADE")
 * // { labelKey: "cta.upgrade.label", helperKey: "cta.upgrade.helper" }
 * 
 * @example
 * resolveCTACopy("NONE")
 * // { labelKey: "common.ok" }
 */
export function resolveCTACopy(intent: CTAIntent): CTACopy {
  switch (intent) {
    case "UPGRADE":
      return {
        labelKey: "cta.upgrade.label",
        helperKey: "cta.upgrade.helper",
      }

    case "PAY_NOW":
      return {
        labelKey: "cta.pay_now.label",
        helperKey: "cta.pay_now.helper",
      }

    case "FIX_LIMIT":
      return {
        labelKey: "cta.fix_limit.label",
        helperKey: "cta.fix_limit.helper",
      }

    case "CONTACT_SUPPORT":
      return {
        labelKey: "cta.contact_support.label",
        helperKey: "cta.contact_support.helper",
      }

    case "NONE":
      // No CTA needed, but provide a neutral key for edge cases
      return {
        labelKey: "common.ok",
      }

    default:
      // Exhaustive type check - TypeScript will error if new intent added
      const _exhaustive: never = intent
      return _exhaustive
  }
}
