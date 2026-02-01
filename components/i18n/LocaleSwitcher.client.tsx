"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Locale } from "@/lib/i18n"

const SUPPORTED_LOCALES: {
  code: Locale
  label: string
}[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
]

export default function LocaleSwitcher() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function changeLocale(locale: Locale) {
    startTransition(async () => {
      await fetch("/api/i18n/set-locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      })

      // 🔥 Force SSR re-render with new locale
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {SUPPORTED_LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => changeLocale(l.code)}
          disabled={isPending}
          className="rounded px-2 py-1 hover:bg-muted disabled:opacity-50"
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}