import { AlertCircle, ArrowRight, CreditCard, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentFailedPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-xl p-8 sm:p-10 shadow-sm">
          {/* Warning Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-6">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Payment not completed
            </h1>
            <p className="mt-3 text-foreground/90">
              Your payment didn&apos;t go through. No money has been deducted.
            </p>
          </div>

          {/* Failure Explanation */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-3">This can happen due to:</p>
            <ul className="space-y-2">
              {[
                "Bank or UPI app issues",
                "Network interruption",
                "Payment app timeout",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              Nothing is wrong on your side.
            </p>
          </div>

          {/* Safety Confirmation - Core Trust */}
          <div className="bg-secondary/50 rounded-lg p-5 mb-8">
            <p className="text-sm text-foreground leading-relaxed">
              If the payment fails, your money stays with you.
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              We do not charge unless the payment is successful.
            </p>
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="space-y-3 mb-8">
            <Button asChild size="lg" className="w-full">
              <Link href="/">
                Try payment again
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">
                <CreditCard className="mr-2 h-4 w-4" />
                Choose a different payment method
              </Link>
            </Button>
          </div>

          {/* Calm Reassurance Block */}
          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>You can retry safely.</li>
              <li>No duplicate charges.</li>
              <li>No access will be granted unless payment succeeds.</li>
            </ul>
          </div>

          {/* Support Escape Hatch */}
          <div className="border-t border-border pt-8">
            <p className="text-sm text-foreground mb-2">
              Still facing issues?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Contact support and we&apos;ll help you manually.
            </p>
            <Button asChild variant="ghost" size="sm" className="px-0 hover:bg-transparent">
              <Link href="/support" className="text-foreground">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
