import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Link2, DollarSign } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-heading text-xl font-bold text-foreground">Creator OS</span>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-evergreen text-primary-foreground hover:bg-evergreen/90">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Sell digital products. Get paid. Simple.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed text-pretty">
            Creator OS helps you launch products and collect payments in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full bg-evergreen text-primary-foreground hover:bg-evergreen/90 sm:w-auto">
                Start Selling
              </Button>
            </Link>
            <Link href="/product/demo">
              <Button size="lg" variant="outline" className="w-full border-border text-foreground hover:bg-secondary sm:w-auto bg-transparent">
                View Demo Product
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Blocks */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-frosted-snow p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-evergreen">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-card-foreground">
              Create product in minutes
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Add your product details and set your price. No complicated setup required.
            </p>
          </div>

          <div className="rounded-xl bg-frosted-snow p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-evergreen">
              <Link2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-card-foreground">
              Share one link
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Get a clean, professional sales page. Share it anywhere your audience is.
            </p>
          </div>

          <div className="rounded-xl bg-frosted-snow p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-evergreen">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-card-foreground">
              Get paid directly
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Payments go straight to you. Fast, secure, and with full transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm text-muted-foreground">
            Creator OS
          </p>
        </div>
      </footer>
    </div>
  )
}
