// lib/cta/analytics/versioning.ts

import type { CTAAnalyticsVersion } from "@/types/cta-analytics"
import { CTA_GOVERNANCE_VERSION } from "@/lib/cta/governance/versioning"

/* ======================================================
   CTA ANALYTICS VERSIONING

   ✔ Version tracking
   ✔ Compatibility checks
   ✔ Migration support
   
   🚫 NO CTA logic
   🚫 NO behavior changes
   🚫 NEVER imported by PART 1-5
   
   📊 VERSION TRACKING ONLY
====================================================== */

/**
 * CTA Analytics Version
 * 
 * Increment on breaking changes to analytics layer.
 * Does NOT affect CTA logic.
 */
export const CTA_ANALYTICS_VERSION = "v1" as const

/**
 * Compatible governance versions
 * 
 * Analytics v1 is compatible with Governance v1.
 */
export const COMPATIBLE_GOVERNANCE_VERSIONS = ["v1"] as const

/**
 * Version metadata
 * 
 * For tracking and migration purposes.
 */
export const ANALYTICS_VERSION_METADATA: CTAAnalyticsVersion = {
  version: CTA_ANALYTICS_VERSION,
  compatible_governance_versions: [...COMPATIBLE_GOVERNANCE_VERSIONS],
  released: "2024",
} as const

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
 * @param governanceVersion - Governance version
 * @returns Validation result
 */
export function validateVersionCompatibility(governanceVersion: string): {
  compatible: boolean
  warning: string | null
} {
  const compatible = isGovernanceVersionCompatible(governanceVersion)

  if (!compatible) {
    return {
      compatible: false,
      warning: `Analytics ${CTA_ANALYTICS_VERSION} is not compatible with Governance ${governanceVersion}. Expected: ${COMPATIBLE_GOVERNANCE_VERSIONS.join(", ")}`,
    }
  }

  return {
    compatible: true,
    warning: null,
  }
}

/**
 * Attach analytics version to snapshot
 * 
 * Pure function - adds version metadata.
 * 
 * @param snapshot - Snapshot object
 * @returns Snapshot with version metadata
 */
export function attachAnalyticsVersion<T extends Record<string, unknown>>(
  snapshot: T
): T & { analytics_version: string; governance_version: string } {
  return {
    ...snapshot,
    analytics_version: CTA_ANALYTICS_VERSION,
    governance_version: CTA_GOVERNANCE_VERSION,
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
  analytics_version?: string
  governance_version?: string
}): boolean {
  return (
    snapshot.analytics_version === CTA_ANALYTICS_VERSION &&
    snapshot.governance_version !== undefined &&
    isGovernanceVersionCompatible(snapshot.governance_version)
  )
}
