/* ======================================================
   CTA ADMIN TYPES — OBSERVABILITY LAYER

   🚨 CRITICAL: READ-ONLY DIAGNOSTIC SYSTEM
   
   This layer CANNOT:
   ❌ Affect CTA behavior
   ❌ Make decisions
   ❌ Optimize conversions
   ❌ Suppress CTAs
   ❌ Gate features
   
   This layer CAN ONLY:
   ✅ Observe
   ✅ Explain
   ✅ Format
   ✅ Export
====================================================== */

import type { CTAGovernanceSnapshot } from "./cta-governance"
import type { CTAAnalyticsSnapshot } from "./cta-analytics"
import type { LifecycleSnapshot } from "./cta-lifecycle"

/* ===============================
   Admin View Snapshot
=============================== */

/**
 * Complete admin view combining all diagnostic layers
 * 
 * DIAGNOSTIC ONLY - Cannot influence CTA behavior
 */
export type AdminViewSnapshot = {
  /**
   * Snapshot metadata
   */
  snapshot_id: string
  computed_at: Date
  admin_version: string

  /**
   * Governance data (PART 5)
   * Read-only view of memory & audit
   */
  governance: CTAGovernanceSnapshot | null

  /**
   * Compliance data (PART 6)
   * Read-only view of analytics & fatigue
   */
  compliance: CTAAnalyticsSnapshot | null

  /**
   * Lifecycle data (PART 7)
   * Read-only view of user classification
   */
  lifecycle: LifecycleSnapshot | null

  /**
   * Overall confidence in this snapshot
   */
  overall_confidence: ConfidenceLevel

  /**
   * Data quality warnings
   */
  warnings: string[]

  /**
   * Missing data indicators
   */
  missing_layers: string[]
}

/* ===============================
   Admin Risk Summary
=============================== */

/**
 * Human-readable risk summary
 * 
 * NOT A DECISION - For human interpretation only
 */
export type AdminRiskSummary = {
  /**
   * Fatigue level (from PART 6)
   */
  fatigue_level: "none" | "low" | "moderate" | "high" | "critical" | "unknown"

  /**
   * Lifecycle state (from PART 7)
   */
  lifecycle_state:
    | "NEW_USER"
    | "ONBOARDING"
    | "ACTIVATING"
    | "ACTIVE"
    | "POWER_USER"
    | "AT_RISK"
    | "DORMANT"
    | "CHURNED"
    | "UNKNOWN"

  /**
   * Exposure count (from PART 6)
   */
  total_exposures: number | null

  /**
   * Interaction count (from PART 6)
   */
  total_interactions: number | null

  /**
   * Dismissed as annoying flag (from PART 6)
   */
  dismissed_as_annoying: boolean

  /**
   * Human-readable summary
   */
  summary: string

  /**
   * Confidence in this summary
   */
  confidence: ConfidenceLevel

  /**
   * 🚨 CRITICAL DISCLAIMER
   */
  disclaimer: "DIAGNOSTIC ONLY - NOT A DECISION"
}

/* ===============================
   Admin Confidence Meta
=============================== */

/**
 * Confidence level for admin data
 */
export type ConfidenceLevel = "high" | "medium" | "low" | "unknown"

/**
 * Detailed confidence metadata
 */
export type AdminConfidenceMeta = {
  /**
   * Overall confidence
   */
  level: ConfidenceLevel

  /**
   * Confidence per layer
   */
  by_layer: {
    governance: ConfidenceLevel
    compliance: ConfidenceLevel
    lifecycle: ConfidenceLevel
  }

  /**
   * Missing data count
   */
  missing_data_points: number

  /**
   * Total data points available
   */
  total_data_points: number

  /**
   * Human-readable explanation
   */
  explanation: string
}

/* ===============================
   Export Metadata
=============================== */

/**
 * Metadata for exported admin data
 */
export type ExportMetadata = {
  /**
   * Export timestamp
   */
  exported_at: Date

  /**
   * Export format
   */
  format: "json" | "csv" | "pdf_metadata"

  /**
   * Admin version
   */
  admin_version: string

  /**
   * Governance version
   */
  governance_version: string

  /**
   * Analytics version
   */
  analytics_version: string

  /**
   * Lifecycle version
   */
  lifecycle_version: string

  /**
   * Legal disclaimer
   */
  disclaimer: string

  /**
   * Data retention notice
   */
  retention_notice: string
}

/* ===============================
   Explanation Context
=============================== */

/**
 * Context for explaining why a CTA was shown
 * 
 * USES ALREADY-CALCULATED DATA ONLY
 */
export type CTAExplanationContext = {
  /**
   * CTA intent that was shown
   */
  cta_intent: string

  /**
   * Subscription status at time of CTA
   */
  subscription_status: string

  /**
   * Governance state at time of CTA
   */
  governance_state: {
    was_suppressed: boolean
    suppression_reason: string | null
    cooldown_active: boolean
  }

  /**
   * Compliance state at time of CTA
   */
  compliance_state: {
    fatigue_level: string
    exposure_count: number
    interaction_count: number
  }

  /**
   * Lifecycle state at time of CTA
   */
  lifecycle_state: {
    state: string
    confidence: ConfidenceLevel
  }

  /**
   * Human-readable explanation
   */
  explanation: string

  /**
   * Confidence in explanation
   */
  confidence: ConfidenceLevel
}
