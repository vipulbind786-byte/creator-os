/* ======================================================
   CTA LIFECYCLE TYPES — DIAGNOSTIC ONLY

   ✔ User state classification
   ✔ Read-only observation
   ✔ Audit-grade snapshots
   
   🚫 NO decision-making
   🚫 NO CTA influence
   🚫 NO optimization
   🚫 NEVER imported by PART 1-6
====================================================== */

/* ===============================
   Lifecycle State
=============================== */

/**
 * User lifecycle state classification
 * 
 * EXACTLY ONE state per user.
 * NO combinations allowed.
 * 
 * Priority order (top wins):
 * 1. CHURNED - User has left
 * 2. DORMANT - Inactive for extended period
 * 3. AT_RISK - Showing churn signals
 * 4. POWER_USER - High engagement
 * 5. ACTIVE - Regular usage
 * 6. ACTIVATING - Building habits
 * 7. ONBOARDING - Learning product
 * 8. NEW_USER - Just signed up
 */
export type LifecycleState =
  | "NEW_USER"
  | "ONBOARDING"
  | "ACTIVATING"
  | "ACTIVE"
  | "POWER_USER"
  | "AT_RISK"
  | "DORMANT"
  | "CHURNED"

/* ===============================
   Confidence Level
=============================== */

/**
 * Confidence in lifecycle classification
 * 
 * Decreases when:
 * - Signals are missing
 * - Signals are conflicting
 * - Many unknowns present
 */
export type ConfidenceLevel = "high" | "medium" | "low"

/* ===============================
   Signal Bucket
=============================== */

/**
 * Normalized signal bucket
 * 
 * unknown ≠ zero
 * unknown = data not available
 */
export type SignalBucket = "low" | "medium" | "high" | "unknown"

/* ===============================
   Lifecycle Signal Input
=============================== */

/**
 * Aggregated signals for lifecycle classification
 * 
 * All fields OPTIONAL - defensive against missing data.
 * Sources: PART 5 (Governance) + PART 6 (Analytics)
 * 
 * ⚠️ NO raw events, NO click-level data, NO UI events
 */
export type LifecycleSignalInput = {
  /**
   * Days since user first seen
   * From PART 5 governance data
   */
  days_since_first_seen?: number

  /**
   * Days since last activity
   * From PART 5 governance data
   */
  days_since_last_activity?: number

  /**
   * Total CTA exposures
   * From PART 5 governance data
   */
  total_exposures?: number

  /**
   * Total CTA interactions (clicks + dismissals)
   * From PART 5 governance data
   */
  total_interactions?: number

  /**
   * Dismissal count
   * From PART 5 governance data
   */
  dismissal_count?: number

  /**
   * Dismissed as "annoying"
   * From PART 5 governance data
   */
  dismissed_as_annoying?: boolean

  /**
   * Fatigue severity
   * From PART 6 analytics
   */
  fatigue_severity?: "none" | "low" | "moderate" | "high" | "critical"

  /**
   * Has compliance flags
   * From PART 6 analytics
   */
  has_compliance_flags?: boolean

  /**
   * Subscription status
   * From PART 1 (type-only import)
   */
  subscription_status?:
    | "free"
    | "trialing"
    | "active"
    | "past_due"
    | "expired"
    | "cancelled"
}

/* ===============================
   Lifecycle Snapshot
=============================== */

/**
 * Complete lifecycle diagnostic snapshot
 * 
 * Pure data - no decisions, no actions.
 * For audit and reporting only.
 */
export type LifecycleSnapshot = {
  /**
   * Classified lifecycle state
   */
  state: LifecycleState

  /**
   * Confidence in classification
   */
  confidence: ConfidenceLevel

  /**
   * Signals used in classification
   * For audit trail
   */
  signals_used: ReadonlyArray<{
    name: string
    value: string | number | boolean
    bucket?: SignalBucket
  }>

  /**
   * Signals missing (reduced confidence)
   */
  signals_missing: ReadonlyArray<string>

  /**
   * Timestamp of classification
   */
  computed_at: Date

  /**
   * Lifecycle version
   */
  lifecycle_version: string

  /**
   * Compatible analytics version
   */
  analytics_version: string

  /**
   * Compatible governance version
   */
  governance_version: string
}

/* ===============================
   Lifecycle Version
=============================== */

/**
 * Lifecycle system version
 */
export type LifecycleVersion = {
  /**
   * Version string
   */
  version: string

  /**
   * Compatible analytics versions
   */
  compatible_analytics_versions: string[]

  /**
   * Compatible governance versions
   */
  compatible_governance_versions: string[]

  /**
   * Release date
   */
  released: string
}
