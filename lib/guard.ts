// lib/guard.ts

import { hasProductAccess } from "@/lib/access";

export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: "UNAUTHORIZED" | "FORBIDDEN" };

export async function guardProductAccess(
  userId: string | null,
  productId: string
): Promise<GuardResult> {
  // 🔐 Not logged in
  if (!userId) {
    return { allowed: false, reason: "UNAUTHORIZED" };
  }

  const allowed = await hasProductAccess(userId, productId);

  if (!allowed) {
    return { allowed: false, reason: "FORBIDDEN" };
  }

  return { allowed: true };
}