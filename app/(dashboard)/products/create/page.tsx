"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function CreateProductPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return // 🚫 HARD DOUBLE-CLICK BLOCK

    setLoading(true)

    try {
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          description: description.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Create failed")
      }

      toast.success("Product created")

      router.push("/products")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-muted-foreground"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to products
      </Link>

      <h1 className="text-2xl font-bold">Create Product</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-frosted-snow p-6"
      >
        <div className="space-y-2">
          <Label>Product name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Price (INR)</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating…" : "Create Product"}
        </Button>
      </form>
    </div>
  )
}