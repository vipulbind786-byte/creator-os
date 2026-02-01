/* ======================================================
   🔒 PHASE-6 HARD LOCK
   DAILY REVENUE METRICS CRON (ANALYTICS AUTHORITY)

   RESPONSIBILITY:
   ✔ recompute payment_metrics safely
   ✔ DB truth only (orders table)
   ✔ status=paid only revenue
   ✔ idempotent
   ✔ no client trust
   ✔ admin only (CRON_SECRET)
   ✔ singleton row update
   ✔ fail closed
   ✔ production safe

   ENV:
   CRON_SECRET=xxxxx

   USAGE:
   GET /api/cron/metrics?secret=CRON_SECRET

   🔒 DO NOT MODIFY AGAIN
====================================================== */

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   ROUTE
====================================================== */

export async function GET(req: Request) {
  try {
    /* =====================================================
       1️⃣ CRON AUTH (FAIL CLOSED)
    ===================================================== */

    const url = new URL(req.url)
    const secret = url.searchParams.get("secret")

    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 })
    }

    /* =====================================================
       2️⃣ AGGREGATE ORDERS (DB TRUTH)
    ===================================================== */

    const { data: rows, error } = await supabaseAdmin.rpc(
      "compute_payment_metrics"
    )

    /*
      🔥 NOTE:
      This RPC must return:
      {
        total_orders,
        success_orders,
        failed_orders,
        pending_orders,
        total_revenue
      }
    */

    if (error || !rows) {
      console.error("METRICS_RPC_ERROR", error)
      throw error
    }

    const metrics = rows[0]

    /* =====================================================
       3️⃣ UPSERT SINGLETON ROW (ID=TRUE)
    ===================================================== */

    const { error: upsertError } = await supabaseAdmin
      .from("payment_metrics")
      .upsert(
        {
          id: true,
          ...metrics,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (upsertError) throw upsertError

    /* =====================================================
       RETURN
    ===================================================== */

    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (err) {
    console.error("CRON_METRICS_FATAL", err)

    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
   FILE FROZEN — NEVER TOUCH AGAIN
====================================================== */