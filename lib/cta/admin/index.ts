// lib/cta/admin/index.ts

/* ======================================================
   ADMIN LAYER BARREL EXPORT

   🚨 READ-ONLY DIAGNOSTIC SYSTEM
   
   This layer CANNOT affect CTA behavior.
====================================================== */

export { buildAdminSnapshot } from "./compose"
export { explainWhyCTAWasShown, getExplanationSummary } from "./explain"
export {
  assertReadOnlyUsage,
  assertNoAutomation,
  assertSafeExport,
  assertConfidenceDisplayed,
  assertNoUserRanking,
  assertIsolatedImport,
} from "./guards"
export { exportToJSON, exportToCSV, exportToPDFMetadata } from "./export"
export {
  CTA_ADMIN_VERSION,
  COMPATIBLE_VERSIONS,
  isGovernanceCompatible,
  isAnalyticsCompatible,
  isLifecycleCompatible,
  validateAllVersions,
  getVersionSummary,
} from "./versioning"
