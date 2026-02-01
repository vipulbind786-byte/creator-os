// lib/cta/buildContract.ts

import type { CTAIntent } from "@/types/cta"
import type { CTACopy } from "./resolveCopy"
import type { CTAAction } from "./resolveAction"
import { resolveCTACopy } from "./resolveCopy"
import { resolveCTAAction } from "./resolveAction"

/* ======================================================
   CTA CONTRACT AGGREGATOR — PURE FUNCTION

   ✔ Combines Copy + Action into ONE contract
   ✔ UI must not decide anything
   ✔ visible = intent !== "NONE"
   ✔ Contract is final and complete

   🚫 NO UI logic
   🚫 NO conditional rendering decisions
   🚫 NO state management
====================================================== */

/* ===============================
   CTA Contract Type
=============================== */

/**
 * Complete CTA contract for UI consumption
 * 
 * This is the FINAL contract that UI receives.
 * UI should render based on this contract without making decisions.
 */
export type CTAContract = {
  /**
   * The resolved intent
   */
  intent: CTAIntent

  /**
   * Whether the CTA should be visible
   * 
   * Automatically determined:
   * - true if intent !== "NONE"
   * - false if intent === "NONE"
   */
  visible: boolean

  /**
   * Copy/translation keys for the CTA
   */
  copy: CTACopy

  /**
   * Action descriptor for the CTA
   */
  action: CTAAction
}

/* ===============================
   Contract Builder
=============================== */

/**
 * Build complete CTA contract from intent
 * 
 * Aggregates all CTA logic into one final contract.
 * UI receives this and renders accordingly.
 * 
 * @param intent - The CTA intent to build contract for
 * @returns Complete CTAContract
 * 
 * @example
 * buildCTAContract("UPGRADE")
 * // {
 * //   intent: "UPGRADE",
 * //   visible: true,
 * //   copy: { labelKey: "cta.upgrade.label", helperKey: "cta.upgrade.helper" },
 * //   action: { kind: "route", target: "/billing" }
 * // }
 * 
 * @example
 * buildCTAContract("NONE")
 * // {
 * //   intent: "NONE",
 * //   visible: false,
 * //   copy: { labelKey: "common.ok" },
 * //   action: { kind: "none" }
 * // }
 */
export function buildCTAContract(intent: CTAIntent): CTAContract {
  // Resolve copy and action
  const copy = resolveCTACopy(intent)
  const action = resolveCTAAction(intent)

  // Determine visibility
  // CTA is visible if intent is not "NONE"
  const visible = intent !== "NONE"

  return {
    intent,
    visible,
    copy,
    action,
  }
}
