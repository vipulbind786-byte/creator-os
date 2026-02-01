// lib/billing/addons/getUserAddons.ts
// 🔒 STEP-6: USER ADD-ON READ RESOLVER — HARD LOCK
// SERVER-ONLY • READ-ONLY • AUDIT-SAFE
// ❌ NO UI
// ❌ NO WRITE
// ❌ NO PLAN LOGIC

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import type { BillingAddOn } from "@/lib/billing/types"

/**
 * Fetch all ACTIVE add-ons for a user.
 *
 * Rules (NON-NEGOTIABLE):
 * 1. Server-side only
 * 2. Reads from `user_addons`
 * 3. Only `status = active`
 * 4. No inference, no defaults
 */
export async function getUserAddons(
  userId: string | null | undefined
): Promise<BillingAddOn[]> {
  try {
    if (!userId) return []

    const { data, error } = await supabaseAdmin
      .from("user_addons")
      .select("addon")
      .eq("user_id", userId)
      .eq("status", "active")

    if (error || !data) return []

    // Normalize & trust DB
    return data
      .map((row) => row.addon as BillingAddOn)
      .filter(Boolean)
  } catch (err) {
    console.error("GET_USER_ADDONS_ERROR", err)
    return []
  }
}