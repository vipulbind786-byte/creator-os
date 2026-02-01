// lib/cta/governance/versioning.ts

/* ======================================================
   CTA GOVERNANCE VERSIONING

   ✔ Version tracking
   ✔ Migration support
   ✔ Metadata attachment
   
   🚫 NO CTA logic
   🚫 NO behavior changes
   🚫 NEVER imported by PART 1-4
   
   📊 OBSERVATIONAL ONLY
====================================================== */

/**
 * CTA Governance Version
 * 
 * Increment on breaking changes to governance layer.
 * Does NOT affect CTA logic.
 */
export const CTA_GOVERNANCE_VERSION = "v1" as const

/**
 * Version metadata
 * 
 * For tracking and migration purposes.
 */
export const GOVERNANCE_VERSION_METADATA = {
  version: CTA_GOVERNANCE_VERSION,
  released: "2024",
  description: "Initial governance layer - observability and audit",
  breaking_changes: [] as string[],
} as const

/**
 * Attach version to metadata object
 * 
 * Pure function - adds version metadata.
 * 
 * @param metadata - Existing metadata
 * @returns Metadata with version attached
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function attachGovernanceVersion<T extends Record<string, unknown>>(
  metadata: T
): T & { governance_version: string } {
  return {
    ...metadata,
    governance_version: CTA_GOVERNANCE_VERSION,
  }
}

/**
 * Check if version is compatible
 * 
 * Pure function - version compatibility check.
 * 
 * @param version - Version to check
 * @returns true if compatible with current version
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function isVersionCompatible(version: string): boolean {
  // v1 is only compatible with v1
  return version === CTA_GOVERNANCE_VERSION
}

/**
 * Get migration path
 * 
 * Pure function - returns migration instructions.
 * 
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @returns Migration instructions or null
 * 
 * 🚫 MUST NOT affect CTA logic
 */
export function getMigrationPath(
  fromVersion: string,
  toVersion: string
): string | null {
  // No migrations yet (v1 is first version)
  if (fromVersion === toVersion) {
    return null
  }

  // Future: Add migration paths here
  return `Migration from ${fromVersion} to ${toVersion} not yet supported`
}
