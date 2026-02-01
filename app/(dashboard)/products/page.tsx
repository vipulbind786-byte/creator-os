"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  price: number
  status: "draft" | "scheduled" | "active" | "paused" | "archived"
  publish_at: string | null
}

/* 🔥 HARD FIX: products default = [] */
export default function ProductsPage({
  products = [],
}: {
  products?: Product[]
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function onDelete(productId: string) {
    if (busyId) return
    const ok = confirm("Delete this product? This can be undone later.")
    if (!ok) return

    setBusyId(productId)

    try {
      const res = await fetch("/api/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Delete failed")

      toast.success("Product archived")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || "Delete failed")
    } finally {
      setBusyId(null)
    }
  }

  async function onSchedule(productId: string) {
    if (busyId) return
    const input = prompt("Publish date & time (YYYY-MM-DD HH:mm)")
    if (!input) return

    const iso = new Date(input).toISOString()

    setBusyId(productId)

    try {
      const res = await fetch("/api/products/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, publishAt: iso }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Schedule failed")

      toast.success("Product scheduled")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || "Schedule failed")
    } finally {
      setBusyId(null)
    }
  }

  function statusBadge(status: Product["status"]) {
    switch (status) {
      case "active":
        return <Badge>Active</Badge>
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>
      case "archived":
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="secondary">Draft</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <Link href="/products/create">
          <Button>Create Product</Button>
        </Link>
      </div>

      {/* 🔥 SAFE: always array now */}
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="font-medium">{p.name}</div>

                <div className="flex items-center gap-2">
                  {statusBadge(p.status)}

                  {p.publish_at && (
                    <span className="text-xs text-muted-foreground">
                      Publishes {new Date(p.publish_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {p.status !== "archived" && (
                  <>
                    <Link href={`/product/${p.id}`}>
                      <Button size="sm" variant="outline" disabled={busyId === p.id}>
                        Edit
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSchedule(p.id)}
                      disabled={busyId === p.id}
                    >
                      Schedule
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(p.id)}
                      disabled={busyId === p.id}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}