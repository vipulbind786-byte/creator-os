"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PurchaseConfirmationProps {
  isOpen?: boolean
  onClose?: () => void
}

export function PurchaseConfirmation({ 
  isOpen: controlledIsOpen, 
  onClose 
}: PurchaseConfirmationProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? true)

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen)
    }
  }, [controlledIsOpen])

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-lg w-full max-w-md p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/30 mb-4">
            <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Access confirmed
          </h2>
        </div>

        {/* Body */}
        <p className="text-center text-foreground/90 mb-6">
          Your payment was successful and your access is active.
        </p>

        {/* CTAs */}
        <div className="space-y-3 mb-6">
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard">
              Go to my content
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/purchases">
              View my purchases
            </Link>
          </Button>
        </div>

        {/* Small Note */}
        <div className="text-center">
          <Link 
            href="/support" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Need help? Contact support anytime.
          </Link>
        </div>
      </div>
    </div>
  )
}
