// app/p/[productId]/page.tsx
// 🔒 OP-14½: PUBLIC BUYER PRODUCT PAGE — FINAL
// READ-ONLY • TIME-AWARE • SAFE VISIBILITY
// ZERO AUTH • ZERO EDIT • ZERO LEAK

import { notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type PublicProduct = {
  id: string
  name: string
  price: number
  description: string | null
  status: "active" | "scheduled"
  publish_at: string | null
}

export default async function PublicProductPage({
  params,
}: {
  params: { productId: string }
}) {
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

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price, description, status, publish_at")
    .eq("id", params.productId)
    .in("status", ["active", "scheduled"])
    .maybeSingle<PublicProduct>()

  // ❌ Product missing
  if (!product) {
    notFound()
  }

  // ⏳ Scheduled but not yet live
  if (
    product.status === "scheduled" &&
    (!product.publish_at ||
      new Date(product.publish_at).getTime() > Date.now())
  ) {
    notFound()
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-bold text-foreground">
        {product.name}
      </h1>

      {product.description && (
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <span className="text-2xl font-semibold text-foreground">
          ₹{product.price}
        </span>

        <Link href={`/payment/start?productId=${product.id}`}>
          <Button size="lg">
            Buy Now
          </Button>
        </Link>
      </div>
    </main>
  )
}