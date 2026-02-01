"use client"

import { Badge } from "@/components/ui/badge"

/* ===============================
   Types (UI-only)
=============================== */
export type SubscriptionStatus =
  | "free"
  | "pro"
  | "expired"
  | "trial"
  | "past_due"

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus
  t: (key: string) => string
}

/* ===============================
   Mappings (UI-only)
=============================== */
const STATUS_MAP: Record<
  SubscriptionStatus,
  {
    labelKey: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
> = {
  free: {
    labelKey: "billing.plan.free",
    variant: "secondary",
  },
  pro: {
    labelKey: "billing.plan.pro",
    variant: "default",
  },
  trial: {
    labelKey: "billing.plan.trial",
    variant: "outline",
  },
  expired: {
    labelKey: "billing.plan.expired",
    variant: "destructive",
  },
  past_due: {
    labelKey: "billing.plan.past_due",
    variant: "destructive",
  },
}

/* ===============================
   Component
=============================== */
export default function SubscriptionStatusBadge({
  status,
  t,
}: SubscriptionStatusBadgeProps) {
  const cfg = STATUS_MAP[status]

  return (
    <Badge variant={cfg.variant}>
      {t(cfg.labelKey)}
    </Badge>
  )
}