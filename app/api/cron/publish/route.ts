/* ======================================================
   🔒 PHASE-6 HARD LOCK
   AUTO PUBLISH SCHEDULER (CRON SAFE)

   RESPONSIBILITY:
   ✔ activate scheduled products automatically
   ✔ status: scheduled → active
   ✔ publish_at <= now()
   ✔ server only (NO CLIENT)
   ✔ admin DB authority only
   ✔ bulk safe update
   ✔ idempotent
   ✔ audit logged
   ✔ fail closed
   ✔ production cron ready

   SECURITY:
   ❌ NEVER trust client
   ❌ NEVER expose publicly
   ✔ requires CRON_SECRET

   ENV REQUIRED:
   CRON_SECRET=xxxxx

   USAGE (cron):
   GET /api/cron/publish?secret=CRON_SECRET

   🔒 DO NOT MODIFY AGAIN
====================================================== */

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { writeAuditLog } from "@/lib/audit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/* ======================================================
   ROUTE (GET — CRON ONLY)
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
       2️⃣ FETCH DUE PRODUCTS
       ONLY those ready to publish
    ===================================================== */

    const nowIso = new Date().toISOString()

    const { data: products, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, creator_id")
      .eq("status", "scheduled")
      .lte("publish_at", nowIso)

    if (fetchError) {
      console.error("CRON_FETCH_ERROR", fetchError)
      throw fetchError
    }

    if (!products?.length) {
      /* idempotent — nothing to do */
      return NextResponse.json({
        success: true,
        activated: 0,
      })
    }

    /* =====================================================
       3️⃣ BULK ACTIVATE (ADMIN AUTHORITY)
    ===================================================== */

    const ids = products.map((p) => p.id)

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("products")
      .update({
        status: "active",
        updated_at: nowIso,
      })
      .in("id", ids)
      .select("id")

    if (updateError) {
      console.error("CRON_UPDATE_ERROR", updateError)
      throw updateError
    }

    /* integrity check */
    if (!updated || updated.length !== ids.length) {
      throw new Error("CRON_DATA_INTEGRITY_VIOLATION")
    }

    /* =====================================================
       4️⃣ AUDIT (best effort)
    ===================================================== */

    for (const p of products) {
      await writeAuditLog({
        event_type: "product.auto_published",
        entity_type: "product",
        entity_id: p.id,
        actor_type: "system",
        actor_id: null,
      })
    }

    /* =====================================================
       RETURN
    ===================================================== */

    return NextResponse.json({
      success: true,
      activated: updated.length,
    })
  } catch (err) {
    console.error("CRON_PUBLISH_FATAL", err)

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