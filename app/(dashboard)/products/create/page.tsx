import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

export default function CreateProductPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/products" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to products
        </Link>
        <h1 className="mt-4 font-heading text-2xl font-bold text-foreground lg:text-3xl">
          Create Product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new digital product to sell
        </p>
      </div>

      {/* Form */}
      <div className="max-w-xl">
        <div className="rounded-xl bg-frosted-snow p-6 lg:p-8">
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">
                Product name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Complete UI Kit"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed on your sales page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-card-foreground">
                Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="border-border bg-background pl-7 font-mono text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-card-foreground">
                Short description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what buyers will get..."
                rows={4}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Keep it brief and compelling
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-evergreen text-primary-foreground hover:bg-evergreen/90"
            >
              Create Product
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
