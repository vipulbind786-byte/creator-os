// lib/access.ts
// 🔒 OP-12: ACCESS WRAPPER — FINAL, HARD LOCK
// ❌ NO LOGIC HERE
// ❌ NO DB QUERIES HERE
// ❌ DO NOT MODIFY
// CORE AUTHORITY = lib/entitlement.ts

import { hasActiveEntitlement } from "@/lib/entitlement"

/**
 * 🔐 ACCESS CHECK (SERVER-SIDE ONLY)
 *
 * This is a THIN WRAPPER for backward compatibility.
 * All rules live in hasActiveEntitlement().
 */
export async function hasProductAccess(
  userId: string | null | undefined,
  productId: string | null | undefined
): Promise<boolean> {
  return hasActiveEntitlement(userId, productId)
}