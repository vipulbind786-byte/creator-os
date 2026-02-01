// /lib/suggestions/accessRules.ts

/* ======================================================
   SUGGESTION BOX — ACCESS RULES REGISTRY (LOCK-READY)

   ✔ Pure data
   ✔ Deterministic
   ✔ Auditable
   ✔ Monetization-aligned

   ❌ No logic
   ❌ No DB
   ❌ No UI
====================================================== */

import {
  SUGGESTION_TYPES,
  type SuggestionAccessRegistry,
} from "./types"

/* ======================================================
   ACCESS RULES (AUTHORITATIVE)
====================================================== */

/**
 * These rules describe WHO can submit WHAT
 * and under WHICH conditions.
 *
 * Enforcement happens elsewhere.
 */
export const SUGGESTION_ACCESS_RULES: SuggestionAccessRegistry =
  {
    /* ===============================
       FREE USERS (ALWAYS OPEN)
    =============================== */

    [SUGGESTION_TYPES.BUG_REPORT]: {
      requiresPlatformUnlock: false,
      allowedPlans: ["free", "paid"],
    },

    [SUGGESTION_TYPES.ERROR_REPORT]: {
      requiresPlatformUnlock: false,
      allowedPlans: ["free", "paid"],
    },

    /* ===============================
       PAID USERS (PLATFORM UNLOCKED)
    =============================== */

    [SUGGESTION_TYPES.FEATURE_SUGGESTION]: {
      requiresPlatformUnlock: true,
      allowedPlans: ["paid"],
    },

    [SUGGESTION_TYPES.UX_FEEDBACK]: {
      requiresPlatformUnlock: true,
      allowedPlans: ["paid"],
    },

    /* ===============================
       MONETIZED REQUESTS
    =============================== */

    [SUGGESTION_TYPES.CUSTOM_REQUEST]: {
      requiresPlatformUnlock: true,
      allowedPlans: ["paid"],
      requiresAddOn: "custom_dashboard_request",
    },

    /* ===============================
       COMMUNITY-DRIVEN (VOTING)
    =============================== */

    [SUGGESTION_TYPES.COMMUNITY_PROPOSAL]: {
      requiresPlatformUnlock: true,
      allowedPlans: ["paid"],
    },
  }