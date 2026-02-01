// lib/cta/lifecycle/index.ts

/* ======================================================
   CTA LIFECYCLE — BARREL EXPORT

   ⚠️ WARNING: DIAGNOSTIC ONLY
   
   These exports MUST NOT be imported by PART 1-6.
   Lifecycle is for classification, NOT for CTA logic.
====================================================== */

// Types
export type {
  LifecycleState,
  LifecycleSignalInput,
  LifecycleSnapshot,
  ConfidenceLevel,
  SignalBucket,
  LifecycleVersion,
} from "@/types/cta-lifecycle"

// Normalization helpers
export {
  normalizeDaysSinceFirstSeen,
  normalizeDaysSinceLastActivity,
  normalizeExposureCount,
  normalizeInteractionCount,
  normalizeEngagementRatio,
  normalizeFatigueSeverity,
  normalizeAllSignals,
  countUnknownSignals,
  getMissingSignalNames,
} from "./normalize"

// State resolver
export { resolveLifecycleState, getStateDescription } from "./resolve"

// Snapshot builder
export {
  buildLifecycleSnapshot,
  getSnapshotSummary,
  hasHighConfidence,
  isSnapshotRecent,
} from "./snapshot"

// Versioning
export {
  CTA_LIFECYCLE_VERSION,
  COMPATIBLE_ANALYTICS_VERSIONS,
  COMPATIBLE_GOVERNANCE_VERSIONS,
  LIFECYCLE_VERSION_METADATA,
  isAnalyticsVersionCompatible,
  isGovernanceVersionCompatible,
  validateVersionCompatibility,
  hasValidVersions,
} from "./versioning"
