import { HelpCircle, ArrowLeft, MessageCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AccessIssuePage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-xl p-8 sm:p-10 shadow-sm">
          {/* Icon & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/30 mb-6">
              <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Having trouble accessing?
            </h1>
            <p className="mt-3 text-muted-foreground">
              Let&apos;s help you get back on track.
            </p>
          </div>

          {/* Common Issues */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-foreground mb-4">
              Common reasons for access issues:
            </h2>
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Payment still processing
                </h3>
                <p className="text-sm text-muted-foreground">
                  If you just completed payment, it may take a few minutes for access to activate.
                  Try refreshing your purchases page.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Payment failed
                </h3>
                <p className="text-sm text-muted-foreground">
                  If the payment didn&apos;t go through, no access will be granted.
                  Check your purchases page for payment status.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Refund processed
                </h3>
                <p className="text-sm text-muted-foreground">
                  If you requested a refund, access is automatically revoked.
                  You can repurchase anytime.
                </p>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Wrong account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Make sure you&apos;re logged in with the same account you used for purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Quick troubleshooting:
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>1. Check your purchases page for payment status</li>
              <li>2. Wait a few minutes if payment was just completed</li>
              <li>3. Verify you&apos;re using the correct account</li>
              <li>4. Contact support if issue persists</li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3 mb-8">
            <Button asChild size="lg" className="w-full">
              <Link href="/purchases">
                <RefreshCw className="mr-2 h-4 w-4" />
                Check My Purchases
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/support">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact support
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Support Note */}
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Still having issues? Our support team is here to help.
              We typically respond within a few hours.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
