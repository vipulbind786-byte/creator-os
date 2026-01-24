import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Checks whether a user has an ACTIVE entitlement
 * for a given product.
 *
 * 🔐 Server-side only
 * 🔁 Reusable across API / Server Components / AI agents
 *
 * @param userId UUID of auth.users.id
 * @param productId UUID of products.id
 * @returns boolean (true = access allowed)
 */
export async function hasActiveEntitlement(
  userId: string | null | undefined,
  productId: string | null | undefined
): Promise<boolean> {
  try {
    // 🛑 Hard fail if params missing
    if (!userId || !productId) {
      console.warn("⚠️ Entitlement check failed: missing userId/productId");
      return false;
    }

    const { data, error } = await supabaseAdmin
      .from("entitlements")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("❌ Entitlement query error:", error.message);
      return false;
    }

    return Boolean(data);
  } catch (err) {
    console.error("🔥 Entitlement check crashed:", err);
    return false;
  }
}