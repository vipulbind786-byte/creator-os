// lib/cta/index.ts

/* ======================================================
   CTA DECISION ENGINE — PUBLIC API

   Barrel export for clean imports
====================================================== */

// Types
export type { CTAIntent } from "@/types/cta"
export type {
  CapabilityResult,
  NormalizedError,
  ResolveIntentInput,
} from "./resolveIntent"
export type { CTACopy } from "./resolveCopy"
export type { CTAActionKind, CTAAction } from "./resolveAction"
export type { CTAContract } from "./buildContract"

// Functions
export { resolveCTAIntent } from "./resolveIntent"
export { resolveCTACopy } from "./resolveCopy"
export { resolveCTAAction } from "./resolveAction"
export { buildCTAContract } from "./buildContract"
