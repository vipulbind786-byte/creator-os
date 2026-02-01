// lib/cta/admin/versioning.ts

import { CTA_GOVERNANCE_VERSION } from "@/lib/cta/governance/versioning"
import { CTA_ANALYTICS_VERSION } from "@/lib/cta/analytics/versioning"
import { CTA_LIFECYCLE_VERSION } from "@/lib/cta/lifecycle/versioning"

/* ======================================================
   ADMIN VERSIONING

   Tracks compatibility with PART 5, 6, 7
   
   🚫 NO runtime behavior
   ✅ Version tracking only
====================================================== */

/**
 * Admin layer version
 */
export const CTA_ADMIN_VERSION = "v1" as const

/**
 * Compatible versions from dependencies
 */
export const COMPATIBLE_VERSIONS = {
  governance: ["v1"],
  analytics: ["v1"],
  lifecycle: ["v1"],
} as const

/**
 * Check if governance version is compatible
 * 
 * @param version - Governance version to check
 * @returns true if compatible
 */
export function isGovernanceCompatible(version: string): boolean {
  return COMPATIBLE_VERSIONS.governance.includes(version as "v1")
}

/**
 * Check if analytics version is compatible
 * 
 * @param version - Analytics version to check
 * @returns true if compatible
 */
export function isAnalyticsCompatible(version: string): boolean {
  return COMPATIBLE_VERSIONS.analytics.includes(version as "v1")
}

/**
 * Check if lifecycle version is compatible
 * 
 * @param version - Lifecycle version to check
 * @returns true if compatible
 */
export function isLifecycleCompatible(version: string): boolean {
  return COMPATIBLE_VERSIONS.lifecycle.includes(version as "v1")
}

/**
 * Validate all version compatibility
 * 
 * @param governanceVersion - Governance version
 * @param analyticsVersion - Analytics version
 * @param lifecycleVersion - Lifecycle version
 * @returns true if all compatible
 */
export function validateAllVersions(
  governanceVersion: string,
  analyticsVersion: string,
  lifecycleVersion: string
): boolean {
  return (
    isGovernanceCompatible(governanceVersion) &&
    isAnalyticsCompatible(analyticsVersion) &&
    isLifecycleCompatible(lifecycleVersion)
  )
}

/**
 * Get version summary
 * 
 * @returns Version information object
 */
export function getVersionSummary() {
  return {
    admin: CTA_ADMIN_VERSION,
    governance: CTA_GOVERNANCE_VERSION,
    analytics: CTA_ANALYTICS_VERSION,
    lifecycle: CTA_LIFECYCLE_VERSION,
    compatible: COMPATIBLE_VERSIONS,
  }
}
