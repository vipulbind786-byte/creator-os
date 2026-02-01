"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

/* ===============================
   Types (UI-only)
=============================== */
interface PaymentFailureNoticeProps {
  t: (key: string) => string
  onRetry?: () => void          // optional handler wired by parent
  messageKey?: string           // optional i18n key override
}

/* ===============================
   Component
=============================== */
export default function PaymentFailureNotice({
  t,
  onRetry,
  messageKey = "billing.payment_failed.message",
}: PaymentFailureNoticeProps) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader className="flex flex-row items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <CardTitle className="text-destructive">
          {t("billing.payment_failed.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t(messageKey)}
        </p>

        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={onRetry}
            disabled={!onRetry}
          >
            {t("billing.payment_failed.retry")}
          </Button>

          <Button variant="ghost" asChild>
            <a href="/billing">
              {t("billing.payment_failed.manage")}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}