/* ======================================================
   🔒 CREATOR OS — SECURITY GUARD CORE (PHASE-5 HARD LOCK)
   ------------------------------------------------------
   CENTRAL AUTHORITY FOR ALL SERVER ACCESS CONTROL

   ✔ requireUser()
   ✔ requireAdmin()
   ✔ requireOwner()
   ✔ guardProductAccess()
   ✔ fail-closed design
   ✔ zero DB duplication
   ✔ reusable everywhere

   RULES:
   ❌ NEVER add business logic here
   ❌ NEVER import UI
   ❌ ONLY access control

   ALL APIs MUST USE THIS FILE ONLY

   🔒 DO NOT MODIFY AGAIN
====================================================== */

import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { hasProductAccess } from "@/lib/access"

/* ======================================================
   Types
====================================================== */

export type GuardResult =
  | { allowed: true }
  | { allowed: false; reason: "UNAUTHORIZED" | "FORBIDDEN" }

/* ======================================================
   1️⃣ REQUIRE USER (login only)
====================================================== */

export function requireUser(userId: string | null | undefined): GuardResult {
  if (!userId) {
    return { allowed: false, reason: "UNAUTHORIZED" }
  }

  return { allowed: true }
}

/* ======================================================
   2️⃣ REQUIRE ADMIN (profiles.is_admin only)
   SERVER-SIDE ONLY (DB truth)
====================================================== */

export async function requireAdmin(
  userId: string | null | undefined
): Promise<GuardResult> {
  if (!userId) {
    return { allowed: false, reason: "UNAUTHORIZED" }
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data?.is_admin) {
    return { allowed: false, reason: "FORBIDDEN" }
  }

  return { allowed: true }
}

/* ======================================================
   3️⃣ REQUIRE OWNER (creator_id match)
====================================================== */

export function requireOwner(
  userId: string | null | undefined,
  creatorId: string | null | undefined
): GuardResult {
  if (!userId) {
    return { allowed: false, reason: "UNAUTHORIZED" }
  }

  if (!creatorId || userId !== creatorId) {
    return { allowed: false, reason: "FORBIDDEN" }
  }

  return { allowed: true }
}

/* ======================================================
   4️⃣ PRODUCT ENTITLEMENT ACCESS
   (delegates to lib/entitlement.ts authority)
====================================================== */

export async function guardProductAccess(
  userId: string | null,
  productId: string
): Promise<GuardResult> {
  if (!userId) {
    return { allowed: false, reason: "UNAUTHORIZED" }
  }

  const allowed = await hasProductAccess(userId, productId)

  if (!allowed) {
    return { allowed: false, reason: "FORBIDDEN" }
  }

  return { allowed: true }
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
   Security foundation file — never touch again.
====================================================== */