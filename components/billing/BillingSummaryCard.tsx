// components/billing/BillingSummaryCard.tsx

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

/* ======================================================
   TYPES
====================================================== */

export type BillingPlan =
  | "free"
  | "pro"      // legacy compatibility
  | "os_plus"  // canonical paid plan

interface BillingSummaryCardProps {
  plan: BillingPlan
  amount?: number // monthly amount (display-only)
  currency?: string // default: INR
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

function formatAmount(
  amount?: number,
  currency: string = "INR"
): string {
  if (amount === undefined || amount === null) return "—"

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    // ultra-safe fallback
    return currency === "INR"
      ? `₹${amount}`
      : `${currency} ${amount}`
  }
}

/* ======================================================
   LABEL MAPS (NO JSX LOGIC)
====================================================== */

const PLAN_LABEL: Record<BillingPlan, string> = {
  free: "Free",
  pro: "OS+",     // normalized
  os_plus: "OS+", // canonical
}

/* ======================================================
   COMPONENT
====================================================== */

export function BillingSummaryCard({
  plan,
  amount,
  currency = "INR",
  renewalDate,
}: BillingSummaryCardProps) {
  const isFree = plan === "free"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Billing Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {/* Current Plan */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Current Plan
          </span>
          <span className="font-medium">
            {PLAN_LABEL[plan]}
          </span>
        </div>

        {/* Amount */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Amount
          </span>
          <span className="font-medium">
            {isFree
              ? "Free"
              : formatAmount(amount, currency)}
          </span>
        </div>

        {/* Renewal */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Renewal Date
          </span>
          <span className="font-medium">
            {isFree ? "—" : formatDate(renewalDate)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}