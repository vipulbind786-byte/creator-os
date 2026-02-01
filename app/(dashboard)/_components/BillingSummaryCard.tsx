"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import SubscriptionStatusBadge, {
  SubscriptionStatus,
} from "./SubscriptionStatusBadge"

/* ===============================
   Props (UI-only)
=============================== */
interface BillingSummaryCardProps {
  planName: string
  status: SubscriptionStatus
  renewalDateLabel: string | null // already formatted text, or null
  t: (key: string) => string
}

/* ===============================
   Component
=============================== */
export default function BillingSummaryCard({
  planName,
  status,
  renewalDateLabel,
  t,
}: BillingSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("billing.summary.title")}</CardTitle>
        <SubscriptionStatusBadge status={status} t={t} />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t("billing.summary.plan")}
          </span>
          <span className="font-medium">{planName}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t("billing.summary.renewal")}
          </span>
          <span className="font-medium">
            {renewalDateLabel ?? "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}