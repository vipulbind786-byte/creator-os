// lib/access.ts

import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * 🔐 Check if user has active entitlement for a product
 * SINGLE source of truth for access
 */
export async function hasProductAccess(
  userId: string,
  productId: string
): Promise<boolean> {
  if (!userId || !productId) return false;

  const { data, error } = await supabaseAdmin
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("ACCESS CHECK ERROR:", error);
    return false;
  }

  return !!data;
}