import { supabaseAdmin } from "@/lib/supabaseAdmin";

type AuditActorType = "system" | "user" | "admin";

interface AuditLogInput {
  event_type: string;
  entity_type: string;
  entity_id?: string | null;

  actor_type: AuditActorType;
  actor_id?: string | null;

  context?: Record<string, any>;
}

/**
 * writeAuditLog
 * -------------------------
 * Centralized, append-only audit logger
 *
 * RULES:
 * - Server only
 * - No PII
 * - No raw payloads
 * - Never throw (logging must not break business logic)
 */
export async function writeAuditLog(input: AuditLogInput) {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      event_type: input.event_type,
      entity_type: input.entity_type,
      entity_id: input.entity_id ?? null,

      actor_type: input.actor_type,
      actor_id: input.actor_id ?? null,

      context: input.context ?? {},
    });
  } catch (err) {
    // ❌ Never throw — audit failure must NOT break core flow
    console.error("⚠️ AUDIT LOG FAILED:", err);
  }
}