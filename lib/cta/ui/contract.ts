// lib/cta/ui/contract.ts

import type { CTAContract } from "@/lib/cta/buildContract"
import type { TranslationKey } from "@/lib/i18n/keys"

/* ======================================================
   CTA UI CONTRACT — READ-ONLY SHAPE

   ✔ Consumes frozen CTAContract from PART 2
   ✔ Adds UI-specific metadata (optional)
   ✔ NO logic changes
   ✔ NO new behavior
   ✔ Backward compatible

   🚫 NO decision making
   🚫 NO routing logic
   🚫 NO state management
====================================================== */

/* ===============================
   UI-Safe CTA Contract
=============================== */

/**
 * UI-safe extension of CTAContract
 * 
 * Adds optional UI metadata without changing behavior.
 * All fields from CTAContract are preserved as-is.
 */
export type CTAUIContract = CTAContract & {
  /**
   * Optional UI metadata
   * Does NOT affect rendering logic
   * Used for analytics, debugging, testing
   */
  ui?: {
    /**
     * Unique identifier for this CTA instance
     * Optional - for tracking/debugging
     */
    instanceId?: string

    /**
     * Timestamp when contract was created
     * Optional - for debugging/analytics
     */
    createdAt?: Date

    /**
     * Source context (where CTA is shown)
     * Optional - for analytics
     * 
     * Examples: "dashboard", "product-page", "checkout"
     */
    context?: string

    /**
     * Additional metadata for analytics
     * Optional - does NOT affect behavior
     */
    metadata?: Record<string, unknown>
  }
}

/* ===============================
   Rendered Copy
=============================== */

/**
 * Resolved translation strings for rendering
 * 
 * This is what UI actually displays after i18n resolution.
 * Created by resolving TranslationKey → string.
 */
export type RenderedCTACopy = {
  /**
   * Resolved label text
   */
  label: string

  /**
   * Resolved helper text (optional)
   */
  helper?: string
}

/* ===============================
   UI Rendering State
=============================== */

/**
 * Complete rendering state for UI
 * 
 * Combines contract + resolved copy.
 * UI receives this and renders without decisions.
 */
export type CTARenderState = {
  /**
   * The original contract (frozen from PART 2)
   */
  contract: CTAUIContract

  /**
   * Resolved copy (after i18n)
   */
  copy: RenderedCTACopy

  /**
   * Whether CTA should be rendered
   * Directly from contract.visible (no new logic)
   */
  shouldRender: boolean
}

/* ===============================
   Helper Type Guards
=============================== */

/**
 * Check if contract is visible
 * 
 * Pure passthrough - no new logic.
 * Just reads contract.visible.
 * 
 * @param contract - The CTA contract
 * @returns contract.visible value
 */
export function isContractVisible(contract: CTAContract): boolean {
  return contract.visible
}

/**
 * Check if contract has helper text
 * 
 * Pure check - no logic.
 * 
 * @param contract - The CTA contract
 * @returns true if helperKey exists
 */
export function hasHelperText(contract: CTAContract): boolean {
  return contract.copy.helperKey !== undefined
}
