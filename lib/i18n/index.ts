import type { TranslationKey } from "./keys"
import { en } from "./en"
import { hi } from "./hi"

/* ======================================================
   LOCALES
====================================================== */

export type Locale = "en" | "hi"
export const DEFAULT_LOCALE: Locale = "en"

/* ======================================================
   DICTIONARY REGISTRY (LOCKED)
====================================================== */

export const DICTIONARIES: Record<
  Locale,
  Record<TranslationKey, string>
> = {
  en,
  hi,
}

/* ======================================================
   LOADER
====================================================== */

export function loadDictionary(
  locale: Locale
): Record<TranslationKey, string> {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]
}