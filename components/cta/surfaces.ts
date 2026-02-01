// components/cta/surfaces.ts

/* ======================================================
   CTA SURFACE DEFINITION

   Defines WHERE CTAs appear in the application.
   ONE CTA per surface, enforced in UI.

   🚫 NO business logic
   🚫 NO decision making
   🚫 Read-only configuration
====================================================== */

/**
 * CTA surface identifiers
 * 
 * Each surface can show ONE CTA at a time.
 */
export type CTASurface =
  | "dashboard_banner" // Top banner on dashboard
  | "billing_alert" // Billing page alert
  | "product_gate" // Product access gate
  | "empty_state" // Empty state placeholder

/**
 * Surface configuration
 * 
 * Read-only metadata about each surface.
 * Does NOT control visibility (that's from contract).
 */
export type CTASurfaceConfig = {
  /**
   * Surface identifier
   */
  surface: CTASurface

  /**
   * Display priority (lower = higher priority)
   * Used only for UI layout, NOT for intent priority
   */
  displayPriority: number

  /**
   * Whether surface allows helper text
   */
  allowsHelper: boolean

  /**
   * Maximum width for CTA (CSS)
   */
  maxWidth?: string

  /**
   * Context for analytics
   */
  analyticsContext: string
}

/**
 * Surface configurations
 * Read-only configuration for each surface.
 */
export const CTA_SURFACES: Record<CTASurface, CTASurfaceConfig> = {
  dashboard_banner: {
    surface: "dashboard_banner",
    displayPriority: 1,
    allowsHelper: true,
    maxWidth: "100%",
    analyticsContext: "dashboard",
  },

  billing_alert: {
    surface: "billing_alert",
    displayPriority: 2,
    allowsHelper: true,
    maxWidth: "600px",
    analyticsContext: "billing",
  },

  product_gate: {
    surface: "product_gate",
    displayPriority: 3,
    allowsHelper: true,
    maxWidth: "400px",
    analyticsContext: "product_gate",
  },

  empty_state: {
    surface: "empty_state",
    displayPriority: 4,
    allowsHelper: false,
    maxWidth: "300px",
    analyticsContext: "empty_state",
  },
} as const

/**
 * Get surface configuration
 * 
 * @param surface - Surface identifier
 * @returns Surface configuration
 */
export function getSurfaceConfig(surface: CTASurface): CTASurfaceConfig {
  return CTA_SURFACES[surface]
}
