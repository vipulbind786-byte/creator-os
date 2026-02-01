// /lib/insights/cooldown.ts

import type { Insight } from "@/types/insight"

/* ======================================================
   INSIGHT STATE — DB CONTRACT (P3 LOCKED)

   Backward compatible:
   - Older rows without new fields will still work
====================================================== */

export type InsightCooldownState = {
  dismissed_at: string | null          // ISO
  cooldown_until: string | null        // ISO
  dismiss_count: number                // escalation ladder
  last_severity: number | null         // lowest priority ever seen (lower = stronger)

  /* -------- P3 ADDITIONS -------- */
  snoozed_until?: string | null        // ISO (optional, backward-safe)
  last_shown_at?: string | null        // ISO (for daily frequency cap)
  shown_count_today?: number | null    // integer (reset by date)
}

/* ======================================================
   ENGINE DECISION OUTPUT (LOCKED)
====================================================== */

export type CooldownDecision = {
  shouldShow: boolean
  reason:
    | "first_time"
    | "snoozed"
    | "frequency_capped"
    | "severity_escalated"
    | "cooldown_active"
    | "cooldown_expired"
}

/* ======================================================
   SOURCE OF TRUTH CONSTANTS
====================================================== */

const COOLDOWN_LADDER_DAYS = [1, 3, 7, 30]
const MAX_SHOWS_PER_DAY = 1   // 🔒 global daily frequency cap

/* ======================================================
   HELPERS (PURE)
====================================================== */

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function getCooldownDays(dismissCount: number): number {
  const index = Math.max(dismissCount - 1, 0)
  return (
    COOLDOWN_LADDER_DAYS[
      Math.min(index, COOLDOWN_LADDER_DAYS.length - 1)
    ] ?? COOLDOWN_LADDER_DAYS[0]
  )
}

function isSameUTCDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

/* ======================================================
   🔍 READ — SHOULD THIS INSIGHT SHOW?
   SINGLE AUTHORITY (ENGINE USE ONLY)
====================================================== */

export function evaluateInsightCooldown(params: {
  insight: Insight
  state: InsightCooldownState | null
  now?: Date
}): CooldownDecision {
  const { insight, state, now = new Date() } = params

  // 1️⃣ First time ever
  if (!state || !state.dismissed_at) {
    return { shouldShow: true, reason: "first_time" }
  }

  // 2️⃣ Snooze check (HIGHEST priority block)
  if (state.snoozed_until) {
    const until = new Date(state.snoozed_until)
    if (!isNaN(until.getTime()) && until > now) {
      return { shouldShow: false, reason: "snoozed" }
    }
  }

  // 3️⃣ Daily frequency cap (per insight)
  if (
    state.last_shown_at &&
    typeof state.shown_count_today === "number"
  ) {
    const lastShown = new Date(state.last_shown_at)

    if (
      !isNaN(lastShown.getTime()) &&
      isSameUTCDate(lastShown, now) &&
      state.shown_count_today >= MAX_SHOWS_PER_DAY
    ) {
      return {
        shouldShow: false,
        reason: "frequency_capped",
      }
    }
  }

  // 4️⃣ Severity escalation override
  // LOWER priority number = HIGHER severity
  if (
    typeof state.last_severity === "number" &&
    insight.priority < state.last_severity
  ) {
    return {
      shouldShow: true,
      reason: "severity_escalated",
    }
  }

  // 5️⃣ Cooldown active
  if (state.cooldown_until) {
    const until = new Date(state.cooldown_until)
    if (!isNaN(until.getTime()) && until > now) {
      return {
        shouldShow: false,
        reason: "cooldown_active",
      }
    }
  }

  // 6️⃣ Cooldown expired
  return {
    shouldShow: true,
    reason: "cooldown_expired",
  }
}

/* ======================================================
   ✍️ WRITE — NEXT STATE ON DISMISS (LOCKED)
   API MUST CALL ONLY THIS
====================================================== */

export function computeNextInsightState(params: {
  previous: InsightCooldownState | null
  insight: Insight
  now?: Date
}): InsightCooldownState {
  const { previous, insight, now = new Date() } = params

  const dismissCount =
    (previous?.dismiss_count ?? 0) + 1

  const cooldownDays = getCooldownDays(dismissCount)
  const cooldownUntil = addDays(now, cooldownDays)

  const strongestSeverity =
    previous?.last_severity === null ||
    previous?.last_severity === undefined
      ? insight.priority
      : Math.min(previous.last_severity, insight.priority)

  return {
    dismissed_at: now.toISOString(),
    cooldown_until: cooldownUntil.toISOString(),
    dismiss_count: dismissCount,
    last_severity: strongestSeverity,

    // Preserve optional fields safely
    snoozed_until: previous?.snoozed_until ?? null,
    last_shown_at: previous?.last_shown_at ?? null,
    shown_count_today: previous?.shown_count_today ?? null,
  }
}

/* ======================================================
   ✍️ WRITE — APPLY SNOOZE (NEW, LOCKED)
   API MUST CALL ONLY THIS
====================================================== */

export function computeSnoozeState(params: {
  previous: InsightCooldownState | null
  snoozeDays: 7 | 30
  now?: Date
}): InsightCooldownState {
  const { previous, snoozeDays, now = new Date() } = params

  const snoozedUntil = addDays(now, snoozeDays)

  return {
    dismissed_at: previous?.dismissed_at ?? null,
    cooldown_until: previous?.cooldown_until ?? null,
    dismiss_count: previous?.dismiss_count ?? 0,
    last_severity: previous?.last_severity ?? null,

    snoozed_until: snoozedUntil.toISOString(),
    last_shown_at: previous?.last_shown_at ?? null,
    shown_count_today: previous?.shown_count_today ?? null,
  }
}