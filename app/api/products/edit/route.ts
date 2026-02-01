// app/api/products/edit/route.ts
// 🔒 OP-5: PRODUCT EDIT SURGERY — FINAL, FULL REPLACEMENT
// ZERO SILENT SUCCESS • STRICT OWNERSHIP • STATUS-AWARE • AUDIT-SAFE

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { writeAuditLog } from "@/lib/audit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// 🔁 Align with UI contract (PATCH)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const {
      productId,
      name,
      price,
      description,
      status,
    }: {
      productId?: string
      name?: string
      price?: number
      description?: string | null
      status?: "active" | "scheduled" | "archived" | "draft"
    } = body

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      )
    }

    // -----------------------------
    // Input validation (strict)
    // -----------------------------
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Invalid product name" },
          { status: 400 }
        )
      }
    }

    if (price !== undefined) {
      if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: "Invalid price" },
          { status: 400 }
        )
      }
    }

    if (status !== undefined) {
      const allowed = ["active", "scheduled", "archived", "draft"]
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        )
      }
    }

    // -----------------------------
    // Auth (SERVER)
    // -----------------------------
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
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // -----------------------------
    // Build update payload
    // -----------------------------
    const updates: Record<string, any> = {}

    if (name !== undefined) updates.name = name.trim()
    if (price !== undefined) updates.price = price
    if (description !== undefined)
      updates.description = description || null
    if (status !== undefined) updates.status = status

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      )
    }

    // Touch timestamp for consistency
    updates.updated_at = new Date().toISOString()

    // -----------------------------
    // Update with STRICT ownership
    // + prevent archived mutation
    // -----------------------------
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .eq("creator_id", user.id)
      .neq("status", "archived")
      .select("id")
      .maybeSingle()

    // ❌ Hard fail if nothing updated
    if (!data) {
      return NextResponse.json(
        { error: "Product not found or not editable" },
        { status: 404 }
      )
    }

    if (error) {
      // UNIQUE constraint (name collision)
      if ((error as any).code === "23505") {
        return NextResponse.json(
          { error: "Product with this name already exists" },
          { status: 409 }
        )
      }

      console.error("PRODUCT_EDIT_ERROR", error)
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      )
    }

    // -----------------------------
    // Audit trail (best-effort)
    // -----------------------------
    await writeAuditLog({
      event_type: "product.updated",
      entity_type: "product",
      entity_id: productId,
      actor_type: "user",
      actor_id: user.id,
      context: {
        fields_updated: Object.keys(updates),
      },
    })

    return NextResponse.json({
      success: true,
      updated: true,
    })
  } catch (err) {
    console.error("PRODUCT_EDIT_FATAL", err)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}