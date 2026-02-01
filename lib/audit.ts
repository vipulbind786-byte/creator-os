// lib/audit.ts

import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* ======================================================
   TYPES
====================================================== */

export type AuditActorType =
  | "system"
  | "user"
  | "admin"
  | "webhook";

export interface AuditLogInput {
  event_type: string;        // e.g. "payment.captured"
  entity_type: string;       // e.g. "order", "subscription"
  entity_id: string;         // UUID or provider ID
  actor_type: AuditActorType;
  actor_id?: string | null;  // optional (system/webhook = null)
  context?: Record<string, any>; // non-sensitive metadata only
}

/* ======================================================
   WRITE AUDIT LOG (BEST-EFFORT)
====================================================== */

/**
 * 🔐 writeAuditLog
 *
 * - NEVER throws
 * - NEVER blocks business logic
 * - Used for payments, refunds, subscriptions
 * - Legal / compliance / debugging trail
 */
export async function writeAuditLog(
  input: AuditLogInput
): Promise<void> {
  try {
    const {
      event_type,
      entity_type,
      entity_id,
      actor_type,
      actor_id = null,
      context = {},
    } = input;

    // Hard guard — audit should never poison runtime
    if (!event_type || !entity_type || !entity_id || !actor_type) {
      console.warn("⚠️ AUDIT SKIPPED — invalid payload", input);
      return;
    }

    await supabaseAdmin.from("audit_logs").insert({
      event_type,
      entity_type,
      entity_id,
      actor_type,
      actor_id,
      context,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // 🔥 ABSOLUTE RULE: audit failure must NEVER crash app
    console.error("🔥 AUDIT LOG FAILED:", err);
  }
}