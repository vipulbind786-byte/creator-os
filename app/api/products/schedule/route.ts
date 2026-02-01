/* ======================================================
   🔒 PHASE-2 HARD LOCK
   PRODUCT SCHEDULE — AUTHORITATIVE

   ✔ rate limited
   ✔ zod validated
   ✔ UTC only
   ✔ future only
   ✔ max 1 year
   ✔ server auth only
   ✔ admin authority writes (no RLS trust)
   ✔ ownership enforced
   ✔ idempotent safe
   ✔ exactly 1 row updated (integrity)
   ✔ audit logged
   ✔ production hardened

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

const MAX_FUTURE_MS = 1000 * 60 * 60 * 24 * 365 // 1 year

/* ======================================================
   ASSERT EXACTLY ONE ROW (safety)
====================================================== */

async function assertSingleUpdate(productId: string, publishAt: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({
      status: "scheduled",
      publish_at: publishAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id")

  if (error) throw error

  if (!data || data.length !== 1) {
    throw new Error(
      `DATA_INTEGRITY_VIOLATION: products schedule affected ${data?.length ?? 0} rows`
    )
  }
}

/* ======================================================
   SCHEMA
====================================================== */

const schema = z.object({
  productId: z.string().uuid(),
  publishAt: z.string().datetime(),
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

    const { productId, publishAt } = parsed.data

    /* =====================================================
       3️⃣ UTC + TIME SANITY
    ===================================================== */

    if (!publishAt.endsWith("Z")) {
      return NextResponse.json({ error: "publishAt must be UTC (Z)" }, { status: 400 })
    }

    const publishDate = new Date(publishAt)

    if (Number.isNaN(publishDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const now = Date.now()
    const publishMs = publishDate.getTime()

    if (publishMs <= now) {
      return NextResponse.json({ error: "Must be future date" }, { status: 400 })
    }

    if (publishMs - now > MAX_FUTURE_MS) {
      return NextResponse.json({ error: "Max 1 year scheduling allowed" }, { status: 400 })
    }

    /* =====================================================
       4️⃣ AUTH
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
       5️⃣ ADMIN READ (truth)
    ===================================================== */

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, creator_id, status, publish_at")
      .eq("id", productId)
      .maybeSingle()

    if (!product || product.creator_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (product.status === "archived") {
      return NextResponse.json({ error: "Archived products cannot be scheduled" }, { status: 403 })
    }

    const iso = publishDate.toISOString()

    /* =====================================================
       6️⃣ IDEMPOTENT
    ===================================================== */

    if (product.status === "scheduled" && product.publish_at === iso) {
      return NextResponse.json({
        success: true,
        scheduled: true,
        publish_at: iso,
      })
    }

    /* =====================================================
       7️⃣ STRICT UPDATE (integrity safe)
    ===================================================== */

    await assertSingleUpdate(productId, iso)

    /* =====================================================
       8️⃣ AUDIT
    ===================================================== */

    await writeAuditLog({
      event_type: "product.scheduled",
      entity_type: "product",
      entity_id: productId,
      actor_type: "user",
      actor_id: user.id,
      context: { publish_at: iso },
    })

    /* =====================================================
       RETURN
    ===================================================== */

    return NextResponse.json({
      success: true,
      scheduled: true,
      publish_at: iso,
    })
  } catch (err) {
    console.error("PRODUCT_SCHEDULE_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
   FILE FROZEN — DO NOT TOUCH AGAIN
====================================================== */