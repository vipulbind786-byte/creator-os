// app/api/i18n/set-locale/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SUPPORTED_LOCALES } from "@/lib/i18n/detectLocale"
import type { Locale } from "@/lib/i18n"

export async function POST(req: Request) {
  try {
    const { locale } = (await req.json()) as {
      locale?: Locale
    }

    if (
      !locale ||
      !SUPPORTED_LOCALES.includes(locale)
    ) {
      return NextResponse.json(
        { error: "invalid_locale" },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    cookieStore.set("locale", locale, {
      path: "/",
      httpOnly: false, // client JS needs it
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("🔥 set-locale failed", err)
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    )
  }
}