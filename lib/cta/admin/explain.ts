// lib/cta/admin/explain.ts

import type {
  CTAExplanationContext,
  ConfidenceLevel,
  AdminViewSnapshot,
} from "@/types/cta-admin"
import type { CTAIntent } from "@/types/cta"

/* ======================================================
   CTA EXPLANATION ENGINE

   🚨 CRITICAL: USES ALREADY-CALCULATED DATA ONLY
   
   This module CANNOT:
   ❌ Make decisions
   ❌ Calculate new metrics
   ❌ Affect CTA behavior
   ❌ Recommend actions
   
   This module CAN ONLY:
   ✅ Format existing data
   ✅ Generate human-readable explanations
   ✅ Combine context from snapshots
====================================================== */

/**
 * Explain why a CTA was shown
 * 
 * Uses already-calculated data from admin snapshot.
 * Pure formatting - no new calculations.
 * 
 * @param snapshot - Admin view snapshot
 * @param cta_intent - CTA intent that was shown
 * @param subscription_status - Subscription status at time of CTA
 * @returns Human-readable explanation context
 * 
 * @example
 * const explanation = explainWhyCTAWasShown(
 *   adminSnapshot,
 *   "upgrade_to_pro",
 *   "free"
 * )
 * console.log(explanation.explanation)
 */
export function explainWhyCTAWasShown(
  snapshot: AdminViewSnapshot,
  cta_intent: CTAIntent,
  subscription_status: string
): CTAExplanationContext {
  // Extract governance state
  const governance_state = extractGovernanceState(snapshot)

  // Extract compliance state
  const compliance_state = extractComplianceState(snapshot)

  // Extract lifecycle state
  const lifecycle_state = extractLifecycleState(snapshot)

  // Generate human-readable explanation
  const explanation = generateExplanation(
    cta_intent,
    subscription_status,
    governance_state,
    compliance_state,
    lifecycle_state
  )

  // Calculate confidence in explanation
  const confidence = snapshot.overall_confidence

  return {
    cta_intent,
    subscription_status,
    governance_state,
    compliance_state,
    lifecycle_state,
    explanation,
    confidence,
  }
}

/* ===============================
   State Extraction (Pure)
=============================== */

/**
 * Extract governance state from snapshot
 */
function extractGovernanceState(snapshot: AdminViewSnapshot) {
  if (!snapshot.governance) {
    return {
      was_suppressed: false,
      suppression_reason: null,
      cooldown_active: false,
    }
  }

  // Governance snapshot doesn't track suppression directly
  // This is read-only observation
  return {
    was_suppressed: false,
    suppression_reason: null,
    cooldown_active: false,
  }
}

/**
 * Extract compliance state from snapshot
 */
function extractComplianceState(snapshot: AdminViewSnapshot) {
  if (!snapshot.compliance) {
    return {
      fatigue_level: "unknown",
      exposure_count: 0,
      interaction_count: 0,
    }
  }

  // Extract fatigue signals if available
  const fatigue = snapshot.compliance.fatigue_signals[0]
  const fatigue_level = fatigue ? fatigue.severity : "unknown"

  // Extract exposure/interaction counts
  const exposure_count = snapshot.compliance.exposure_stats.total_exposures
  const interaction_count = snapshot.compliance.action_stats.total_clicks

  return {
    fatigue_level,
    exposure_count,
    interaction_count,
  }
}

/**
 * Extract lifecycle state from snapshot
 */
function extractLifecycleState(snapshot: AdminViewSnapshot) {
  if (!snapshot.lifecycle) {
    return {
      state: "UNKNOWN",
      confidence: "unknown" as ConfidenceLevel,
    }
  }

  return {
    state: snapshot.lifecycle.state,
    confidence: snapshot.lifecycle.confidence,
  }
}

/* ===============================
   Explanation Generation (Pure)
=============================== */

/**
 * Generate human-readable explanation
 * 
 * Pure string formatting based on existing data.
 */
function generateExplanation(
  cta_intent: CTAIntent,
  subscription_status: string,
  governance_state: {
    was_suppressed: boolean
    suppression_reason: string | null
    cooldown_active: boolean
  },
  compliance_state: {
    fatigue_level: string
    exposure_count: number
    interaction_count: number
  },
  lifecycle_state: {
    state: string
    confidence: ConfidenceLevel
  }
): string {
  const parts: string[] = []

  // Intent and subscription context
  parts.push(
    `CTA intent "${cta_intent}" was shown to a user with subscription status "${subscription_status}".`
  )

  // Lifecycle context
  if (lifecycle_state.state !== "UNKNOWN") {
    parts.push(
      `User is classified as "${lifecycle_state.state}" (confidence: ${lifecycle_state.confidence}).`
    )
  } else {
    parts.push("User lifecycle state is unknown due to missing data.")
  }

  // Compliance context
  if (compliance_state.exposure_count > 0) {
    parts.push(
      `User has seen CTAs ${compliance_state.exposure_count} time(s) and interacted ${compliance_state.interaction_count} time(s).`
    )
  }

  if (compliance_state.fatigue_level !== "unknown") {
    parts.push(`Fatigue level: ${compliance_state.fatigue_level}.`)
  }

  // Governance context
  if (governance_state.was_suppressed) {
    parts.push(
      `Note: CTA was suppressed due to: ${governance_state.suppression_reason}.`
    )
  }

  if (governance_state.cooldown_active) {
    parts.push("Cooldown period is active.")
  }

  // Disclaimer
  parts.push(
    "\n⚠️ DIAGNOSTIC ONLY: This explanation is for human review and does not represent an automated decision."
  )

  return parts.join(" ")
}

/**
 * Get short summary of explanation
 * 
 * @param context - Explanation context
 * @returns Short summary string
 */
export function getExplanationSummary(
  context: CTAExplanationContext
): string {
  return `${context.cta_intent} shown to ${context.subscription_status} user (${context.lifecycle_state.state})`
}
