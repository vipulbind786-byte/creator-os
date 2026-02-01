/* ======================================================
   🔒 PHASE-2 HARD LOCK
   PRODUCT CREATE — AUTHORITATIVE

   ✔ server auth only
   ✔ rate limited
   ✔ zod validated
   ✔ plan limit enforced
   ✔ idempotent (exact match safe)
   ✔ admin insert only (no RLS trust)
   ✔ audit logged
   ✔ production hardened
   ❌ NEVER trust client
   ❌ NEVER fuzzy match idempotency

   DO NOT MODIFY AGAIN
====================================================== */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { z } from "zod"

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getFeatureLimit } from "@/lib/billing/entitlements"
import { guardAPI } from "@/lib/ratelimit"
import { writeAuditLog } from "@/lib/audit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   SCHEMA (STRICT)
====================================================== */

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.number().min(0),
  description: z.string().max(2000).optional().nullable(),
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

    const { name, price, description } = parsed.data

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
       4️⃣ PLAN LIMIT ENFORCEMENT
    ===================================================== */

    const { data: plan } = await supabaseAdmin
      .from("creator_plans")
      .select("plan_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    const planId = plan?.plan_id ?? "FREE"

    const productLimit = getFeatureLimit(planId, "product_limit")

    const { count } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", user.id)
      .neq("status", "archived")

    if (typeof productLimit === "number" && (count ?? 0) >= productLimit) {
      return NextResponse.json(
        { error: "Product limit reached", upgrade_required: true },
        { status: 403 }
      )
    }

    /* =====================================================
       5️⃣ IDEMPOTENCY (EXACT MATCH ONLY — SAFE)
    ===================================================== */

    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("creator_id", user.id)
      .eq("name", name) // 🔥 FIXED (no ilike)
      .neq("status", "archived")
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "Product already exists" },
        { status: 409 }
      )
    }

    /* =====================================================
       6️⃣ INSERT (ADMIN ONLY — SAFE)
    ===================================================== */

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        price,
        description: description ?? null,
        creator_id: user.id,
        status: "active",
      })
      .select("id")
      .single()

    if (error) {
      console.error("PRODUCT_CREATE_ERROR", error)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    /* =====================================================
       7️⃣ AUDIT
    ===================================================== */

    await writeAuditLog({
      event_type: "product.created",
      entity_type: "product",
      entity_id: data.id,
      actor_type: "user",
      actor_id: user.id,
    })

    /* =====================================================
       RETURN
    ===================================================== */

    return NextResponse.json({
      success: true,
      productId: data.id,
    })
  } catch (err) {
    console.error("PRODUCT_CREATE_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
   FILE FROZEN — DO NOT TOUCH AGAIN
====================================================== */