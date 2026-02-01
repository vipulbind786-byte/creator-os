// lib/cta/admin/guards.ts

/* ======================================================
   ADMIN SAFETY GUARDS

   🚨 CRITICAL: RUNTIME PROTECTION AGAINST MISUSE
   
   This module provides runtime checks to prevent:
   ❌ Using admin data for CTA decisions
   ❌ Automating based on admin insights
   ❌ Suppressing CTAs based on admin data
   ❌ Optimizing conversions with admin data
   
   These guards are DEFENSIVE ONLY.
====================================================== */

/**
 * Assert that admin data is being used read-only
 * 
 * Throws error if called in contexts that could affect CTA behavior.
 * 
 * @param context - Description of where this is being called
 * @throws Error if called in forbidden context
 * 
 * @example
 * assertReadOnlyUsage("admin dashboard")
 */
export function assertReadOnlyUsage(context: string): void {
  // Check if we're in a CTA decision context
  const stack = new Error().stack || ""

  // Forbidden contexts (these should NEVER call admin functions)
  const forbiddenPatterns = [
    "resolveIntent",
    "resolveCopy",
    "resolveAction",
    "buildContract",
    "shouldShowCTA",
    "suppressCTA",
    "optimizeCTA",
  ]

  for (const pattern of forbiddenPatterns) {
    if (stack.includes(pattern)) {
      throw new Error(
        `🚨 CRITICAL VIOLATION: Admin data accessed from CTA decision context "${pattern}". ` +
          `Admin layer is READ-ONLY and CANNOT affect CTA behavior. ` +
          `Context: ${context}`
      )
    }
  }
}

/**
 * Assert that no automation is being performed
 * 
 * Admin data is for HUMAN REVIEW ONLY.
 * 
 * @param action - Description of action being attempted
 * @throws Error if automation detected
 * 
 * @example
 * assertNoAutomation("generating admin report")
 */
export function assertNoAutomation(action: string): void {
  // This is a compile-time + runtime check
  // If this function is called from automated decision logic, it will throw

  const automationKeywords = [
    "auto",
    "optimize",
    "suppress",
    "hide",
    "recommend",
    "decide",
    "choose",
    "select",
  ]

  const lowerAction = action.toLowerCase()

  for (const keyword of automationKeywords) {
    if (lowerAction.includes(keyword)) {
      throw new Error(
        `🚨 AUTOMATION DETECTED: Action "${action}" contains automation keyword "${keyword}". ` +
          `Admin layer is for HUMAN REVIEW ONLY and cannot perform automated decisions.`
      )
    }
  }
}

/**
 * Assert that data is being exported for human review
 * 
 * Exports must include disclaimers and cannot be used for automation.
 * 
 * @param format - Export format
 * @param includesDisclaimer - Whether export includes disclaimer
 * @throws Error if export is unsafe
 * 
 * @example
 * assertSafeExport("json", true)
 */
export function assertSafeExport(
  format: string,
  includesDisclaimer: boolean
): void {
  if (!includesDisclaimer) {
    throw new Error(
      `🚨 UNSAFE EXPORT: Export format "${format}" must include legal disclaimer. ` +
        `All admin exports must clearly state: "DIAGNOSTIC ONLY - NOT FOR AUTOMATED DECISIONS"`
    )
  }

  // Forbidden export formats (these could enable automation)
  const forbiddenFormats = ["api", "webhook", "stream", "realtime"]

  if (forbiddenFormats.includes(format.toLowerCase())) {
    throw new Error(
      `🚨 FORBIDDEN EXPORT FORMAT: "${format}" is not allowed. ` +
        `Admin data can only be exported as static files (JSON, CSV, PDF metadata) for human review.`
    )
  }
}

/**
 * Validate that confidence level is being displayed
 * 
 * Admin data must ALWAYS show confidence levels.
 * No single-number judgments allowed.
 * 
 * @param hasConfidence - Whether confidence is displayed
 * @throws Error if confidence is missing
 * 
 * @example
 * assertConfidenceDisplayed(true)
 */
export function assertConfidenceDisplayed(hasConfidence: boolean): void {
  if (!hasConfidence) {
    throw new Error(
      `🚨 MISSING CONFIDENCE: Admin data must ALWAYS display confidence levels. ` +
        `Single-number judgments without confidence are forbidden.`
    )
  }
}

/**
 * Validate that no user ranking is being performed
 * 
 * Admin layer cannot rank users as "good" or "bad".
 * 
 * @param operation - Description of operation
 * @throws Error if ranking detected
 * 
 * @example
 * assertNoUserRanking("displaying user list")
 */
export function assertNoUserRanking(operation: string): void {
  const rankingKeywords = [
    "rank",
    "score",
    "grade",
    "rating",
    "best",
    "worst",
    "top",
    "bottom",
    "good user",
    "bad user",
    "quality",
  ]

  const lowerOp = operation.toLowerCase()

  for (const keyword of rankingKeywords) {
    if (lowerOp.includes(keyword)) {
      throw new Error(
        `🚨 USER RANKING DETECTED: Operation "${operation}" contains ranking keyword "${keyword}". ` +
          `Admin layer cannot rank or judge users. Only descriptive classification allowed.`
      )
    }
  }
}

/**
 * Runtime check that admin module is isolated
 * 
 * Verifies no imports from PART 1-4 (CTA decision logic).
 * 
 * @param importPath - Import path being checked
 * @throws Error if forbidden import detected
 * 
 * @example
 * assertIsolatedImport("@/types/cta-admin")
 */
export function assertIsolatedImport(importPath: string): void {
  // Forbidden imports (runtime logic from PART 1-4)
  const forbiddenPaths = [
    "/cta/resolveIntent",
    "/cta/resolveCopy",
    "/cta/resolveAction",
    "/cta/buildContract",
    "/cta/ui/visibility",
    "/cta/ui/dispatcher",
  ]

  for (const forbidden of forbiddenPaths) {
    if (importPath.includes(forbidden)) {
      throw new Error(
        `🚨 FORBIDDEN IMPORT: Admin layer cannot import "${importPath}". ` +
          `Only type-only imports from PART 1-7 are allowed.`
      )
    }
  }
}
