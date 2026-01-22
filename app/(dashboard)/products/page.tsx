import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, ExternalLink } from "lucide-react"

// Placeholder data
const products = [
  { id: "1", name: "Complete UI Kit", price: 49.00, status: "Active" },
  { id: "2", name: "Icon Pack Pro", price: 29.00, status: "Active" },
  { id: "3", name: "Landing Page Templates", price: 79.00, status: "Active" },
  { id: "4", name: "Design System Guide", price: 39.00, status: "Active" },
]

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your digital products
          </p>
        </div>
        <Link href="/products/create">
          <Button className="bg-evergreen text-primary-foreground hover:bg-evergreen/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      <div className="rounded-xl bg-frosted-snow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border/10 last:border-0">
                  <td className="px-6 py-4">
                    <span className="font-medium text-card-foreground">{product.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-card-foreground">
                      ${product.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-evergreen/10 px-2.5 py-0.5 text-xs font-medium text-evergreen">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/product/${product.id}`}>
                      <Button variant="ghost" size="sm" className="text-card-foreground hover:text-evergreen">
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        View Sales Page
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
