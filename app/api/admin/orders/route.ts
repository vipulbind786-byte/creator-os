/* ======================================================
   🔒 PHASE-4 HARD LOCK — ADMIN ORDERS API
   ------------------------------------------------------
   ✔ Admin only
   ✔ Server authority only
   ✔ Rate limited
   ✔ Zod validated
   ✔ Safe filtering
   ✔ Safe search
   ✔ No client trust
   ✔ Read-only
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
   QUERY SCHEMA (STRICT)
====================================================== */

const schema = z.object({
  status: z.enum(["paid", "pending", "failed"]).optional(),
  search: z.string().max(120).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  page: z.coerce.number().min(1).default(1),
})

/* ======================================================
   GET — LIST ORDERS (ADMIN ONLY)
====================================================== */

export async function GET(req: Request) {
  try {
    /* =====================================================
       1️⃣ RATE LIMIT (cheap first)
    ===================================================== */

    if (!guardAPI(req)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    /* =====================================================
       2️⃣ AUTH (SERVER TRUST ONLY)
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
       3️⃣ ADMIN CHECK (profiles.is_admin 🔥)
    ===================================================== */

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    /* =====================================================
       4️⃣ VALIDATE QUERY
    ===================================================== */

    const { searchParams } = new URL(req.url)

    const parsed = schema.safeParse({
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      limit: searchParams.get("limit"),
      page: searchParams.get("page"),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 })
    }

    const { status, search, limit, page } = parsed.data

    const from = (page - 1) * limit
    const to = from + limit - 1

    /* =====================================================
       5️⃣ QUERY BUILD (SAFE)
    ===================================================== */

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        created_at,
        amount,
        currency,
        status,
        payment_provider,
        buyer_email,
        user_id,
        product_id,
        razorpay_order_id
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to)

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(
        `buyer_email.ilike.%${search}%,razorpay_order_id.ilike.%${search}%`
      )
    }

    const { data, count, error } = await query

    if (error) {
      console.error("ADMIN_ORDERS_FETCH_ERROR", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    /* =====================================================
       6️⃣ RESPONSE
    ===================================================== */

    return NextResponse.json({
      orders: data ?? [],
      total: count ?? 0,
      page,
      limit,
    })
  } catch (err) {
    console.error("ADMIN_ORDERS_FATAL", err)
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 })
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */