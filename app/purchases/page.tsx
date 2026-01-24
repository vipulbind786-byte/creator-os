import { ArrowRight, ExternalLink, HelpCircle, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

type OrderStatus = "active" | "processing" | "failed" | "refunded"

interface Order {
  id: string
  productTitle: string
  status: OrderStatus
  purchasedOn: string
  paymentId: string
  amount: string
}

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  active: { label: "Paid", variant: "default" },
  processing: { label: "Pending", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "outline" },
}

function OrderCard({ order }: { order: Order }) {
  const status = statusConfig[order.status]

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            {order.productTitle}
          </h3>
          <Badge
            variant={status.variant}
            className={
              order.status === "active"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                : order.status === "processing"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                  : ""
            }
          >
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
        <p>Purchased on: {order.purchasedOn}</p>
        <p>Payment ID: {order.paymentId}</p>
        <p>Amount paid: {order.amount}</p>
      </div>

      {/* Status-specific content */}
      {order.status === "active" && (
        <>
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
            <p className="text-sm text-emerald-800 dark:text-emerald-400">
              Access Active
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button asChild size="sm">
              <Link href="/dashboard">
                Access Product
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Receipt className="mr-2 h-4 w-4" />
              View Receipt
            </Button>
          </div>
        </>
      )}

      {order.status === "processing" && (
        <>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              Your payment is being processed. This usually takes a few moments.
            </p>
          </div>
          <div className="mt-5">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <HelpCircle className="mr-2 h-4 w-4" />
              Get help
            </Button>
          </div>
        </>
      )}

      {order.status === "failed" && (
        <>
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-400">
              Payment didn&apos;t go through
            </p>
            <p className="text-sm text-red-700 dark:text-red-500 mt-1">
              No money was deducted from your account.
              <br />
              You can retry the payment safely.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button asChild size="sm">
              <Link href="/checkout">
                Retry payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <HelpCircle className="mr-2 h-4 w-4" />
              Get help
            </Button>
          </div>
        </>
      )}

      {order.status === "refunded" && (
        <>
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Access Revoked (Refunded)
            </p>
          </div>
          <div className="mt-5">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Receipt className="mr-2 h-4 w-4" />
              View Receipt
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
      <h2 className="text-xl font-medium text-foreground">
        You haven&apos;t purchased anything yet.
      </h2>
      <p className="mt-3 text-muted-foreground">
        When you do, your access will appear here instantly.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">
          Browse Products
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

async function fetchUserPurchases(): Promise<Order[]> {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: purchases, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      razorpay_payment_id,
      created_at,
      amount,
      products (name),
      entitlements (status)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !purchases) {
    return []
  }

  return purchases.map((purchase: any) => {
    const orderStatus = purchase.status
    const entitlementStatus = purchase.entitlements?.[0]?.status
    const productName = purchase.products?.name || "Unknown Product"

    let uiStatus: OrderStatus = "processing"

    if (entitlementStatus === "revoked") {
      uiStatus = "refunded"
    } else if (orderStatus === "paid" && entitlementStatus === "active") {
      uiStatus = "active"
    } else if (orderStatus === "created") {
      uiStatus = "processing"
    } else if (orderStatus === "failed") {
      uiStatus = "failed"
    }

    const createdDate = new Date(purchase.created_at)
    const formattedDate = createdDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

    return {
      id: purchase.id,
      productTitle: productName,
      status: uiStatus,
      purchasedOn: formattedDate,
      paymentId: purchase.razorpay_payment_id || "N/A",
      amount: `₹${Math.floor(purchase.amount / 100)}`,
    }
  })
}

export default async function PurchasesPage() {
  const orders = await fetchUserPurchases()
  const hasOrders = orders.length > 0

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            My Purchases
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            All your purchases and access live here.
          </p>
        </div>

        {/* Orders List or Empty State */}
        {hasOrders ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Trust & Safety Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Payments are securely processed via Razorpay.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>If a payment fails, no money is deducted.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>Refunded purchases automatically lose access.</span>
            </li>
          </ul>

          {/* Support Micro-copy */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-foreground">Need help with access?</p>
            <Link 
              href="/support" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact support — a real human will help you.
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
