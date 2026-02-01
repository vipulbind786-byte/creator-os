// lib/suggestions/accessRegistry.ts
// 🔒 OP-SUG-01: SUGGESTION ACCESS REGISTRY — SINGLE SOURCE OF TRUTH
// PURE CONFIG • NO LOGIC • NO DB • NO UI
// FUTURE-SAFE • AUDIT-SAFE • HARD LOCK

import {
  SUGGESTION_TYPES,
  type SuggestionAccessRegistry,
} from "@/lib/suggestions/types"

/**
 * Canonical access rules for ALL suggestion types.
 *
 * HARD RULES:
 * - This file defines WHAT is allowed, not HOW
 * - No runtime logic
 * - No imports from billing / addons / UI
 * - Changes require product-level approval
 */
export const SUGGESTION_ACCESS_REGISTRY: SuggestionAccessRegistry = {
  /* -----------------------------
     FREE USER — SAFE ZONE
  ----------------------------- */
  [SUGGESTION_TYPES.BUG_REPORT]: {
    requiresPlatformUnlock: false,
    allowedPlans: ["free", "paid"],
  },

  [SUGGESTION_TYPES.ERROR_REPORT]: {
    requiresPlatformUnlock: false,
    allowedPlans: ["free", "paid"],
  },

  /* -----------------------------
     PAID USER — VALUE ZONE
  ----------------------------- */
  [SUGGESTION_TYPES.FEATURE_SUGGESTION]: {
    requiresPlatformUnlock: true, // 🔒 1k paid users gate
    allowedPlans: ["paid"],
  },

  [SUGGESTION_TYPES.UX_FEEDBACK]: {
    requiresPlatformUnlock: true,
    allowedPlans: ["paid"],
  },

  /* -----------------------------
     MONETIZED — SUPPORT ONLY
  ----------------------------- */
  [SUGGESTION_TYPES.CUSTOM_REQUEST]: {
    requiresPlatformUnlock: true,
    allowedPlans: ["paid"],
    requiresAddOn: "custom_dashboard_request",
  },

  /* -----------------------------
     COMMUNITY — SCALE ZONE
  ----------------------------- */
  [SUGGESTION_TYPES.COMMUNITY_PROPOSAL]: {
    requiresPlatformUnlock: true,
    allowedPlans: ["paid"],
  },
} as const

/**
 * 🔐 HARD LOCK NOTICE
 *
 * - Do NOT compute access here
 * - Do NOT infer user state here
 * - Guard / evaluator MUST consume this registry
 * - Any rename = breaking change
 */