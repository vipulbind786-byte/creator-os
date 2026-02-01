/* ======================================================
   CTA GOVERNANCE TYPES — DATA SHAPES ONLY

   ✔ Observability
   ✔ Auditability
   ✔ Future-proofing
   
   🚫 NO logic
   🚫 NO behavior
   🚫 NO CTA decisions
   🚫 NEVER imported by PART 1-4
====================================================== */

import type { CTAIntent } from "./cta"
import type { CTASurface } from "@/components/cta/surfaces"

/* ===============================
   CTA Memory Record
=============================== */

/**
 * Memory record for a single CTA exposure
 * 
 * Used for:
 * - Tracking exposure frequency
 * - User fatigue detection
 * - Audit trails
 * - A/B testing context
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 Read-only observability
 */
export type CTAMemoryRecord = {
  /**
   * CTA system version
   * For migration tracking
   */
  cta_version: string

  /**
   * Intent that was shown
   */
  intent: CTAIntent

  /**
   * Surface where CTA appeared
   */
  surface: CTASurface

  /**
   * First time this intent was shown to user
   */
  first_seen_at: Date

  /**
   * Most recent exposure
   */
  last_seen_at: Date

  /**
   * Total number of times shown
   */
  exposure_count: number

  /**
   * Last action taken by user
   * null if never interacted
   */
  last_action: "clicked" | "dismissed" | null

  /**
   * When user dismissed (if applicable)
   */
  dismissed_at?: Date

  /**
   * Why user dismissed
   */
  dismiss_reason?: "not_relevant" | "later" | "annoying"

  /**
   * A/B test or experiment ID
   * For correlation analysis
   */
  experiment_id?: string

  /**
   * Accessibility contract version used
   * For compliance tracking
   */
  a11y_contract_version?: string
}

/* ===============================
   CTA Event
=============================== */

/**
 * Event emitted during CTA lifecycle
 * 
 * Used for:
 * - Analytics
 * - Debugging
 * - Compliance logs
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export type CTAEvent = {
  /**
   * Event type
   */
  type: "viewed" | "clicked" | "dismissed" | "failed"

  /**
   * When event occurred
   */
  timestamp: Date

  /**
   * Read-only context
   * NO decision-making allowed
   */
  context: Readonly<{
    intent: CTAIntent
    surface: CTASurface
    exposure_count: number
    user_id?: string
    session_id?: string
    experiment_id?: string
  }>
}

/* ===============================
   CTA Governance Snapshot
=============================== */

/**
 * Point-in-time snapshot for governance review
 * 
 * Used for:
 * - Human review
 * - Compliance audits
 * - Pattern detection
 * 
 * 🚫 MUST NOT affect CTA logic
 * 📊 Read-only analysis
 */
export type CTAGovernanceSnapshot = {
  /**
   * Intent being analyzed
   */
  intent: CTAIntent

  /**
   * Surface being analyzed
   */
  surface: CTASurface

  /**
   * Total exposures
   */
  exposure_count: number

  /**
   * Last action taken
   */
  last_action: "clicked" | "dismissed" | null

  /**
   * Read-only risk flags
   * For human review only
   */
  risk_flags: ReadonlyArray<
    | "excessive_exposure"
    | "user_fatigue"
    | "low_engagement"
    | "high_dismissal_rate"
    | "accessibility_concern"
  >
}

/* ===============================
   Dismissal Metadata
=============================== */

/**
 * Metadata about why user dismissed CTA
 * 
 * Used for:
 * - UX improvement
 * - Pattern analysis
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export type CTADismissalMetadata = {
  /**
   * Reason for dismissal
   */
  reason: "not_relevant" | "later" | "annoying"

  /**
   * When dismissed
   */
  dismissed_at: Date

  /**
   * How many times shown before dismissal
   */
  exposure_count_at_dismissal: number

  /**
   * Optional user feedback
   */
  feedback?: string
}
