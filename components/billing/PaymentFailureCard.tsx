// components/billing/PaymentFailureCard.tsx

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

/* ======================================================
   TYPES
====================================================== */

interface PaymentFailureCardProps {
  reason?: string // sanitized, display-only
  lastAttemptDate?: string // ISO string (display-only)
}

/* ======================================================
   HELPERS (PURE / DEFENSIVE)
====================================================== */

function formatDate(date?: string): string {
  if (!date) return "—"
  const d = new Date(date)
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
}

function normalizeReason(reason?: string): string {
  if (!reason) return "Payment could not be completed"

  // prevent leaking gateway / internal errors
  if (reason.length > 80) {
    return "Payment failed due to a processing issue"
  }

  return reason
}

/* ======================================================
   COMPONENT
====================================================== */

export function PaymentFailureCard({
  reason,
  lastAttemptDate,
}: PaymentFailureCardProps) {
  return (
    <Card className="border border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-base text-destructive">
          Payment Issue Detected
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          We were unable to process your most recent payment.
        </p>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Reason
          </span>
          <span className="font-medium text-right">
            {normalizeReason(reason)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Last Attempt
          </span>
          <span className="font-medium">
            {formatDate(lastAttemptDate)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          No action was taken automatically. You can retry the
          payment or update your billing details at any time.
        </p>
      </CardContent>
    </Card>
  )
}