// lib/insights/state.ts

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Insight, DashboardMetrics } from "@/types/insight"
import { resolveInsightByRules } from "./resolveRules"
import { logInsightEvent } from "./auditLogger"

/* =====================================
   SINGLE SOURCE OF TRUTH — DB ROW
===================================== */
export type InsightStateRow = {
  insight_id: string
  status: "active" | "dismissed" | "resolved"

  first_seen_at: string | null
  last_seen_at: string | null

  dismissed_at: string | null
  dismiss_count: number

  cooldown_until: string | null
  last_severity: number | null

  resolved_at: string | null
  resolution_context: Record<string, any> | null
}

/* =====================================
   Supabase (server only)
===================================== */
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

/* =====================================
   Load existing states
===================================== */
async function loadExistingStates(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) {
  const { data } = await supabase
    .from("insight_state")
    .select("*")
    .eq("user_id", userId)

  const map = new Map<string, InsightStateRow>()
  data?.forEach((row: InsightStateRow) => {
    map.set(row.insight_id, row)
  })

  return map
}

/* =====================================
   Persist resolve → DB
===================================== */
async function markResolved(params: {
  supabase: ReturnType<typeof createServerClient>
  userId: string
  insightId: string
  reason: string
  now: Date
}) {
  const { supabase, userId, insightId, reason, now } = params

  await supabase
    .from("insight_state")
    .update({
      status: "resolved",
      resolved_at: now.toISOString(),
      resolution_context: { reason },
    })
    .eq("user_id", userId)
    .eq("insight_id", insightId)

  await logInsightEvent({
    userId,
    insightId,
    event: "resolved",
    metadata: { reason },
  })
}

/* =====================================
   🔥 MAIN ORCHESTRATOR (DB = TRUTH)
===================================== */
export async function syncInsightState(params: {
  userId: string
  freshInsights: Insight[]
  metrics: DashboardMetrics
  now?: Date
}): Promise<Insight[]> {
  const { userId, freshInsights, metrics, now = new Date() } = params

  const supabase = await getSupabase()
  const stateMap = await loadExistingStates(supabase, userId)

  const visible: Insight[] = []

  for (const insight of freshInsights) {
    const existing = stateMap.get(insight.id)

    /* ===============================
       🆕 NEW INSIGHT
    =============================== */
    if (!existing) {
      await supabase.from("insight_state").insert({
        user_id: userId,
        insight_id: insight.id,
        status: "active",

        first_seen_at: now.toISOString(),
        last_seen_at: now.toISOString(),

        dismissed_at: null,
        dismiss_count: 0,

        cooldown_until: null,
        last_severity: insight.priority,

        resolved_at: null,
        resolution_context: null,
      })

      await logInsightEvent({
        userId,
        insightId: insight.id,
        event: "created",
      })

      visible.push(insight)
      continue
    }

    /* ===============================
       🔥 AUTO-RESOLVE (RULE BASED)
    =============================== */
    if (existing.status === "active") {
      try {
        const resolution = resolveInsightByRules(insight, metrics)

        if (resolution.shouldResolve) {
          await markResolved({
            supabase,
            userId,
            insightId: insight.id,
            reason: resolution.reason,
            now,
          })
          continue // resolved insights never render
        }
      } catch (err) {
        console.error("🔥 Auto-resolve failed:", err)
      }
    }

    /* ===============================
       ⛔ VISIBILITY CHECK
    =============================== */
    if (existing.status !== "active") continue

    if (
      existing.cooldown_until &&
      new Date(existing.cooldown_until) > now
    ) {
      continue
    }

    /* ===============================
       👀 SEEN AGAIN
    =============================== */
    await supabase
      .from("insight_state")
      .update({
        last_seen_at: now.toISOString(),
        last_severity: insight.priority,
      })
      .eq("user_id", userId)
      .eq("insight_id", insight.id)

    await logInsightEvent({
      userId,
      insightId: insight.id,
      event: "seen",
    })

    visible.push(insight)
  }

  return visible.sort((a, b) => a.priority - b.priority)
}