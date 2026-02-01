// lib/cta/analytics/compliance.ts

import type { CTAMemoryRecord } from "@/types/cta-governance"
import type { CTAComplianceFlags } from "@/types/cta-analytics"

/* ======================================================
   CTA COMPLIANCE CHECKS — FLAG ONLY

   ✔ Detect risks
   ✔ Flag for human review
   ✔ Audit trail
   
   🚫 NO resolution logic
   🚫 NO suppression logic
   🚫 NO auto-mitigation
   🚫 NEVER imported by PART 1-5
   
   📊 FLAG ONLY, NEVER RESOLVE
====================================================== */

/* ===============================
   Risk Detection
=============================== */

/**
 * Detect excessive exposure risk
 * 
 * Pure function - boolean check only.
 * Threshold: > 15 exposures
 * 
 * @param record - Memory record
 * @returns true if excessive exposure detected
 */
function detectExcessiveExposure(record: CTAMemoryRecord): boolean {
  return record.exposure_count > 15
}

/**
 * Detect repeated pressure risk
 * 
 * Pure function - boolean check only.
 * Heuristic: > 10 exposures in < 7 days
 * 
 * @param record - Memory record
 * @param now - Current timestamp
 * @returns true if repeated pressure detected
 */
function detectRepeatedPressure(
  record: CTAMemoryRecord,
  now: Date
): boolean {
  const daysSinceFirst =
    (now.getTime() - record.first_seen_at.getTime()) /
    (1000 * 60 * 60 * 24)

  return record.exposure_count > 10 && daysSinceFirst < 7
}

/**
 * Detect ignored dismissal risk
 * 
 * Pure function - boolean check only.
 * Risk: User dismissed but still seeing CTA
 * 
 * @param record - Memory record
 * @returns true if ignored dismissal detected
 */
function detectIgnoredDismissal(record: CTAMemoryRecord): boolean {
  // If dismissed and still has exposures after dismissal
  return (
    record.last_action === "dismissed" &&
    record.dismissed_at !== undefined &&
    record.last_seen_at > record.dismissed_at
  )
}

/**
 * Detect accessibility risk
 * 
 * Pure function - boolean check only.
 * Risk: No a11y contract version recorded
 * 
 * @param record - Memory record
 * @returns true if accessibility risk detected
 */
function detectAccessibilityRisk(record: CTAMemoryRecord): boolean {
  return !record.a11y_contract_version
}

/**
 * Detect dark pattern risk
 * 
 * Pure function - boolean check only.
 * Risk: Dismissed as "annoying" + high exposure
 * 
 * @param record - Memory record
 * @returns true if dark pattern risk detected
 */
function detectDarkPatternRisk(record: CTAMemoryRecord): boolean {
  return (
    record.dismiss_reason === "annoying" &&
    record.exposure_count > 5
  )
}

/* ===============================
   Severity Calculation
=============================== */

/**
 * Calculate compliance severity
 * 
 * Pure function - severity level only.
 * Based on number and type of flags.
 * 
 * @param flags - Risk flags
 * @returns Severity level
 */
function calculateComplianceSeverity(
  flags: ReadonlyArray<
    | "excessive_exposure"
    | "repeated_pressure"
    | "ignored_dismissal"
    | "accessibility_risk"
    | "dark_pattern_risk"
  >
): "low" | "medium" | "high" | "critical" {
  const flagCount = flags.length

  // Critical: Dark pattern or ignored dismissal
  if (
    flags.includes("dark_pattern_risk") ||
    flags.includes("ignored_dismissal")
  ) {
    return "critical"
  }

  // High: Multiple flags or repeated pressure
  if (flagCount >= 3 || flags.includes("repeated_pressure")) {
    return "high"
  }

  // Medium: 2 flags
  if (flagCount === 2) {
    return "medium"
  }

  // Low: 1 flag
  return "low"
}

/* ===============================
   Compliance Flag Generation
=============================== */

