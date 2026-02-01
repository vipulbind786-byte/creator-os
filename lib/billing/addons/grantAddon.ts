// lib/billing/addons/grantAddon.ts
// 🔒 PHASE-4 STEP-2: ADD-ON GRANT — SUPPORT ONLY
// ONE-TIME • AUDITABLE • REVERSIBLE
// ❌ DO NOT CALL FROM UI
// ❌ DO NOT AUTO-GRANT

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { writeAuditLog } from "@/lib/audit"
import type { BillingAddOn } from "@/lib/billing/types"

type GrantAddOnParams = {
  userId: string
  addon: BillingAddOn
  grantedBy: "system" | "admin"
  reason: string
}

export async function grantAddOn({
  userId,
  addon,
  grantedBy,
  reason,
}: GrantAddOnParams): Promise<boolean> {
  if (!userId || !addon) return false

  try {
    /* -----------------------------
       Prevent duplicate grants
    ----------------------------- */
    const { data: existing } = await supabaseAdmin
      .from("user_addons")
      .select("id")
      .eq("user_id", userId)
      .eq("addon", addon)
      .maybeSingle()

    if (existing) return true // idempotent

    /* -----------------------------
       Grant add-on
    ----------------------------- */
    const { error } = await supabaseAdmin
      .from("user_addons")
      .insert({
        user_id: userId,
        addon,
        granted_at: new Date().toISOString(),
        granted_by: grantedBy,
        reason,
      })

    if (error) {
      console.error("ADDON_GRANT_ERROR", error)
      return false
    }

    /* -----------------------------
       Audit
    ----------------------------- */
    await writeAuditLog({
  event_type: "addon.granted",
  entity_type: "addon",
  entity_id: addon,
  actor_type: grantedBy,
})

    return true
  } catch (err) {
    console.error("ADDON_GRANT_FATAL", err)
    return false
  }
}