import { Clock, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-xl p-8 sm:p-10 shadow-sm">
          {/* Pending Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/30 mb-6">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Payment status pending
            </h1>
          </div>

          {/* Primary Message */}
          <div className="text-center mb-8">
            <p className="text-foreground/90 leading-relaxed">
              We&apos;re checking the payment status.
            </p>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              This usually resolves automatically within a few minutes.
            </p>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-8">
            <p className="text-sm text-foreground/90 leading-relaxed">
              Please do not retry immediately to avoid confusion.
            </p>
          </div>

          {/* CTA */}
          <div className="mb-8">
            <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
              <Link href="/support">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact support
              </Link>
            </Button>
          </div>

          {/* Reassurance */}
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              If the payment was successful, your access will be granted automatically.
              If it failed, no money will be deducted.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
