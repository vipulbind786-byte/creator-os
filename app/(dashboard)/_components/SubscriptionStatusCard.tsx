"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/* ===============================
   Types (UI-only, no logic)
=============================== */
export type SubscriptionStatus = "free" | "pro" | "expired"

interface SubscriptionStatusCardProps {
  status: SubscriptionStatus
  planName?: string
  renewalDateLabel?: string // already formatted string
  t: (key: string) => string
}

/* ===============================
   Helpers (pure UI mapping)
=============================== */
function getStatusUI(status: SubscriptionStatus) {
  switch (status) {
    case "pro":
      return {
        badge: "success",
        label: "subscription.status.pro",
      }
    case "expired":
      return {
        badge: "destructive",
        label: "subscription.status.expired",
      }
    case "free":
    default:
      return {
        badge: "secondary",
        label: "subscription.status.free",
      }
  }
}

/* ===============================
   Component
=============================== */
export default function SubscriptionStatusCard({
  status,
  planName,
  renewalDateLabel,
  t,
}: SubscriptionStatusCardProps) {
  const ui = getStatusUI(status)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {t("subscription.title")}
        </CardTitle>

        <Badge variant={ui.badge as any}>
          {t(ui.label)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {t("subscription.plan")}
        </div>

        <div className="text-xl font-semibold">
          {planName ?? "—"}
        </div>

        {renewalDateLabel && (
          <p className="text-sm text-muted-foreground">
            {t("subscription.renews_on")}{" "}
            <span className="font-medium">
              {renewalDateLabel}
            </span>
          </p>
        )}

        {status !== "pro" && (
          <Link href="/pricing">
            <Button className="mt-4 w-full">
              {t("subscription.upgrade_cta")}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}