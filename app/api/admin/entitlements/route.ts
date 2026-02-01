/* ======================================================
   🔒 PHASE-4 HARD LOCK — ADMIN ENTITLEMENTS API
   ------------------------------------------------------
   ✔ Admin only
   ✔ Server authority only
   ✔ Rate limited
   ✔ Zod validated
   ✔ Safe grant/revoke
   ✔ Read/Write controlled
   ✔ No client trust
   ✔ Production hardened

   DO NOT MODIFY AGAIN
====================================================== */

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { z } from "zod"

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { guardAPI } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   HELPERS
====================================================== */

async function requireAdmin(req: Request) {
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

  if (!user) return null

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.is_admin) return null

  return user
}

/* ======================================================
   QUERY SCHEMA
====================================================== */

const querySchema = z.object({
  search: z.string().max(120).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  page: z.coerce.number().min(1).default(1),
})

/* ======================================================
   GRANT / REVOKE SCHEMA
====================================================== */

const actionSchema = z.object({
  action: z.enum(["grant", "revoke"]),
  userId: z.string().uuid(),
  productId: z.string().uuid(),
})

/* ======================================================
   GET — LIST ENTITLEMENTS
====================================================== */

export async function GET(req: Request) {
  try {
    if (!guardAPI(req)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)

    const parsed = querySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      limit: searchParams.get("limit"),
      page: searchParams.get("page"),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    const { search, limit, page } = parsed.data

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseAdmin
      .from("entitlements")
      .select(
        `
        id,
        user_id,
        product_id,
        order_id,
        status,
        granted_at,
        revoked_at
        `,
        { count: "exact" }
      )
      .order("granted_at", { ascending: false })
      .range(from, to)

    if (search) {
      query = query.or(
        `user_id.ilike.%${search}%,product_id.ilike.%${search}%`
      )
    }

    const { data, count, error } = await query

    if (error) {
      console.error("ADMIN_ENTITLEMENTS_FETCH_ERROR", error)
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }

    return NextResponse.json({
      entitlements: data ?? [],
      total: count ?? 0,
      page,
      limit,
    })
  } catch (err) {
    console.error("ADMIN_ENTITLEMENTS_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   POST — GRANT / REVOKE
====================================================== */

export async function POST(req: Request) {
  try {
    if (!guardAPI(req)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = actionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const { action, userId, productId } = parsed.data

    /* -----------------------------
       REVOKE
    ----------------------------- */
    if (action === "revoke") {
      await supabaseAdmin
        .from("entitlements")
        .update({
          status: "revoked",
          revoked_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("product_id", productId)

      return NextResponse.json({ success: true, revoked: true })
    }

    /* -----------------------------
       GRANT (manual support)
    ----------------------------- */
    if (action === "grant") {
      await supabaseAdmin.from("entitlements").upsert(
        {
          user_id: userId,
          product_id: productId,
          order_id: null,
          status: "active",
          granted_at: new Date().toISOString(),
        },
        { onConflict: "user_id,product_id" }
      )

      return NextResponse.json({ success: true, granted: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err) {
    console.error("ADMIN_ENTITLEMENTS_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */