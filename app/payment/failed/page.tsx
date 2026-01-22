import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="rounded-xl bg-frosted-snow p-8">
          {/* Failed Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive-foreground" />
          </div>

          {/* Message */}
          <h1 className="mt-6 font-heading text-2xl font-bold text-card-foreground">
            Payment Failed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong with your payment.
          </p>

          {/* Action */}
          <Link href="/product/1" className="mt-8 block">
            <Button
              className="w-full bg-evergreen text-primary-foreground hover:bg-evergreen/90"
            >
              Try Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
