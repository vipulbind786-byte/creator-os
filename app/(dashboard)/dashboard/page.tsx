import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// Placeholder data
const stats = {
  todayRevenue: 247.00,
  totalRevenue: 12847.50,
  bestSellingProduct: "Complete UI Kit",
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your revenue at a glance
          </p>
        </div>
        <Link href="/products/create">
          <Button className="bg-evergreen text-primary-foreground hover:bg-evergreen/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Today's Revenue */}
        <div className="rounded-xl bg-frosted-snow p-6">
          <p className="text-sm font-medium text-muted-foreground">
            {"Today's Revenue"}
          </p>
          <p className="mt-2 font-mono text-3xl font-medium text-evergreen">
            ${stats.todayRevenue.toFixed(2)}
          </p>
        </div>

        {/* Total Revenue */}
        <div className="rounded-xl bg-frosted-snow p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </p>
          <p className="mt-2 font-mono text-3xl font-medium text-evergreen">
            ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Best Selling Product */}
        <div className="rounded-xl bg-frosted-snow p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Best Selling Product
          </p>
          <p className="mt-2 text-lg font-semibold text-card-foreground">
            {stats.bestSellingProduct}
          </p>
        </div>
      </div>
    </div>
  )
}
