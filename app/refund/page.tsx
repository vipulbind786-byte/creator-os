import { AlertCircle, ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-xl p-8 sm:p-10 shadow-sm">
          {/* Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950/30 mb-6">
              <AlertCircle className="h-8 w-8 text-slate-600 dark:text-slate-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Refund Processed
            </h1>
            <p className="mt-3 text-foreground/90">
              Your refund has been initiated successfully.
            </p>
          </div>

          {/* Refund Information */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-foreground mb-3">
              What happens next:
            </h2>
            <ul className="space-y-2">
              {[
                "Your access to the product has been revoked",
                "Refund will be credited to your original payment method",
                "Processing time: 5-7 business days",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Refund Policy */}
          <div className="bg-secondary/50 rounded-lg p-5 mb-8">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Our Refund Policy
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once a refund is processed, access to the product is automatically revoked.
              The refund amount will be credited to your original payment method within 5-7 business days.
            </p>
          </div>

          {/* Reassurance */}
          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you don&apos;t see the refund in your account after 7 business days,
              please contact support with your payment ID.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/support">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact support
              </Link>
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              All refunds are processed securely through Razorpay.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
