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
   Props (UI-only)
=============================== */
interface PaymentFailureCardProps {
  message: string            // already translated text
  retryLabel: string         // already translated text
  onRetry: () => void        // UI callback only
}

/* ===============================
   Component
=============================== */
export default function PaymentFailureCard({
  message,
  retryLabel,
  onRetry,
}: PaymentFailureCardProps) {
  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader className="flex flex-row items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <CardTitle className="text-destructive">
          Payment Issue
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {message}
        </p>

        <Button
          variant="destructive"
          className="w-full"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      </CardContent>
    </Card>
  )
}