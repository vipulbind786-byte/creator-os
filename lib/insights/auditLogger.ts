// lib/insights/auditLogger.ts

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/* ======================================================
   AUDIT EVENT TYPES
====================================================== */

export type InsightAuditEvent =
  | "created"
  | "seen"
  | "dismissed"
  | "resolved"
  | "cooldown_escalated"

/* ======================================================
   INTERNAL: Supabase Client
====================================================== */

async function getSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/* ======================================================
   🔥 AUDIT LOGGER (FAIL-SAFE)
====================================================== */

/**
 * Persist insight lifecycle events.
 *
 * ⚠️ Fail-safe by design:
 * If audit logging fails, core logic MUST NOT break.
 */
export async function logInsightEvent(params: {
  userId: string
  insightId: string
  event: InsightAuditEvent
  metadata?: Record<string, any>
  now?: Date
}) {
  const {
    userId,
    insightId,
    event,
    metadata = {},
    now = new Date(),
  } = params

  try {
    const supabase = await getSupabase()

    await supabase.from("insight_audit_log").insert({
      user_id: userId,
      insight_id: insightId,
      event,
      metadata,
      created_at: now.toISOString(),
    })
  } catch (err) {
    // 🔕 Silent fail — audit must NEVER break product
    console.error("⚠️ Insight audit log failed:", err)
  }
}