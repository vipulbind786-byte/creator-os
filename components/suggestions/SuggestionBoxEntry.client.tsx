"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ReactNode } from "react"

/* ======================================================
   PROPS (UI CONTRACT — 🔒 LOCKED)
====================================================== */

export type SuggestionBoxEntryProps = {
  title: string
  description?: string
  placeholder?: string
  disabled?: boolean
  notice?: ReactNode
  onSubmit?: () => void
}

/* ======================================================
   COMPONENT (UI ONLY — PRODUCTION SAFE)
   ✔ No API
   ✔ No fetch
   ✔ No access logic
   ✔ No side effects
   ✔ SSR / CSR safe
====================================================== */

export default function SuggestionBoxEntry({
  title,
  description,
  placeholder,
  disabled = false,
  notice,
  onSubmit,
}: SuggestionBoxEntryProps) {
  return (
    <section
      className="rounded-xl border bg-background p-6 space-y-4"
      aria-disabled={disabled}
      data-disabled={disabled ? "true" : "false"}
    >
      {/* Header */}
      <header>
        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </header>

      {/* Optional notice (upgrade / info / access msg) */}
      {notice && (
        <div
          className="rounded-md border bg-muted/40 p-3 text-sm"
          role="note"
        >
          {notice}
        </div>
      )}

      {/* Input */}
      <Textarea
        placeholder={placeholder}
        disabled={disabled}
        rows={4}
        aria-disabled={disabled}
      />

      {/* Action */}
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={disabled}
          onClick={onSubmit ?? (() => {})}
        >
          Submit
        </Button>
      </div>
    </section>
  )
}