/**
 * Generate compliance flags for record
 * 
 * Pure function - flags risks only.
 * NO resolution, NO suppression.
 * 
 * @param record - Memory record
 * @param now - Current timestamp
 * @returns Compliance flags
 */
export function generateComplianceFlags(
  record: CTAMemoryRecord,
  now: Date
): CTAComplianceFlags | null {
  const flags: Array<
    | "excessive_exposure"
    | "repeated_pressure"
    | "ignored_dismissal"
    | "accessibility_risk"
    | "dark_pattern_risk"
  > = []

  // Detect risks
  if (detectExcessiveExposure(record)) {
    flags.push("excessive_exposure")
  }

  if (detectRepeatedPressure(record, now)) {
    flags.push("repeated_pressure")
  }

  if (detectIgnoredDismissal(record)) {
    flags.push("ignored_dismissal")
  }

  if (detectAccessibilityRisk(record)) {
    flags.push("accessibility_risk")
  }

  if (detectDarkPatternRisk(record)) {
    flags.push("dark_pattern_risk")
  }

  // No flags = no compliance issue
  if (flags.length === 0) {
    return null
  }

  // Calculate days active
  const daysSinceFirst =
    (now.getTime() - record.first_seen_at.getTime()) /
    (1000 * 60 * 60 * 24)

  return {
    flags,
    severity: calculateComplianceSeverity(flags),
    evidence: {
      exposure_count: record.exposure_count,
      dismissal_count: record.last_action === "dismissed" ? 1 : 0,
      days_active: Math.floor(daysSinceFirst),
      last_action: record.last_action,
    },
    flagged_at: now,
  }
}

/**
 * Generate compliance flags for multiple records
 * 
 * Pure function - maps over records.
 * Filters out null (no flags).
 * 
 * @param records - Memory records
 * @param now - Current timestamp
 * @returns Array of compliance flags
 */
export function generateComplianceFlagsForRecords(
  records: CTAMemoryRecord[],
  now: Date
): CTAComplianceFlags[] {
  return records
    .map((record) => generateComplianceFlags(record, now))
    .filter((flags): flags is CTAComplianceFlags => flags !== null)
}

/* ===============================
   Compliance Filtering (Read-Only)
=============================== */

/**
 * Filter flags by severity
 * 
 * Pure function - filtering only.
 * For reporting, NOT for suppression.
 * 
 * @param flags - Compliance flags
 * @param minSeverity - Minimum severity to include
 * @returns Filtered flags
 */
export function filterBySeverity(
  flags: CTAComplianceFlags[],
  minSeverity: "low" | "medium" | "high" | "critical"
): CTAComplianceFlags[] {
  const severityOrder = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  }

  const minLevel = severityOrder[minSeverity]

  return flags.filter((f) => severityOrder[f.severity] >= minLevel)
}

/**
 * Count flags by severity
 * 
 * Pure function - counting only.
 * 
 * @param flags - Compliance flags
 * @returns Count by severity
 */
export function countBySeverity(flags: CTAComplianceFlags[]): Record<
  "low" | "medium" | "high" | "critical",
  number
> {
  const counts = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  }

  flags.forEach((f) => {
    counts[f.severity]++
  })

  return counts
}

/* ===============================
   Compliance Summary
=============================== */

/**
 * Generate compliance summary
 * 
 * Pure function - aggregation only.
 * For audit reports, NOT for auto-action.
 * 
 * @param flags - Compliance flags
 * @returns Summary statistics
 */
export function generateComplianceSummary(flags: CTAComplianceFlags[]): {
  total_flagged: number
  by_severity: Record<"low" | "medium" | "high" | "critical", number>
  critical_count: number
  requires_immediate_review: boolean
} {
  const total_flagged = flags.length

  const by_severity = countBySeverity(flags)

  const critical_count = by_severity.critical

  // Requires review if any critical flags
  const requires_immediate_review = critical_count > 0

  return {
    total_flagged,
    by_severity,
    critical_count,
    requires_immediate_review,
  }
}
