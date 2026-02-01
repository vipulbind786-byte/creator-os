// lib/insights/explain.ts

import type { Insight, DashboardMetrics } from "@/types/insight"
import type { InsightStateRow } from "./state"

/* ======================================================
   EXPLAINABILITY OUTPUT (LOCKED CONTRACT)
====================================================== */

export type InsightExplainability = {
  insight: {
    id: string
    kind: Insight["kind"]
    title: string
  }

  trigger: {
    rule_id: string
    metric_key: keyof DashboardMetrics
    metric_value: number | string
    threshold?: number | string
    comparison: ">=" | ">" | "<=" | "<" | "==" | "exists"
  }

  state: {
    status: "new" | "active" | "dismissed" | "resolved"
    first_seen_at: string | null
    last_seen_at: string | null
    dismissed_at: string | null
    cooldown_until: string | null
  }

  why_now: {
    reason:
      | "first_time"
      | "cooldown_expired"
      | "severity_escalated"
      | "rule_still_true"
    explanation: string
  }

  recommendation?: {
    message: string
    action_hint?: string
  }

  meta: {
    generated_at: string
    engine_version: "v1"
  }
}

/* ======================================================
   INPUT CONTEXT (FROM RULE ENGINE)
====================================================== */

export type ExplainContext = {
  rule_id: string
  metric_key: keyof DashboardMetrics
  threshold?: number | string
  comparison: InsightExplainability["trigger"]["comparison"]
  recommendation?: {
    message: string
    action_hint?: string
  }
}

/* ======================================================
   🔥 PURE EXPLAINABILITY ENGINE
====================================================== */

export function explainInsight(params: {
  insight: Insight
  metrics: DashboardMetrics
  state: InsightStateRow | null
  context: ExplainContext
  now?: Date
}): InsightExplainability {
  const {
    insight,
    metrics,
    state,
    context,
    now = new Date(),
  } = params

  /* -------------------------------
     SAFE METRIC EXTRACTION
  -------------------------------- */
  const rawMetricValue = metrics[context.metric_key]

  const metricValue: string | number =
    rawMetricValue === null || rawMetricValue === undefined
      ? "N/A"
      : rawMetricValue

  /* -------------------------------
     STATE DERIVATION
  -------------------------------- */
  const derivedStatus: InsightExplainability["state"]["status"] =
    !state
      ? "new"
      : state.status === "dismissed"
      ? "dismissed"
      : state.status === "resolved"
      ? "resolved"
      : "active"

  /* -------------------------------
     WHY-NOW REASONING (CORE LOGIC)
  -------------------------------- */
  let whyReason: InsightExplainability["why_now"]["reason"] =
    "rule_still_true"

  let whyExplanation =
    "The underlying condition for this insight is still true."

  if (!state) {
    whyReason = "first_time"
    whyExplanation =
      "This insight is being shown for the first time."
  } else if (
    state.cooldown_until &&
    new Date(state.cooldown_until) <= now
  ) {
    whyReason = "cooldown_expired"
    whyExplanation =
      "This insight reappeared because its cooldown period has ended."
  } else if (
    state.last_seen_at &&
    context.comparison !== "exists" &&
    context.threshold !== undefined
  ) {
    // Fallback clarity when rule still true
    whyReason = "rule_still_true"
    whyExplanation =
      "The condition that triggered this insight is still satisfied."
  }

  /* -------------------------------
     FINAL OUTPUT (IMMUTABLE)
  -------------------------------- */
  return {
    insight: {
      id: insight.id,
      kind: insight.kind,
      title: insight.title,
    },

    trigger: {
      rule_id: context.rule_id,
      metric_key: context.metric_key,
      metric_value: metricValue,
      threshold: context.threshold,
      comparison: context.comparison,
    },

    state: {
      status: derivedStatus,
      first_seen_at: state?.first_seen_at ?? null,
      last_seen_at: state?.last_seen_at ?? null,
      dismissed_at:
        state?.status === "dismissed"
          ? state.last_seen_at
          : null,
      cooldown_until: state?.cooldown_until ?? null,
    },

    why_now: {
      reason: whyReason,
      explanation: whyExplanation,
    },

    recommendation: context.recommendation,

    meta: {
      generated_at: now.toISOString(),
      engine_version: "v1",
    },
  }
}