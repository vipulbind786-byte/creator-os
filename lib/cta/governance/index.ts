// lib/cta/governance/index.ts

/* ======================================================
   CTA GOVERNANCE — BARREL EXPORT

   ⚠️ WARNING: OBSERVATIONAL ONLY
   
   These exports MUST NOT be imported by PART 1-4.
   Governance is for observability, NOT for CTA logic.
====================================================== */

// Types
export type {
  CTAMemoryRecord,
  CTAEvent,
  CTAGovernanceSnapshot,
  CTADismissalMetadata,
} from "@/types/cta-governance"

// Memory helpers
export {
  createInitialMemory,
  recordExposure,
  recordAction,
  recordDismissal,
  getExposureCount,
  hasUserInteracted,
  wasDissmissed,
  getTimeSinceFirstExposure,
  getTimeSinceLastExposure,
} from "./memory"

// Audit helpers
export {
  hasExcessiveExposure,
  isUserFatigued,
  calculateEngagementRate,
  isDismissedAsAnnoying,
  wasQuicklyDismissed,
  needsHumanReview,
  hasAccessibilityConcerns,
  generateRiskFlags,
  createGovernanceSnapshot,
} from "./audit"

// Versioning
export {
  CTA_GOVERNANCE_VERSION,
  GOVERNANCE_VERSION_METADATA,
  attachGovernanceVersion,
  isVersionCompatible,
  getMigrationPath,
} from "./versioning"
