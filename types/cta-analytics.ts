/* ======================================================
   CTA ANALYTICS TYPES — DATA SHAPES ONLY

   ✔ Observability
   ✔ Compliance reporting
   ✔ Audit-grade data
   
   🚫 NO logic
   🚫 NO decisions
   🚫 NO recommendations
   🚫 NEVER imported by PART 1-5
====================================================== */

import type { CTAIntent } from "./cta"
import type { CTASurface } from "@/components/cta/surfaces"

/* ===============================
   Time Window
=============================== */

/**
 * Time window for analytics aggregation
 */
export type CTATimeWindow = {
  /**
   * Start of time window
   */
  start: Date

  /**
   * End of time window
   */
  end: Date

  /**
   * Duration in milliseconds
   */
  duration_ms: number
}

/* ===============================
   Exposure Statistics
=============================== */

/**
 * Aggregated exposure statistics
 * 
 * Pure counts and percentages.
 * NO thresholds, NO decisions.
 */
export type CTAExposureStats = {
  /**
   * Total number of exposures
   */
  total_exposures: number

  /**
   * Unique users exposed
   */
  unique_users: number

  /**
   * Average exposures per user
   */
  avg_exposures_per_user: number

  /**
   * Breakdown by intent
   */
  by_intent: Record<CTAIntent, number>

  /**
   * Breakdown by surface
   */
  by_surface: Record<CTASurface, number>

  /**
   * Time window
   */
  time_window: CTATimeWindow
}

/* ===============================
   Action Statistics
=============================== */

/**
 * Aggregated action statistics
 * 
 * Pure counts and ratios.
 * NO interpretation, NO recommendations.
 */
export type CTAActionStats = {
  /**
   * Total clicks
   */
  total_clicks: number

  /**
   * Total dismissals
   */
  total_dismissals: number

  /**
   * Click-through rate (0-1)
   */
  click_rate: number

  /**
   * Dismissal rate (0-1)
   */
  dismissal_rate: number

  /**
   * No-action rate (0-1)
   */
  no_action_rate: number

  /**
   * Breakdown by intent
   */
  by_intent: Record<
    CTAIntent,
    {
      clicks: number
      dismissals: number
      no_action: number
    }
  >

  /**
   * Time window
   */
  time_window: CTATimeWindow
}

/* ===============================
   Dismissal Statistics
=============================== */

/**
 * Aggregated dismissal statistics
 * 
 * Pure counts by reason.
 * NO interpretation.
 */
export type CTADismissalStats = {
  /**
   * Total dismissals
   */
  total: number

  /**
   * Breakdown by reason
   */
  by_reason: {
    not_relevant: number
    later: number
    annoying: number
  }

  /**
   * Percentage by reason (0-1)
   */
  percentage_by_reason: {
    not_relevant: number
    later: number
    annoying: number
  }

  /**
   * Average exposures before dismissal
   */
  avg_exposures_before_dismissal: number

  /**
   * Time window
   */
  time_window: CTATimeWindow
}

/* ===============================
   Fatigue Signals
=============================== */

/**
 * User fatigue signals
 * 
 * Descriptive severity levels.
 * NO mitigation logic, NO suppression.
 */
export type CTAFatigueSignals = {
  /**
   * Severity level (descriptive only)
   */
  severity: "none" | "low" | "moderate" | "high" | "critical"

  /**
   * Exposure count
   */
  exposure_count: number

  /**
   * Days since first exposure
   */
  days_since_first_exposure: number

  /**
   * Has user interacted?
   */
  has_interaction: boolean

  /**
   * Dismissed as annoying?
   */
  dismissed_as_annoying: boolean

  /**
   * Context for human review
   */
  context: {
    intent: CTAIntent
    surface: CTASurface
    last_seen_at: Date
  }
}

/* ===============================
   Compliance Flags
=============================== */

/**
 * Compliance risk flags
 * 
 * Flags risks, does NOT resolve them.
 * For human review only.
 */
export type CTAComplianceFlags = {
  /**
   * Risk flags detected
   */
  flags: ReadonlyArray<
    | "excessive_exposure"
    | "repeated_pressure"
    | "ignored_dismissal"
    | "accessibility_risk"
    | "dark_pattern_risk"
  >

  /**
   * Severity (for prioritization)
   */
  severity: "low" | "medium" | "high" | "critical"

  /**
   * Evidence (for audit trail)
   */
  evidence: {
    exposure_count: number
    dismissal_count: number
    days_active: number
    last_action: "clicked" | "dismissed" | null
  }

  /**
   * Timestamp
   */
  flagged_at: Date
}

/* ===============================
   Analytics Snapshot
=============================== */

/**
 * Complete analytics snapshot
 * 
 * Aggregated view for reporting.
 * Pure data, no decisions.
 */
export type CTAAnalyticsSnapshot = {
  /**
   * Analytics version
   */
  analytics_version: string

  /**
   * Governance version (from PART 5)
   */
  governance_version: string

  /**
   * Snapshot timestamp
   */
  snapshot_at: Date

  /**
   * Exposure statistics
   */
  exposure_stats: CTAExposureStats

  /**
   * Action statistics
   */
  action_stats: CTAActionStats

  /**
   * Dismissal statistics
   */
  dismissal_stats: CTADismissalStats

  /**
   * Fatigue signals (per user)
   */
  fatigue_signals: CTAFatigueSignals[]

  /**
   * Compliance flags
   */
  compliance_flags: CTAComplianceFlags[]
}

/* ===============================
   Analytics Version
=============================== */

/**
 * Analytics system version
 */
export type CTAAnalyticsVersion = {
  /**
   * Version string
   */
  version: string

  /**
   * Compatible governance versions
   */
  compatible_governance_versions: string[]

  /**
   * Release date
   */
  released: string
}
