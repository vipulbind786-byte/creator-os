// lib/cta/ui/i18n.ts

import type { TranslationKey } from "@/lib/i18n/keys"
import type { CTACopy } from "@/lib/cta/resolveCopy"
import type { RenderedCTACopy } from "./contract"
import type { TranslationResolver } from "./renderer"

/* ======================================================
   CTA i18n RENDERING RULES — NO NEW KEYS

   ✔ Defines HOW to resolve translation keys
   ✔ NO new translation keys (uses existing from PART 2)
   ✔ Fallback strategy for missing translations
   ✔ Pure transformation only

   🚫 NO new translation keys
   🚫 NO i18n library imports
   🚫 NO locale detection
   🚫 NO translation loading
====================================================== */

/* ===============================
   Translation Options
=============================== */

/**
 * Options for translation resolution
 */
export type TranslationOptions = {
  /**
   * Fallback text if translation missing
   * Optional - uses key as fallback if not provided
   */
  fallback?: string

  /**
   * Whether to log missing translations
   * Default: false
   */
  logMissing?: boolean

  /**
   * Context for logging
   */
  context?: string
}

/* ===============================
   Translation Resolver
=============================== */

/**
 * Resolve CTA copy with translation
 * 
 * Pure transformation:
 * - Takes copy keys from PART 2
 * - Resolves using provided translator
 * - Returns rendered copy
 * 
 * NO new keys, NO new logic.
 * 
 * @param copy - Copy keys from contract
 * @param translate - Translation resolver
 * @param options - Translation options
 * @returns Rendered copy
 */
export function resolveCTACopy(
  copy: CTACopy,
  translate: TranslationResolver,
  options?: TranslationOptions
): RenderedCTACopy {
  // Resolve label (required)
  const label = safeTranslate(
    copy.labelKey,
    translate,
    options?.fallback || copy.labelKey,
    options
  )

  // Resolve helper (optional)
  const helper = copy.helperKey
    ? safeTranslate(
        copy.helperKey,
        translate,
        options?.fallback,
        options
      )
    : undefined

  return {
    label,
    helper,
  }
}

/**
 * Safely resolve translation with fallback
 * 
 * Wraps translator with error handling.
 * Never throws - always returns string.
 * 
 * @param key - Translation key
 * @param translate - Translation resolver
 * @param fallback - Fallback text
 * @param options - Translation options
 * @returns Translated text or fallback
 */
function safeTranslate(
  key: TranslationKey,
  translate: TranslationResolver,
  fallback?: string,
  options?: TranslationOptions
): string {
  try {
    const translated = translate(key)

    // Check if translation is missing (some i18n libs return key)
    if (translated === key && options?.logMissing) {
      console.warn(`Missing translation for key: ${key}`, {
        context: options.context,
      })
    }

    return translated || fallback || key
  } catch (error) {
    // Translation failed - use fallback
    if (options?.logMissing) {
      console.error(`Translation error for key: ${key}`, error, {
        context: options.context,
      })
    }

    return fallback || key
  }
}

/* ===============================
   Translation Validation
=============================== */

/**
 * Validate that translation keys exist
 * 
 * Checks if keys are defined in translation system.
 * Does NOT validate actual translations.
 * 
 * @param copy - Copy keys to validate
 * @param translate - Translation resolver
 * @returns Validation result
 */
export function validateTranslationKeys(
  copy: CTACopy,
  translate: TranslationResolver
): {
  valid: boolean
  missingKeys: TranslationKey[]
} {
  const missingKeys: TranslationKey[] = []

  // Check label key
  try {
    const labelTranslation = translate(copy.labelKey)
    if (labelTranslation === copy.labelKey) {
      missingKeys.push(copy.labelKey)
    }
  } catch {
    missingKeys.push(copy.labelKey)
  }

  // Check helper key (if exists)
  if (copy.helperKey) {
    try {
      const helperTranslation = translate(copy.helperKey)
      if (helperTranslation === copy.helperKey) {
        missingKeys.push(copy.helperKey)
      }
    } catch {
      missingKeys.push(copy.helperKey)
    }
  }

  return {
    valid: missingKeys.length === 0,
    missingKeys,
  }
}

/* ===============================
   i18n Rendering Policy
=============================== */

/**
 * i18n rendering policy descriptor
 * 
 * Documents translation approach (read-only).
 * Does NOT execute logic.
 * For documentation only.
 */
export const I18N_RENDERING_POLICY = {
  /**
   * Translation keys source
   */
  keys_source: "Frozen from PART 2 (lib/cta/resolveCopy.ts)",

  /**
   * Available keys
   */
  available_keys: {
    upgrade: ["cta.upgrade.label", "cta.upgrade.helper"],
    pay_now: ["cta.pay_now.label", "cta.pay_now.helper"],
    fix_limit: ["cta.fix_limit.label", "cta.fix_limit.helper"],
    contact_support: ["cta.contact_support.label", "cta.contact_support.helper"],
    none: ["common.ok"],
  },

  /**
   * Fallback strategy
   */
  fallback: {
    missing_translation: "Use translation key as fallback",
    translation_error: "Use provided fallback or key",
    no_helper: "Helper is optional, can be undefined",
  },

  /**
   * What this module does
   */
  does: [
    "Resolves translation keys to strings",
    "Provides fallback for missing translations",
    "Validates translation keys exist",
  ],

  /**
   * What this module does NOT do
   */
  does_not: [
    "Add new translation keys",
    "Import i18n libraries",
    "Detect user locale",
    "Load translation files",
    "Make translation decisions",
  ],

  /**
   * UI requirements
   */
  ui_requirements: {
    translator: "UI must provide translation resolver function",
    locale: "UI must handle locale detection/switching",
    loading: "UI must handle translation loading",
  },
} as const
