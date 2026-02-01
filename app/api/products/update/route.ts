/* ======================================================
   🔒 PHASE-2 HARD LOCK
   PRODUCT UPDATE — AUTHORITATIVE

   ✔ server auth only
   ✔ rate limited
   ✔ zod validated
   ✔ owner enforced
   ✔ admin update only (no RLS trust)
   ✔ idempotent safe
   ✔ name uniqueness enforced
   ✔ updated_at maintained
   ✔ audit logged
   ✔ production hardened
   ❌ NEVER trust client

   DO NOT MODIFY AGAIN
====================================================== */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { z } from "zod"

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { guardAPI } from "@/lib/ratelimit"
import { writeAuditLog } from "@/lib/audit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   SCHEMA (STRICT)
====================================================== */

const schema = z.object({
  productId: z.string().uuid(),
  name: z.string().trim().min(1).max(120).optional(),
  price: z.number().min(0).optional(),
  description: z.string().max(2000).nullable().optional(),
})

/* ======================================================
   ROUTE
====================================================== */

export async function POST(req: Request) {
  try {
    /* =====================================================
       1️⃣ RATE LIMIT
    ===================================================== */

    if (!guardAPI(req)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    /* =====================================================
       2️⃣ VALIDATE INPUT
    ===================================================== */

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { productId, name, price, description } = parsed.data

    /* =====================================================
       3️⃣ AUTH
    ===================================================== */

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
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* =====================================================
       4️⃣ FETCH PRODUCT (OWNER VERIFY)
    ===================================================== */

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, creator_id, name, price, description")
      .eq("id", productId)
      .maybeSingle()

    if (!product || product.creator_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    /* =====================================================
       5️⃣ BUILD PATCH (ONLY CHANGED FIELDS)
    ===================================================== */

    const patch: Record<string, unknown> = {}

    const trimmedName = name?.trim()

    /* ---------- name change + uniqueness check ---------- */
    if (trimmedName !== undefined && trimmedName !== product.name) {
      const { data: existing } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("creator_id", user.id)
        .eq("name", trimmedName)
        .neq("id", productId)
        .neq("status", "archived")
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: "Product name already exists" },
          { status: 409 }
        )
      }

      patch.name = trimmedName
    }

    if (price !== undefined && price !== product.price) {
      patch.price = price
    }

    if (description !== undefined && description !== product.description) {
      patch.description = description ?? null
    }

    /* idempotent — nothing changed */
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: true })
    }

    /* always update timestamp */
    patch.updated_at = new Date().toISOString()

    /* =====================================================
       6️⃣ UPDATE (ADMIN AUTHORITY)
    ===================================================== */

    const { error } = await supabaseAdmin
      .from("products")
      .update(patch)
      .eq("id", productId)

    if (error) {
      console.error("PRODUCT_UPDATE_ERROR", error)
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    /* =====================================================
       7️⃣ AUDIT
    ===================================================== */

    await writeAuditLog({
      event_type: "product.updated",
      entity_type: "product",
      entity_id: productId,
      actor_type: "user",
      actor_id: user.id,
      context: patch,
    })

    /* =====================================================
       RETURN
    ===================================================== */

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PRODUCT_UPDATE_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
   FILE FROZEN — DO NOT TOUCH AGAIN
====================================================== */