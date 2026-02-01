"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Product = {
  id: string
  name: string
  price: number
  description: string | null
  status: "active" | "scheduled" | "archived" | "draft"
}

export default function EditProductPage({
  params,
}: {
  params: { productId: string }
}) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${params.productId}`)
        if (!res.ok) throw new Error("Failed to load product")
        const data = await res.json()
        setProduct(data)
      } catch (e) {
        setError((e as Error).message)
      }
    }

    loadProduct()
  }, [params.productId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!product || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/products/${product.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          description: product.description,
          status: product.status,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || "Update failed")
      }

      router.push("/products")
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (!product) {
    return <p>Loading…</p>
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>

      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          value={product.name}
          onChange={(e) =>
            setProduct({ ...product, name: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Price (INR)</Label>
        <Input
          type="number"
          min="0"
          value={product.price}
          onChange={(e) =>
            setProduct({ ...product, price: Number(e.target.value) })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={4}
          value={product.description ?? ""}
          onChange={(e) =>
            setProduct({ ...product, description: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <select
          className="w-full rounded-md border bg-background p-2"
          value={product.status}
          onChange={(e) =>
            setProduct({
              ...product,
              status: e.target.value as Product["status"],
            })
          }
        >
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  )
}