// lib/cta/admin/compose.ts

import type {
  AdminViewSnapshot,
  ConfidenceLevel,
} from "@/types/cta-admin"
import type { CTAGovernanceSnapshot } from "@/types/cta-governance"
import type { CTAAnalyticsSnapshot } from "@/types/cta-analytics"
import type { LifecycleSnapshot } from "@/types/cta-lifecycle"

/* ======================================================
   ADMIN SNAPSHOT COMPOSER

   🚨 CRITICAL: READ-ONLY AGGREGATION
   
   This module CANNOT:
   ❌ Make decisions
   ❌ Affect CTA behavior
   ❌ Suppress CTAs
   ❌ Optimize anything
   
   This module CAN ONLY:
   ✅ Combine snapshots from PART 5, 6, 7
   ✅ Calculate confidence
   ✅ Detect missing data
====================================================== */

/**
 * Build complete admin snapshot
 * 
 * Combines data from all diagnostic layers.
 * Pure aggregation - no decisions.
 * 
 * @param governance - Governance snapshot from PART 5 (optional)
 * @param compliance - Analytics snapshot from PART 6 (optional)
 * @param lifecycle - Lifecycle snapshot from PART 7 (optional)
 * @param now - Current timestamp for snapshot
 * @returns Complete admin view snapshot
 * 
 * @example
 * const snapshot = buildAdminSnapshot(
 *   governanceData,
 *   complianceData,
 *   lifecycleData,
 *   new Date()
 * )
 */
export function buildAdminSnapshot(
  governance: CTAGovernanceSnapshot | null,
  compliance: CTAAnalyticsSnapshot | null,
  lifecycle: LifecycleSnapshot | null,
  now: Date
): AdminViewSnapshot {
  // Generate unique snapshot ID
  const snapshot_id = generateSnapshotId(now)

  // Calculate overall confidence
  const overall_confidence = calculateOverallConfidence(
    governance,
    compliance,
    lifecycle
  )

  // Detect missing layers
  const missing_layers = detectMissingLayers(governance, compliance, lifecycle)

  // Generate warnings
  const warnings = generateWarnings(governance, compliance, lifecycle)

  return {
    snapshot_id,
    computed_at: now,
    admin_version: "v1",
    governance,
    compliance,
    lifecycle,
    overall_confidence,
    warnings,
    missing_layers,
  }
}

/* ===============================
   Helper Functions (Pure)
=============================== */

/**
 * Generate unique snapshot ID
 * 
 * @param now - Current timestamp
 * @returns Snapshot ID
 */
function generateSnapshotId(now: Date): string {
  const timestamp = now.getTime()
  const random = Math.random().toString(36).substring(2, 9)
  return `admin_${timestamp}_${random}`
}

/**
 * Calculate overall confidence level
 * 
 * Based on availability and quality of data from all layers.
 * 
 * @param governance - Governance snapshot
 * @param compliance - Compliance snapshot
 * @param lifecycle - Lifecycle snapshot
 * @returns Overall confidence level
 */
function calculateOverallConfidence(
  governance: CTAGovernanceSnapshot | null,
  compliance: CTAAnalyticsSnapshot | null,
  lifecycle: LifecycleSnapshot | null
): ConfidenceLevel {
  const layers = [governance, compliance, lifecycle]
  const available = layers.filter((layer) => layer !== null).length

  // All 3 layers available
  if (available === 3) {
    // Check lifecycle confidence if available
    if (lifecycle && lifecycle.confidence === "low") {
      return "medium"
    }
    return "high"
  }

  // 2 layers available
  if (available === 2) {
    return "medium"
  }

  // 1 or 0 layers available
  if (available === 1) {
    return "low"
  }

  return "unknown"
}

/**
 * Detect missing diagnostic layers
 * 
 * @param governance - Governance snapshot
 * @param compliance - Compliance snapshot
 * @param lifecycle - Lifecycle snapshot
 * @returns Array of missing layer names
 */
function detectMissingLayers(
  governance: CTAGovernanceSnapshot | null,
  compliance: CTAAnalyticsSnapshot | null,
  lifecycle: LifecycleSnapshot | null
): string[] {
  const missing: string[] = []

  if (!governance) {
    missing.push("governance")
  }

  if (!compliance) {
    missing.push("compliance")
  }

  if (!lifecycle) {
    missing.push("lifecycle")
  }

  return missing
}

/**
 * Generate data quality warnings
 * 
 * @param governance - Governance snapshot
 * @param compliance - Compliance snapshot
 * @param lifecycle - Lifecycle snapshot
 * @returns Array of warning messages
 */
function generateWarnings(
  governance: CTAGovernanceSnapshot | null,
  compliance: CTAAnalyticsSnapshot | null,
  lifecycle: LifecycleSnapshot | null
): string[] {
  const warnings: string[] = []

  // Missing layer warnings
  if (!governance) {
    warnings.push("Governance data unavailable - memory and audit context missing")
  }

  if (!compliance) {
    warnings.push("Compliance data unavailable - fatigue and analytics context missing")
  }

  if (!lifecycle) {
    warnings.push("Lifecycle data unavailable - user classification context missing")
  }

  // Low confidence warning
  if (lifecycle && lifecycle.confidence === "low") {
    warnings.push(
      `Lifecycle classification has low confidence (${lifecycle.signals_missing.length} signals missing)`
    )
  }

  // Compliance flags warning
  if (compliance && compliance.compliance_flags.length > 0) {
    const criticalFlags = compliance.compliance_flags.filter(
      (flag) => flag.severity === "critical"
    )
    if (criticalFlags.length > 0) {
      warnings.push(
        `${criticalFlags.length} critical compliance flag(s) detected - human review recommended`
      )
    }
  }

  return warnings
}
