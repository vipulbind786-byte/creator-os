// lib/cta/ui/empty.ts

import type { CTAContract } from "@/lib/cta/buildContract"
import type { CTAIntent } from "@/types/cta"

/* ======================================================
   CTA EMPTY / NONE INTENT HANDLING

   ✔ Defines how to handle NONE intent
   ✔ Provides empty state descriptors
   ✔ NO new logic (NONE already handled in PART 2)
   ✔ Display-safe defaults

   🚫 NO new intent values
   🚫 NO visibility decisions (already in PART 2)
   🚫 NO UI rendering
====================================================== */

/* ===============================
   Empty State Types
=============================== */

/**
 * Empty state reason
 */
export type EmptyStateReason =
  | "intent_none" // Intent is NONE
  | "not_visible" // Contract is not visible
  | "no_contract" // Contract is null/undefined
  | "unknown" // Unknown reason

/**
 * Empty state descriptor
 */
export type EmptyState = {
  /**
   * Whether this is an empty state
   */
  isEmpty: boolean

  /**
   * Reason for empty state
   */
  reason: EmptyStateReason

  /**
   * Whether to render anything
   * (usually false for empty states)
   */
  shouldRender: boolean

  /**
   * Optional message for debugging
   */
  debugMessage?: string
}

/* ===============================
   Empty State Detection
=============================== */

/**
 * Check if CTA is in empty state
 * 
 * Pure check - no decisions.
 * Just reads contract state.
 * 
 * @param contract - CTA contract (may be null)
 * @returns Empty state descriptor
 */
export function checkEmptyState(
  contract: CTAContract | null | undefined
): EmptyState {
  // No contract
  if (!contract) {
    return {
      isEmpty: true,
      reason: "no_contract",
      shouldRender: false,
      debugMessage: "Contract is null or undefined",
    }
  }

  // Intent is NONE
  if (contract.intent === "NONE") {
    return {
      isEmpty: true,
      reason: "intent_none",
      shouldRender: false,
      debugMessage: "Intent is NONE (no action needed)",
    }
  }

  // Contract not visible
  if (!contract.visible) {
    return {
      isEmpty: true,
      reason: "not_visible",
      shouldRender: false,
      debugMessage: "Contract is not visible",
    }
  }

  // Not empty - should render
  return {
    isEmpty: false,
    reason: "unknown",
    shouldRender: true,
  }
}

/**
 * Check if contract represents empty state
 * 
 * Convenience helper for early returns.
 * 
 * @param contract - CTA contract
 * @returns true if empty state
 */
export function isEmptyState(
  contract: CTAContract | null | undefined
): boolean {
  return checkEmptyState(contract).isEmpty
}

/**
 * Check if contract should render
 * 
 * Inverse of isEmptyState.
 * Convenience helper for conditional rendering.
 * 
 * @param contract - CTA contract
 * @returns true if should render
 */
export function shouldRenderCTA(
  contract: CTAContract | null | undefined
): boolean {
  return !isEmptyState(contract)
}

/* ===============================
   Empty State Handling Strategy
=============================== */

/**
 * Empty state handling options
 */
export type EmptyStateHandling = {
  /**
   * What to render for empty state
   */
  renderStrategy:
    | "nothing" // Render nothing (default)
    | "placeholder" // Render placeholder
    | "fallback" // Render fallback CTA

  /**
   * Optional placeholder text
   */
  placeholderText?: string

  /**
   * Whether to log empty states
   */
  logEmpty?: boolean

  /**
   * Context for logging
   */
  context?: string
}

/**
 * Handle empty state with strategy
 * 
 * Returns what to render based on strategy.
 * 
 * @param emptyState - Empty state descriptor
 * @param handling - Handling options
 * @returns Render decision
 */
export function handleEmptyState(
  emptyState: EmptyState,
  handling?: EmptyStateHandling
): {
  shouldRender: boolean
  renderType: "nothing" | "placeholder" | "fallback"
  content?: string
} {
  // Not empty - render normally
  if (!emptyState.isEmpty) {
    return {
      shouldRender: true,
      renderType: "nothing", // Not used
    }
  }

  // Log if requested
  if (handling?.logEmpty) {
    console.debug("CTA empty state:", {
      reason: emptyState.reason,
      message: emptyState.debugMessage,
      context: handling.context,
    })
  }

  // Apply strategy
  const strategy = handling?.renderStrategy || "nothing"

  switch (strategy) {
    case "nothing":
      return {
        shouldRender: false,
        renderType: "nothing",
      }

    case "placeholder":
      return {
        shouldRender: true,
        renderType: "placeholder",
        content: handling?.placeholderText || "No action available",
      }

    case "fallback":
      return {
        shouldRender: true,
        renderType: "fallback",
      }

    default:
      const _exhaustive: never = strategy
      return _exhaustive
  }
}

/* ===============================
   Empty State Policy
=============================== */

/**
 * Empty state policy descriptor
 * 
 * Documents empty state handling (read-only).
 * Does NOT execute logic.
 * For documentation only.
 */
export const EMPTY_STATE_POLICY = {
  /**
   * When CTA is considered empty
   */
  empty_when: [
    "Contract is null or undefined",
    "Intent is NONE",
    "Contract.visible is false",
  ],

  /**
   * Default behavior
   */
  default_behavior: {
    render: "Nothing (null/undefined)",
    log: "No logging by default",
    fallback: "No fallback by default",
  },

  /**
   * Render strategies
   */
  strategies: {
    nothing: "Render nothing (recommended)",
    placeholder: "Render placeholder text (for debugging)",
    fallback: "Render fallback CTA (use with caution)",
  },

  /**
   * Best practices
   */
  best_practices: [
    "Use 'nothing' strategy in production",
    "Use 'placeholder' only for debugging",
    "Avoid 'fallback' unless absolutely necessary",
    "Log empty states in development only",
  ],

  /**
   * What this module does
   */
  does: [
    "Detects empty states",
    "Provides render decision",
    "Offers multiple strategies",
  ],

  /**
   * What this module does NOT do
   */
  does_not: [
    "Make visibility decisions (from PART 2)",
    "Create new intents",
    "Render UI components",
    "Change contract behavior",
  ],
} as const
