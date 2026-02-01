// lib/cta/ui/visibility.ts

import type { CTAContract } from "@/lib/cta/buildContract"
import type { CTAIntent } from "@/types/cta"

/* ======================================================
   CTA VISIBILITY GUARD — NO NEW RULES

   ✔ Pure passthrough of contract.visible
   ✔ NO new decision logic
   ✔ NO business rules
   ✔ Defensive guards only

   🚫 NO new visibility rules
   🚫 NO intent-based decisions (already in PART 2)
   🚫 NO subscription checks (already in PART 2)
====================================================== */

/* ===============================
   Visibility Check Result
=============================== */

/**
 * Result of visibility check
 * 
 * Includes reason for debugging/analytics only.
 * Does NOT affect rendering logic.
 */
export type VisibilityCheckResult = {
  /**
   * Whether CTA should be visible
   * Direct from contract.visible (no new logic)
   */
  visible: boolean

  /**
   * Reason for visibility state
   * For debugging/analytics only
   */
  reason:
    | "contract_visible" // contract.visible === true
    | "contract_hidden" // contract.visible === false
    | "intent_none" // intent === "NONE"
    | "invalid_contract" // contract is null/undefined
}

/* ===============================
   Visibility Guard
=============================== */

/**
 * Check if CTA should be visible
 * 
 * Pure passthrough with defensive guards.
 * NO new visibility logic - just reads contract.visible.
 * 
 * @param contract - CTA contract (may be null/undefined)
 * @returns Visibility check result
 * 
 * @example
 * const result = shouldShowCTA(contract)
 * if (result.visible) {
 *   // Render CTA
 * }
 */
export function shouldShowCTA(
  contract: CTAContract | null | undefined
): VisibilityCheckResult {
  // Defensive: null/undefined contract
  if (!contract) {
    return {
      visible: false,
      reason: "invalid_contract",
    }
  }

  // Defensive: NONE intent (should already be visible=false in contract)
  if (contract.intent === "NONE") {
    return {
      visible: false,
      reason: "intent_none",
    }
  }

  // Direct passthrough of contract.visible
  // This is the ONLY source of truth (from PART 2)
  if (contract.visible) {
    return {
      visible: true,
      reason: "contract_visible",
    }
  }

  return {
    visible: false,
    reason: "contract_hidden",
  }
}

/* ===============================
   Early Return Helper
=============================== */

/**
 * Check if CTA should render (early return pattern)
 * 
 * Convenience helper for early returns in UI.
 * Pure passthrough - no new logic.
 * 
 * @param contract - CTA contract
 * @returns true if should render, false otherwise
 * 
 * @example
 * if (!canRenderCTA(contract)) return null
 */
export function canRenderCTA(
  contract: CTAContract | null | undefined
): contract is CTAContract {
  if (!contract) return false
  return contract.visible
}

/* ===============================
   Visibility Policy (Read-Only)
=============================== */

/**
 * Visibility policy descriptor
 * 
 * Documents the visibility rules (read-only).
 * Does NOT execute logic.
 * For documentation/debugging only.
 */
export const VISIBILITY_POLICY = {
  /**
   * Source of truth for visibility
   */
  source: "contract.visible (from PART 2)" as const,

  /**
   * Rules (read-only documentation)
   */
  rules: {
    visible_when: "contract.visible === true",
    hidden_when: "contract.visible === false OR contract.intent === 'NONE'",
    defensive: "Returns false for null/undefined contracts",
  },

  /**
   * What this guard does NOT do
   */
  does_not: [
    "Make visibility decisions",
    "Check subscription state",
    "Check intent priority",
    "Add new business rules",
  ],
} as const
