// /components/suggestions/SuggestionAccessNotice.tsx

"use client"

/* ======================================================
   Suggestion Access Notice (UI ONLY)

   ✔ Presentational only
   ✔ No logic
   ✔ No API
   ✔ No billing checks
====================================================== */

type SuggestionAccessNoticeProps = {
  allowed: boolean
  reason?: 
    | "PLAN_NOT_ALLOWED"
    | "PLATFORM_LOCKED"
    | "ADDON_REQUIRED"
    | "UNKNOWN_SUGGESTION_TYPE"
  requiredPaidUsers?: number
  requiredAddOn?: string
}

export function SuggestionAccessNotice(
  props: SuggestionAccessNoticeProps
) {
  const {
    allowed,
    reason,
    requiredPaidUsers,
    requiredAddOn,
  } = props

  if (allowed) return null

  return (
    <div className="rounded-md border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
      {reason === "PLATFORM_LOCKED" && (
        <p>
          Suggestions will unlock once{" "}
          <strong>{requiredPaidUsers}</strong> paid users
          join the platform.
        </p>
      )}

      {reason === "PLAN_NOT_ALLOWED" && (
        <p>
          This suggestion type is available for paid users
          only.
        </p>
      )}

      {reason === "ADDON_REQUIRED" && (
        <p>
          This suggestion requires the add-on:{" "}
          <strong>{requiredAddOn}</strong>
        </p>
      )}

      {reason === "UNKNOWN_SUGGESTION_TYPE" && (
        <p>
          This suggestion type is currently unavailable.
        </p>
      )}
    </div>
  )
}