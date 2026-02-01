// lib/i18n/detectLocale.ts

import { cookies, headers } from "next/headers"
import { DEFAULT_LOCALE, type Locale } from "./index"

/* ======================================================
   SUPPORTED LOCALES (LOCKED)
====================================================== */

export const SUPPORTED_LOCALES: readonly Locale[] = [
  "en",
  "hi",
] as const

/* ======================================================
   HEADER PARSER
====================================================== */

function detectFromHeader(
  acceptLanguage: string | null
): Locale | null {
  if (!acceptLanguage) return null

  const parts = acceptLanguage
    .split(",")
    .map((p) => p.split(";")[0].trim().toLowerCase())

  for (const part of parts) {
    const base = part.split("-")[0] as Locale
    if (SUPPORTED_LOCALES.includes(base)) {
      return base
    }
  }

  return null
}

/* ======================================================
   MAIN DETECTOR (SERVER ONLY)
====================================================== */

export async function detectLocale(): Promise<Locale> {
  // 1️⃣ Cookie (explicit user choice)
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")?.value

  if (
    cookieLocale &&
    SUPPORTED_LOCALES.includes(cookieLocale as Locale)
  ) {
    return cookieLocale as Locale
  }

  // 2️⃣ Browser header
  const headerStore = await headers()
  const acceptLanguage =
    headerStore.get("accept-language")

  const headerLocale =
    detectFromHeader(acceptLanguage)

  if (headerLocale) return headerLocale

  // 3️⃣ Fallback
  return DEFAULT_LOCALE
}