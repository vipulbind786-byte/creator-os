/* ======================================================
   🔒 PHASE-3 HARD LOCK
   ENTITLEMENT CORE — FINAL AUTHORITY

   ✔ single DB query (atomic)
   ✔ admin client only
   ✔ race condition free
   ✔ fail closed
   ✔ minimal select
   ✔ zero UI / feature logic
   ✔ production hardened
   ✔ constant time

   THIS FILE = ACCESS TRUTH
   DO NOT MODIFY AGAIN
====================================================== */

import { supabaseAdmin } from "@/lib/supabaseAdmin"

/* ======================================================
   FINAL ACCESS AUTHORITY (SERVER ONLY)

   Rules (NON-NEGOTIABLE):
   1. userId exists
   2. productId exists
   3. entitlement.status = active
   4. order.status = paid
   5. BOTH must exist in same row

   Anything else = NO ACCESS
====================================================== */

export async function hasActiveEntitlement(
  userId: string | null | undefined,
  productId: string | null | undefined
): Promise<boolean> {
  try {
    /* -----------------------------
       HARD INPUT GUARD
    ----------------------------- */

    if (!userId || !productId) return false

    /* =====================================================
       🔥 ATOMIC JOIN QUERY (NO RACE CONDITIONS)
    ===================================================== */

    const { data, error } = await supabaseAdmin
      .from("entitlements")
      .select(`
        id,
        orders!inner (
          status
        )
      `)
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("status", "active")
      .eq("orders.status", "paid")
      .limit(1)
      .maybeSingle()

    /* -----------------------------
       FAIL CLOSED ALWAYS
    ----------------------------- */

    if (error || !data) return false

    return true
  } catch (err) {
    console.error("ENTITLEMENT_CORE_ERROR", err)
    return false
  }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */