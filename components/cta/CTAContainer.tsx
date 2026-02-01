"use client"

// components/cta/CTAContainer.tsx

import { useEffect } from "react"
import type { CTAContract } from "@/lib/cta/buildContract"
import {
  prepareCTAForRender,
  shouldShowCTA,
  validateContract,
  checkEmptyState,
  buildAccessibilityContract,
  trackCTAEvent,
  type ActionHandlers,
  type AnalyticsTracker,
  type ErrorHandler,
} from "@/lib/cta/ui"
import { CTAButton } from "./CTAButton"
import type { CTASurface } from "./surfaces"
import { getSurfaceConfig } from "./surfaces"

/* ======================================================
   CTA CONTAINER COMPONENT

   Single container that:
   - Accepts CTAContract from PART 2
   - Calls PART 3 helpers
   - Does NOT decide intent
   - Pure presentation

   🚫 NO business logic
   🚫 NO intent decisions
   🚫 NO visibility decisions
====================================================== */

export type CTAContainerProps = {
  /**
   * CTA contract from PART 2
   * This is the ONLY source of truth
   */
  contract: CTAContract | null | undefined

  /**
   * Surface where CTA appears
   */
  surface: CTASurface

  /**
   * Translation resolver
   * UI must provide this
   */
  translate: (key: string) => string

  /**
   * Action handlers
   * UI must provide these
   */
  actionHandlers: ActionHandlers

  /**
   * Analytics tracker (optional)
   */
  analyticsTracker?: AnalyticsTracker

  /**
   * Error handler (optional)
   */
  errorHandler?: ErrorHandler

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * CTA Container Component
 * 
 * Consumes CTAContract and renders CTA using PART 3 helpers.
 * NO logic, NO decisions - pure presentation.
 */
export function CTAContainer({
  contract,
  surface,
  translate,
  actionHandlers,
  analyticsTracker,
  errorHandler,
  className = "",
}: CTAContainerProps) {
  // Get surface config
  const surfaceConfig = getSurfaceConfig(surface)

  // Validate contract (PART 3)
  const validContract = validateContract(contract, errorHandler)

  // Check empty state (PART 3)
  const emptyState = checkEmptyState(validContract)
  if (emptyState.isEmpty) {
    return null // Don't render
  }

  // Check visibility (PART 3)
  const visibilityCheck = shouldShowCTA(validContract)
  if (!visibilityCheck.visible) {
    return null // Don't render
  }

  // Prepare for rendering (PART 3)
  const renderState = prepareCTAForRender(
    validContract,
    translate,
    {
      context: surfaceConfig.analyticsContext,
      instanceId: `cta-${surface}`,
    }
  )

  // Build accessibility contract (PART 3)
  const a11y = buildAccessibilityContract(
    validContract,
    renderState.copy.label,
    renderState.copy.helper
  )

  // Track viewed event (PART 3)
  useEffect(() => {
    if (analyticsTracker && renderState.shouldRender) {
      trackCTAEvent("cta_viewed", validContract, analyticsTracker, {
        context: surfaceConfig.analyticsContext,
      })
    }
  }, [validContract.intent, surfaceConfig.analyticsContext, analyticsTracker])

  // Don't render if shouldn't render
  if (!renderState.shouldRender) {
    return null
  }

  return (
    <div
      className={`cta-container cta-surface-${surface} ${className}`}
      style={{ maxWidth: surfaceConfig.maxWidth }}
    >
      <CTAButton
        contract={validContract}
        renderState={renderState}
        accessibility={a11y}
        actionHandlers={actionHandlers}
        analyticsTracker={analyticsTracker}
        surface={surface}
      />
    </div>
  )
}
