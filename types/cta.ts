/* ======================================================
   CTA TYPES — SINGLE SOURCE OF TRUTH

   ✔ Pure type definitions
   ✔ No UI logic
   ✔ No routing logic
   ✔ Foundation for CTA decision engine
====================================================== */

/* ===============================
   CTA Intent
=============================== */

/**
 * Canonical CTA intent values
 * 
 * Represents WHAT the system wants the user to do.
 * 
 * - UPGRADE: User should upgrade to a paid plan
 * - PAY_NOW: User needs to complete payment (past_due)
 * - FIX_LIMIT: User has hit a capability limit
 * - CONTACT_SUPPORT: User should contact support
 * - NONE: No action needed
 * 
 * ⚠️ This is intent-only. No UI, routing, or copy meaning.
 */
export type CTAIntent =
  | "UPGRADE"
  | "PAY_NOW"
  | "FIX_LIMIT"
  | "CONTACT_SUPPORT"
  | "NONE"
