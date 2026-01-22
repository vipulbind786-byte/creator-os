import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="rounded-xl bg-frosted-snow p-8">
          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-evergreen/10">
            <CheckCircle2 className="h-8 w-8 text-evergreen" />
          </div>

          {/* Message */}
          <h1 className="mt-6 font-heading text-2xl font-bold text-card-foreground">
            Payment Successful
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {"You'll receive access shortly."}
          </p>

          {/* Action */}
          <Link href="/" className="mt-8 block">
            <Button
              variant="outline"
              className="w-full border-border text-card-foreground hover:bg-card/50 bg-transparent"
            >
              Go back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
