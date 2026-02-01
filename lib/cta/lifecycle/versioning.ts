// lib/cta/lifecycle/versioning.ts

import type { LifecycleVersion } from "@/types/cta-lifecycle"
import { CTA_ANALYTICS_VERSION } from "@/lib/cta/analytics/versioning"
import { CTA_GOVERNANCE_VERSION } from "@/lib/cta/governance/versioning"

/* ======================================================
   CTA LIFECYCLE VERSIONING

   ✔ Version tracking
   ✔ Compatibility checks
   ✔ Migration support
   
   🚫 NO CTA logic
   🚫 NO behavior changes
   🚫 NEVER imported by PART 1-6
   
   📊 VERSION TRACKING ONLY
====================================================== */

/**
 * CTA Lifecycle Version
 * 
 * Increment on breaking changes to lifecycle layer.
 * Does NOT affect CTA logic.
 */
export const CTA_LIFECYCLE_VERSION = "v1" as const

/**
 * Compatible analytics versions
 * 
 * Lifecycle v1 is compatible with Analytics v1.
 */
export const COMPATIBLE_ANALYTICS_VERSIONS = ["v1"] as const

/**
 * Compatible governance versions
 * 
 * Lifecycle v1 is compatible with Governance v1.
 */
export const COMPATIBLE_GOVERNANCE_VERSIONS = ["v1"] as const

/**
 * Version metadata
 * 
 * For tracking and migration purposes.
 */
export const LIFECYCLE_VERSION_METADATA: LifecycleVersion = {
  version: CTA_LIFECYCLE_VERSION,
  compatible_analytics_versions: [...COMPATIBLE_ANALYTICS_VERSIONS],
  compatible_governance_versions: [...COMPATIBLE_GOVERNANCE_VERSIONS],
  released: "2024",
} as const

/**
 * Check if analytics version is compatible
 * 
 * Pure function - version compatibility check.
 * 
 * @param analyticsVersion - Analytics version to check
 * @returns true if compatible
 */
export function isAnalyticsVersionCompatible(
  analyticsVersion: string
): boolean {
  return COMPATIBLE_ANALYTICS_VERSIONS.includes(
    analyticsVersion as typeof COMPATIBLE_ANALYTICS_VERSIONS[number]
  )
}

/**
 * Check if governance version is compatible
 * 
 * Pure function - version compatibility check.
 * 
 * @param governanceVersion - Governance version to check
 * @returns true if compatible
 */
export function isGovernanceVersionCompatible(
  governanceVersion: string
): boolean {
  return COMPATIBLE_GOVERNANCE_VERSIONS.includes(
    governanceVersion as typeof COMPATIBLE_GOVERNANCE_VERSIONS[number]
  )
}

/**
 * Validate version compatibility
 * 
 * Pure function - validation check.
 * Warns if incompatible, does NOT crash.
 * 
 * @param analyticsVersion - Analytics version
 * @param governanceVersion - Governance version
 * @returns Validation result
 */
export function validateVersionCompatibility(
  analyticsVersion: string,
  governanceVersion: string
): {
  compatible: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  if (!isAnalyticsVersionCompatible(analyticsVersion)) {
    warnings.push(
      `Lifecycle ${CTA_LIFECYCLE_VERSION} is not compatible with Analytics ${analyticsVersion}. Expected: ${COMPATIBLE_ANALYTICS_VERSIONS.join(", ")}`
    )
  }

  if (!isGovernanceVersionCompatible(governanceVersion)) {
    warnings.push(
      `Lifecycle ${CTA_LIFECYCLE_VERSION} is not compatible with Governance ${governanceVersion}. Expected: ${COMPATIBLE_GOVERNANCE_VERSIONS.join(", ")}`
    )
  }

  return {
    compatible: warnings.length === 0,
    warnings,
  }
}

/**
 * Check if snapshot has valid versions
 * 
 * Pure function - validation check.
 * 
 * @param snapshot - Snapshot with version metadata
 * @returns true if versions are valid
 */
export function hasValidVersions(snapshot: {
  lifecycle_version?: string
  analytics_version?: string
  governance_version?: string
}): boolean {
  return (
    snapshot.lifecycle_version === CTA_LIFECYCLE_VERSION &&
    snapshot.analytics_version !== undefined &&
    snapshot.governance_version !== undefined &&
    isAnalyticsVersionCompatible(snapshot.analytics_version) &&
    isGovernanceVersionCompatible(snapshot.governance_version)
  )
}
