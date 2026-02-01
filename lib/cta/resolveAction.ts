// lib/cta/resolveAction.ts

import type { CTAIntent } from "@/types/cta"

/* ======================================================
   CTA ACTION RESOLVER — PURE FUNCTION

   ✔ No routing logic
   ✔ No UI handling
   ✔ Only describes WHAT should happen
   ✔ UI interprets the action descriptor

   🚫 NO Next.js router imports
   🚫 NO window.location
   🚫 NO modal state management
====================================================== */

/* ===============================
   Action Kind
=============================== */

/**
 * Type of action the CTA should trigger
 * 
 * - route: Navigate to a page/route
 * - modal: Open a modal/dialog
 * - external: Open external URL
 * - none: No action (CTA not visible)
 */
export type CTAActionKind = "route" | "modal" | "external" | "none"

/* ===============================
   Action Descriptor
=============================== */

/**
 * Describes what action should happen when CTA is clicked
 * 
 * UI is responsible for interpreting and executing the action.
 */
export type CTAAction = {
  /**
   * Type of action
   */
  kind: CTAActionKind

  /**
   * Target for the action
   * 
   * - For "route": path like "/billing" or "/upgrade"
   * - For "modal": modal identifier like "upgrade-modal"
   * - For "external": full URL like "https://support.example.com"
   * - For "none": undefined
   */
  target?: string

  /**
   * Optional metadata for the action
   * Can be used by UI for analytics, tracking, etc.
   */
  metadata?: Record<string, unknown>
}

/* ===============================
   Action Resolver
=============================== */

/**
 * Map CTAIntent to action descriptor
 * 
 * Describes WHAT should happen, not HOW to do it.
 * UI layer is responsible for execution.
 * 
 * @param intent - The CTA intent to resolve
 * @returns CTAAction descriptor
 * 
 * @example
 * resolveCTAAction("UPGRADE")
 * // { kind: "route", target: "/billing" }
 * 
 * @example
 * resolveCTAAction("CONTACT_SUPPORT")
 * // { kind: "external", target: "mailto:support@example.com" }
 * 
 * @example
 * resolveCTAAction("NONE")
 * // { kind: "none" }
 */
export function resolveCTAAction(intent: CTAIntent): CTAAction {
  switch (intent) {
    case "UPGRADE":
      return {
        kind: "route",
        target: "/billing",
        metadata: {
          source: "cta_upgrade",
        },
      }

    case "PAY_NOW":
      return {
        kind: "route",
        target: "/billing",
        metadata: {
          source: "cta_pay_now",
          action: "update_payment",
        },
      }

    case "FIX_LIMIT":
      return {
        kind: "modal",
        target: "upgrade-modal",
        metadata: {
          source: "cta_fix_limit",
          reason: "limit_exceeded",
        },
      }

    case "CONTACT_SUPPORT":
      return {
        kind: "external",
        target: "mailto:support@example.com",
        metadata: {
          source: "cta_contact_support",
        },
      }

    case "NONE":
      return {
        kind: "none",
      }

    default:
      // Exhaustive type check - TypeScript will error if new intent added
      const _exhaustive: never = intent
      return _exhaustive
  }
}
