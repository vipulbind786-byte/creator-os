/* ======================================================
   🔒 PHASE-2 HARD LOCK
   PRODUCT DELETE (SOFT ARCHIVE) — AUTHORITATIVE

   ✔ server auth only
   ✔ rate limited
   ✔ zod validated
   ✔ owner enforced
   ✔ admin update only (no RLS trust)
   ✔ soft delete only (status=archived)
   ✔ idempotent safe
   ✔ exactly 1 row updated (financial integrity)
   ✔ updated_at maintained
   ✔ audit logged
   ✔ production hardened
   ❌ NEVER hard delete

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
   ASSERT EXACTLY ONE ROW (safety)
====================================================== */

async function assertSingleUpdate(productId: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id")

  if (error) throw error

  if (!data || data.length !== 1) {
    throw new Error(
      `DATA_INTEGRITY_VIOLATION: products update affected ${data?.length ?? 0} rows`
    )
  }
}

/* ======================================================
   SCHEMA (STRICT)
====================================================== */

const schema = z.object({
  productId: z.string().uuid(),
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

    const { productId } = parsed.data

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
       4️⃣ VERIFY OWNERSHIP
    ===================================================== */

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, creator_id, status")
      .eq("id", productId)
      .maybeSingle()

    if (!product || product.creator_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    /* =====================================================
       5️⃣ IDEMPOTENT (already archived)
    ===================================================== */

    if (product.status === "archived") {
      return NextResponse.json({ success: true, archived: true })
    }

    /* =====================================================
       6️⃣ SOFT DELETE (STRICT SAFE UPDATE)
    ===================================================== */

    await assertSingleUpdate(productId)

    /* =====================================================
       7️⃣ AUDIT
    ===================================================== */

    await writeAuditLog({
      event_type: "product.archived",
      entity_type: "product",
      entity_id: productId,
      actor_type: "user",
      actor_id: user.id,
    })

    /* =====================================================
       RETURN
    ===================================================== */

    return NextResponse.json({
      success: true,
      archived: true,
    })
  } catch (err) {
    console.error("PRODUCT_DELETE_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
   FILE FROZEN — DO NOT TOUCH AGAIN
====================================================== */