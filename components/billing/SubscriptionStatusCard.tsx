// components/billing/SubscriptionStatusCard.tsx

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/* ======================================================
   TYPES
====================================================== */

export type SubscriptionStatus =
  | "free"
  | "trial"
  | "pro"
  | "payment_failed"
  | "expired"
  | "cancelled"

interface SubscriptionStatusCardProps {
  status: SubscriptionStatus 
  renewalDate?: string // ISO string (display-only)
}

/* ======================================================
   HELPERS (PURE / DEFENSIVE)
====================================================== */

function formatDate(date?: string): string {
  if (!date) return "—"
  const d = new Date(date)
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
}

/* ======================================================
   CONFIG MAPS (NO JSX LOGIC)
====================================================== */

const LABEL_MAP: Record<SubscriptionStatus, string> = {
  free: "Free Plan",
  trial: "Trial Active",
  pro: "OS+ Active",
  payment_failed: "Payment Issue",
  expired: "Expired",
  cancelled: "Cancelled",
}

const BADGE_VARIANT_MAP: Record<
  SubscriptionStatus,
  "secondary" | "default" | "destructive"
> = {
  free: "secondary",
  trial: "secondary",
  pro: "default",
  payment_failed: "destructive",
  expired: "destructive",
  cancelled: "destructive",
}

const DESCRIPTION_MAP: Record<SubscriptionStatus, string> = {
  free:
    "You are currently on the free plan with limited access.",
  trial:
    "Your trial is active. Upgrade to OS+ to avoid interruption.",
  pro:
    "Your OS+ subscription is active and running normally.",
  payment_failed:
    "We were unable to process your most recent payment.",
  expired:
    "Your subscription has expired and access may be limited.",
  cancelled:
    "Your subscription has been cancelled and will not renew.",
}

/* ======================================================
   COMPONENT
====================================================== */

export function SubscriptionStatusCard({
  status,
  renewalDate,
}: SubscriptionStatusCardProps) {
  const showRenewalDate =
    status === "pro" || status === "trial"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          Subscription Status
        </CardTitle>

        <Badge variant={BADGE_VARIANT_MAP[status]}>
          {LABEL_MAP[status]}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{DESCRIPTION_MAP[status]}</p>

        {showRenewalDate && (
          <p>
            Renewal Date:{" "}
            <span className="font-medium text-foreground">
              {formatDate(renewalDate)}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}