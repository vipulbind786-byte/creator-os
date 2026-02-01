// app/payment/success/page.tsx
// 🔒 PHASE-B FINAL HARD LOCK
// ENTITLEMENT = ONLY TRUTH
// ❌ NEVER trust order
// ❌ NEVER trust redirect
// ❌ NEVER trust client
// ✅ webhook grants entitlement

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Props = {
  searchParams: {
    order_id?: string
  }
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const orderId = searchParams.order_id

  /* -----------------------------
     HARD BLOCK
  ----------------------------- */
  if (!orderId) redirect("/payment/failed")

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  /* -----------------------------
     AUTH (REQUIRED)
  ----------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  /* =====================================================
     🔐 AUTHORITATIVE CHECK
     ENTITLEMENT ONLY (user-bound)
  ===================================================== */
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("order_id")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  /* -----------------------------
     Webhook still processing
     → auto refresh
  ----------------------------- */
  if (!entitlement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <meta httpEquiv="refresh" content="3" />
        <p className="text-muted-foreground">
          Verifying payment… please wait
        </p>
      </div>
    )
  }

  /* -----------------------------
     Fetch order only for display
  ----------------------------- */
  const { data: order } = await supabase
    .from("orders")
    .select("amount")
    .eq("id", orderId)
    .maybeSingle()

  /* -----------------------------
     SUCCESS
  ----------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-xl border p-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />

        <h1 className="mt-4 text-2xl font-bold">
          Payment Successful 🎉
        </h1>

        <p className="mt-2 text-muted-foreground">
          Your access has been unlocked securely.
        </p>

        {order && (
          <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
            ₹{order.amount / 100} paid
          </div>
        )}

        <Button asChild className="mt-6 w-full">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}