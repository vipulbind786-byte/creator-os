"use client"

// components/cta/CTAButton.tsx

import type { CTAContract } from "@/lib/cta/buildContract"
import type {
  CTARenderState,
  CTAAccessibilityContract,
  ActionHandlers,
  AnalyticsTracker,
} from "@/lib/cta/ui"
import {
  dispatchCTAAction,
  trackCTAEvent,
} from "@/lib/cta/ui"
import type { CTASurface } from "./surfaces"
import { Button } from "@/components/ui/button"

/* ======================================================
   CTA BUTTON COMPONENT

   Pure presentational component.
   Receives resolved label + helper.
   NO logic, NO decisions.

   🚫 NO business logic
   🚫 NO intent decisions
   🚫 NO visibility decisions
====================================================== */

export type CTAButtonProps = {
  /**
   * Validated contract
   */
  contract: CTAContract

  /**
   * Prepared render state
   */
  renderState: CTARenderState

  /**
   * Accessibility contract
   */
  accessibility: CTAAccessibilityContract

  /**
   * Action handlers
   */
  actionHandlers: ActionHandlers

  /**
   * Analytics tracker (optional)
   */
  analyticsTracker?: AnalyticsTracker

  /**
   * Surface identifier
   */
  surface: CTASurface
}

/**
 * CTA Button Component
 * 
 * Pure presentation - renders CTA with resolved copy and accessibility.
 * NO logic - just displays what it receives.
 */
export function CTAButton({
  contract,
  renderState,
  accessibility,
  actionHandlers,
  analyticsTracker,
  surface,
}: CTAButtonProps) {
  // Handle click
  const handleClick = () => {
    // Track click event
    if (analyticsTracker) {
      trackCTAEvent("cta_clicked", contract, analyticsTracker, {
        context: surface,
      })
    }

    // Dispatch action (PART 3)
    const result = dispatchCTAAction(contract.action, actionHandlers)

    // Track result
    if (analyticsTracker) {
      if (result.dispatched) {
        trackCTAEvent("cta_action_dispatched", contract, analyticsTracker, {
          context: surface,
          result,
        })
      } else {
        trackCTAEvent("cta_action_failed", contract, analyticsTracker, {
          context: surface,
          reason: result.reason || "unknown",
        })
      }
    }
  }

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      accessibility.keyboard.triggerKeys.includes(e.key as "Enter" | "Space")
    ) {
      if (accessibility.keyboard.preventDefault) {
        e.preventDefault()
      }
      handleClick()
    }
  }

  return (
    <div className="cta-button-wrapper">
      <Button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={accessibility.aria.role}
        aria-label={accessibility.aria["aria-label"]}
        aria-describedby={accessibility.aria["aria-describedby"]}
        aria-live={accessibility.aria["aria-live"]}
        aria-disabled={accessibility.aria["aria-disabled"]}
        tabIndex={accessibility.keyboard.tabIndex}
        disabled={!renderState.shouldRender}
        className="cta-button w-full"
        data-cta-intent={contract.intent}
        data-cta-surface={surface}
      >
        <span className="cta-label">{renderState.copy.label}</span>
      </Button>

      {renderState.copy.helper && (
        <p className="cta-helper text-sm text-muted-foreground mt-2">
          {renderState.copy.helper}
        </p>
      )}
    </div>
  )
}
