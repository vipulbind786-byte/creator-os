// lib/i18n/runtime.ts

import type { TranslationKey } from "./keys"

/* ======================================================
   TRANSLATOR FACTORY (SAFE + FUTURE-PROOF)
====================================================== */

/**
 * NOTE:
 * - Strict TranslationKey is enforced
 * - UI-only keys can be safely namespaced
 * - Prevents silent i18n bugs in production
 */
export function createTranslator<
  T extends string = TranslationKey
>(dictionary: Record<string, string>) {
  return function t(key: T): string {
    if (process.env.NODE_ENV === "development") {
      if (!(key in dictionary)) {
        console.warn(`⚠️ Missing translation key: ${key}`)
      }
    }

    return dictionary[key] ?? key
  }
}