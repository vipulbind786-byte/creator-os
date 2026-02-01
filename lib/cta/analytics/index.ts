// lib/cta/analytics/index.ts

/* ======================================================
   CTA ANALYTICS — BARREL EXPORT

   ⚠️ WARNING: OBSERVATIONAL ONLY
   
   These exports MUST NOT be imported by PART 1-5.
   Analytics is for reporting, NOT for CTA logic.
====================================================== */

// Types
export type {
  CTAAnalyticsSnapshot,
  CTAExposureStats,
  CTAActionStats,
  CTADismissalStats,
  CTAFatigueSignals,
  CTAComplianceFlags,
  CTATimeWindow,
  CTAAnalyticsVersion,
} from "@/types/cta-analytics"

// Aggregation helpers
export {
  createTimeWindow,
  isWithinTimeWindow,
  aggregateExposureStats,
  aggregateActionStats,
  aggregateDismissalStats,
  calculateTrend,
  calculatePercentageChange,
} from "./aggregate"

// Fatigue analysis
export {
  generateFatigueSignals,
  generateFatigueSignalsForRecords,
  filterByFatigueSeverity,
  countByFatigueSeverity,
  generateFatigueSummary,
} from "./fatigue"

// Compliance checks
export {
  generateComplianceFlags,
  generateComplianceFlagsForRecords,
  filterBySeverity,
  countBySeverity,
  generateComplianceSummary,
} from "./compliance"

// Versioning
export {
  CTA_ANALYTICS_VERSION,
  COMPATIBLE_GOVERNANCE_VERSIONS,
  ANALYTICS_VERSION_METADATA,
  isGovernanceVersionCompatible,
  validateVersionCompatibility,
  attachAnalyticsVersion,
  hasValidVersions,
} from "./versioning"
