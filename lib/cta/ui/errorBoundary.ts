// lib/cta/ui/errorBoundary.ts

import type { CTAContract } from "@/lib/cta/buildContract"
import type { CTAIntent } from "@/types/cta"

/* ======================================================
   CTA ERROR BOUNDARY STRATEGY — DISPLAY-SAFE

   ✔ Defines error handling strategy
   ✔ Provides fallback descriptors
   ✔ NO actual error catching (UI provides boundary)
   ✔ Display-safe defaults

   🚫 NO React Error Boundary implementation
   🚫 NO error logging (UI provides logger)
   🚫 NO error reporting
   🚫 NO side effects
====================================================== */

/* ===============================
   Error Types
=============================== */

/**
 * CTA error categories
 */
export type CTAErrorType =
  | "contract_invalid" // Contract is null/malformed
  | "translation_missing" // Translation key not found
  | "action_failed" // Action dispatch failed
  | "render_failed" // Rendering failed
  | "unknown" // Unknown error

/**
 * CTA error descriptor
 */
export type CTAError = {
  /**
   * Error type
   */
  type: CTAErrorType

  /**
   * Error message (for logging)
   */
  message: string

  /**
   * Original error (if any)
   */
  originalError?: unknown

  /**
   * Context where error occurred
   */
  context?: string

  /**
   * Timestamp
   */
  timestamp: Date
}

/* ===============================
   Fallback Strategy
=============================== */

/**
 * Fallback CTA contract
 * 
 * Used when primary contract is invalid.
 * Display-safe, non-breaking.
 */
export const FALLBACK_CONTRACT: CTAContract = {
  intent: "NONE",
  visible: false,
  copy: {
    labelKey: "common.ok",
  },
  action: {
    kind: "none",
  },
}

/**
 * Fallback copy
 * 
 * Used when translation fails.
 * Display-safe, non-breaking.
 */
export const FALLBACK_COPY = {
  label: "OK",
  helper: undefined,
}

/* ===============================
   Error Handlers
=============================== */

/**
 * Error handler function signature
 * 
 * UI provides this function.
 * Called when errors occur.
 */
export type ErrorHandler = (error: CTAError) => void

/**
 * Create CTA error descriptor
 * 
 * Pure error creation - no logging.
 * 
 * @param type - Error type
 * @param message - Error message
 * @param originalError - Original error (optional)
 * @param context - Context (optional)
 * @returns Error descriptor
 */
export function createCTAError(
  type: CTAErrorType,
  message: string,
  originalError?: unknown,
  context?: string
): CTAError {
  return {
    type,
    message,
    originalError,
    context,
    timestamp: new Date(),
  }
}

/**
 * Handle CTA error with fallback
 * 
 * Returns fallback contract and calls error handler.
 * Display-safe - never throws.
 * 
 * @param error - Error descriptor
 * @param handler - Error handler (optional)
 * @returns Fallback contract
 */
export function handleCTAError(
  error: CTAError,
  handler?: ErrorHandler
): CTAContract {
  // Call error handler if provided
  if (handler) {
    try {
      handler(error)
    } catch (handlerError) {
      // Swallow handler errors to prevent cascading failures
      console.error("Error handler failed:", handlerError)
    }
  }

  // Return fallback contract
  return FALLBACK_CONTRACT
}

/**
 * Safe contract validator
 * 
 * Validates contract and returns fallback if invalid.
 * Display-safe - never throws.
 * 
 * @param contract - Contract to validate
 * @param handler - Error handler (optional)
 * @returns Valid contract or fallback
 */
export function validateContract(
  contract: CTAContract | null | undefined,
  handler?: ErrorHandler
): CTAContract {
  // Null/undefined check
  if (!contract) {
    const error = createCTAError(
      "contract_invalid",
      "Contract is null or undefined"
    )
    return handleCTAError(error, handler)
  }

  // Basic structure validation
  if (!contract.intent || !contract.copy || !contract.action) {
    const error = createCTAError(
      "contract_invalid",
      "Contract is missing required fields"
    )
    return handleCTAError(error, handler)
  }

  // Contract is valid
  return contract
}

/* ===============================
   Error Recovery Strategy
=============================== */

/**
 * Error recovery strategy descriptor
 * 
 * Documents error handling approach (read-only).
 * Does NOT execute logic.
 * For documentation only.
 */
export const ERROR_RECOVERY_STRATEGY = {
  /**
   * Principles
   */
  principles: [
    "Never throw errors to UI",
    "Always provide fallback",
    "Log errors for debugging",
    "Degrade gracefully",
  ],

  /**
   * Fallback behavior
   */
  fallback: {
    contract: "NONE intent, not visible",
    copy: "Generic 'OK' text",
    action: "No action",
    visibility: "Hidden (safe default)",
  },

  /**
   * Error handling flow
   */
  flow: [
    "1. Detect error",
    "2. Create error descriptor",
    "3. Call error handler (if provided)",
    "4. Return fallback contract",
    "5. UI renders fallback (or nothing)",
  ],

  /**
   * What UI must provide
   */
  ui_requirements: {
    error_boundary: "React Error Boundary component",
    error_handler: "Function to log/report errors",
    fallback_ui: "Optional fallback UI component",
  },
} as const

/* ===============================
   Safe Execution Wrapper
=============================== */

/**
 * Safely execute function with error handling
 * 
 * Wraps function execution with try/catch.
 * Returns result or fallback on error.
 * 
 * @param fn - Function to execute
 * @param fallback - Fallback value
 * @param handler - Error handler (optional)
 * @returns Function result or fallback
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  handler?: ErrorHandler
): T {
  try {
    return fn()
  } catch (error) {
    const ctaError = createCTAError(
      "unknown",
      "Function execution failed",
      error
    )

    if (handler) {
      try {
        handler(ctaError)
      } catch (handlerError) {
        console.error("Error handler failed:", handlerError)
      }
    }

    return fallback
  }
}
