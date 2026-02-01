// lib/cta/ui/accessibility.ts

import type { CTAContract } from "@/lib/cta/buildContract"
import type { CTAActionKind } from "@/lib/cta/resolveAction"
import type { CTAIntent } from "@/types/cta"

/* ======================================================
   CTA ACCESSIBILITY CONTRACT — ARIA, KEYBOARD

   ✔ Defines accessibility requirements
   ✔ Provides ARIA attribute descriptors
   ✔ Keyboard navigation rules
   ✔ Screen reader support

   🚫 NO actual DOM manipulation
   🚫 NO React component implementation
   🚫 NO event handlers
====================================================== */

/* ===============================
   ARIA Attributes
=============================== */

/**
 * ARIA attributes for CTA
 */
export type CTAAriaAttributes = {
  /**
   * ARIA role
   * Based on action kind
   */
  role: "button" | "link"

  /**
   * ARIA label
   * Descriptive label for screen readers
   */
  "aria-label": string

  /**
   * ARIA description (optional)
   * Additional context for screen readers
   */
  "aria-describedby"?: string

  /**
   * ARIA live region (optional)
   * For dynamic updates
   */
  "aria-live"?: "polite" | "assertive" | "off"

  /**
   * ARIA pressed state (for button-like CTAs)
   */
  "aria-pressed"?: boolean

  /**
   * ARIA disabled state
   */
  "aria-disabled"?: boolean
}

/* ===============================
   Keyboard Navigation
=============================== */

/**
 * Keyboard navigation requirements
 */
export type KeyboardNavigation = {
  /**
   * Tab index
   * 0 = focusable in tab order
   * -1 = not in tab order but programmatically focusable
   */
  tabIndex: number

  /**
   * Keys that trigger action
   */
  triggerKeys: ("Enter" | "Space")[]

  /**
   * Whether to prevent default on trigger keys
   */
  preventDefault: boolean
}

/* ===============================
   Accessibility Contract
=============================== */

/**
 * Complete accessibility contract for CTA
 */
export type CTAAccessibilityContract = {
  /**
   * ARIA attributes
   */
  aria: CTAAriaAttributes

  /**
   * Keyboard navigation
   */
  keyboard: KeyboardNavigation

  /**
   * Focus management
   */
  focus: {
    /**
     * Whether CTA should be focusable
     */
    focusable: boolean

    /**
     * Focus visible indicator required
     */
    focusVisible: boolean
  }

  /**
   * Screen reader announcements
   */
  screenReader: {
    /**
     * Text to announce when CTA appears
     */
    onAppear?: string

    /**
     * Text to announce when action succeeds
     */
    onSuccess?: string

    /**
     * Text to announce when action fails
     */
    onError?: string
  }
}

/* ===============================
   Accessibility Builder
=============================== */

/**
 * Build accessibility contract from CTA contract
 * 
 * Pure transformation - no DOM manipulation.
 * 
 * @param contract - CTA contract
 * @param label - Resolved label text
 * @param helper - Resolved helper text (optional)
 * @returns Accessibility contract
 */
export function buildAccessibilityContract(
  contract: CTAContract,
  label: string,
  helper?: string
): CTAAccessibilityContract {
  // Determine ARIA role based on action kind
  const role = getAriaRole(contract.action.kind)

  // Build ARIA label
  const ariaLabel = helper ? `${label}. ${helper}` : label

  // Build ARIA attributes
  const aria: CTAAriaAttributes = {
    role,
    "aria-label": ariaLabel,
    "aria-live": "polite",
    "aria-disabled": !contract.visible,
  }

  // Build keyboard navigation
  const keyboard: KeyboardNavigation = {
    tabIndex: contract.visible ? 0 : -1,
    triggerKeys: ["Enter", "Space"],
    preventDefault: true,
  }

  // Build focus management
  const focus = {
    focusable: contract.visible,
    focusVisible: true,
  }

  // Build screen reader announcements
  const screenReader = {
    onAppear: getAppearAnnouncement(contract.intent, label),
    onSuccess: getSuccessAnnouncement(contract.intent),
    onError: "Action failed. Please try again.",
  }

  return {
    aria,
    keyboard,
    focus,
    screenReader,
  }
}

/**
 * Get ARIA role based on action kind
 * 
 * @param actionKind - Action kind
 * @returns ARIA role
 */
function getAriaRole(actionKind: CTAActionKind): "button" | "link" {
  switch (actionKind) {
    case "route":
      return "link"
    case "modal":
    case "external":
    case "none":
      return "button"
    default:
      const _exhaustive: never = actionKind
      return _exhaustive
  }
}

/**
 * Get screen reader announcement for CTA appearance
 * 
 * @param intent - CTA intent
 * @param label - CTA label
 * @returns Announcement text
 */
function getAppearAnnouncement(intent: CTAIntent, label: string): string {
  switch (intent) {
    case "UPGRADE":
      return `Upgrade option available: ${label}`
    case "PAY_NOW":
      return `Payment attention required: ${label}`
    case "FIX_LIMIT":
      return `Usage limit reached: ${label}`
    case "CONTACT_SUPPORT":
      return `Support available: ${label}`
    case "NONE":
      return ""
    default:
      const _exhaustive: never = intent
      return _exhaustive
  }
}

/**
 * Get screen reader announcement for action success
 * 
 * @param intent - CTA intent
 * @returns Announcement text
 */
function getSuccessAnnouncement(intent: CTAIntent): string {
  switch (intent) {
    case "UPGRADE":
      return "Navigating to upgrade page"
    case "PAY_NOW":
      return "Navigating to payment page"
    case "FIX_LIMIT":
      return "Opening upgrade options"
    case "CONTACT_SUPPORT":
      return "Opening support contact"
    case "NONE":
      return ""
    default:
      const _exhaustive: never = intent
      return _exhaustive
  }
}

/* ===============================
   Accessibility Policy
=============================== */

/**
 * Accessibility policy descriptor
 * 
 * Documents accessibility requirements (read-only).
 * Does NOT execute logic.
 * For documentation only.
 */
export const ACCESSIBILITY_POLICY = {
  /**
   * WCAG compliance level
   */
  wcag_level: "AA" as const,

  /**
   * Requirements
   */
  requirements: {
    keyboard: "Full keyboard navigation support",
    screen_reader: "Descriptive labels and announcements",
    focus: "Visible focus indicators",
    aria: "Proper ARIA attributes",
    contrast: "Sufficient color contrast (UI responsibility)",
  },

  /**
   * Keyboard shortcuts
   */
  keyboard: {
    trigger: "Enter or Space to activate",
    focus: "Tab to focus, Shift+Tab to reverse",
    escape: "Escape to cancel (modal actions)",
  },

  /**
   * Screen reader support
   */
  screen_reader: {
    role: "Announced based on action kind",
    label: "Descriptive label with helper text",
    state: "Disabled state announced",
    live_region: "Polite announcements for updates",
  },

  /**
   * Focus management
   */
  focus_management: {
    visible_indicator: "Required for all focusable CTAs",
    trap: "Not required (CTAs are not modals)",
    restoration: "UI responsibility after action",
  },

  /**
   * What UI must implement
   */
  ui_requirements: [
    "Apply ARIA attributes to CTA element",
    "Handle keyboard events (Enter, Space)",
    "Show focus visible indicator",
    "Announce screen reader messages",
    "Ensure sufficient color contrast",
    "Support high contrast mode",
  ],
} as const
