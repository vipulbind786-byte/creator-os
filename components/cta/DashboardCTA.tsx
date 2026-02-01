"use client"

// components/cta/DashboardCTA.tsx

import { useMemo } from "react"
import { resolveCTAIntent, buildCTAContract } from "@/lib/cta"
import type { NormalizedError } from "@/lib/cta/resolveIntent"
import type { Subscription } from "@/types/subscription"
import { CTAContainer } from "./CTAContainer"
import { useCTAHandlers } from "./useCTA"
import type { TranslationKey } from "@/lib/i18n/keys"

/* ======================================================
   PART 4.10 — INTEGRATION EXAMPLE

   Dashboard CTA Integration
   
   Demonstrates complete flow:
   - Subscription → Intent → Contract → UI

   🚫 NO mock logic
   🚫 NO hardcoded intents
   🚫 Uses real contract flow
====================================================== */

export type DashboardCTAProps = {
  /**
   * User's subscription state
   * From your app's subscription system
   */
  subscription: Subscription

  /**
   * Capability check result
   * From your app's access control
   */
  capabilityResult: boolean

  /**
   * Error from capability check (if any)
   */
  error?: NormalizedError

  /**
   * Translation function
   * From your i18n system
   */
  translator: (key: TranslationKey) => string
}

/**
 * Dashboard CTA Component
 * 
 * PART 4.10 — Complete integration example.
 * Shows how to use the entire CTA system.
 */
export function DashboardCTA({
  subscription,
  capabilityResult,
  error,
  translator,
}: DashboardCTAProps) {
  // Get CTA handlers (PART 4.5)
  const { actionHandlers, analyticsTracker, errorHandler, translate } =
    useCTAHandlers(translator)

  // Build CTA contract (PART 2)
  const contract = useMemo(() => {
    // Resolve intent (PART 2)
    const intent = resolveCTAIntent({
      subscription,
      capabilityResult,
      error,
    })

    // Build contract (PART 2)
    return buildCTAContract(intent)
  }, [subscription, capabilityResult, error])

  // Render CTA container (PART 4.2)
  return (
    <CTAContainer
      contract={contract}
      surface="dashboard_banner"
      translate={translate}
      actionHandlers={actionHandlers}
      analyticsTracker={analyticsTracker}
      errorHandler={errorHandler}
      className="mb-6"
    />
  )
}
