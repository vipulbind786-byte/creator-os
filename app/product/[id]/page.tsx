import Link from "next/link"
import { Button } from "@/components/ui/button"

// Placeholder data - would be fetched based on [id] in real app
const product = {
  id: "1",
  name: "Complete UI Kit",
  description: "A comprehensive collection of 200+ professionally designed UI components. Perfect for building modern web applications, SaaS dashboards, and landing pages. Includes Figma files, React components, and detailed documentation.",
  price: 49.00,
  creator: "John Doe",
}

export default function ProductSalesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-6">
          <span className="text-sm text-muted-foreground">
            Sold by{" "}
            <span className="font-medium text-foreground">{product.creator}</span>
          </span>
        </div>
      </header>

      {/* Product Content */}
      <main className="px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl bg-frosted-snow p-8 lg:p-10">
            {/* Product Title */}
            <h1 className="font-heading text-2xl font-bold text-card-foreground lg:text-3xl text-balance">
              {product.name}
            </h1>

            {/* Description */}
            <p className="mt-4 text-card-foreground/80 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="mt-8 border-t border-border/20 pt-6">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-medium text-evergreen">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
            </div>

            {/* Buy Button */}
            <Link href="/payment/success" className="block mt-6">
              <Button
                size="lg"
                className="w-full bg-evergreen text-lg text-primary-foreground hover:bg-evergreen/90"
              >
                Buy Now
              </Button>
            </Link>

            {/* Trust Text */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Secure payment processing
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-xs text-muted-foreground">
            Powered by Creator OS
          </p>
        </div>
      </footer>
    </div>
  )
}
