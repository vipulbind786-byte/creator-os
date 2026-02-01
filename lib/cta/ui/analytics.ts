// lib/cta/ui/analytics.ts

import type { CTAContract } from "@/lib/cta/buildContract"
import type { CTAIntent } from "@/types/cta"
import type { CTAActionKind } from "@/lib/cta/resolveAction"
import type { DispatchResult } from "./dispatcher"

/* ======================================================
   CTA ANALYTICS HOOK — METADATA ONLY

   ✔ Defines analytics event structure
   ✔ NO actual tracking (UI provides tracker)
   ✔ NO side effects
   ✔ Pure event descriptor creation

   🚫 NO analytics SDK imports
   🚫 NO tracking calls
   🚫 NO network requests
   🚫 NO localStorage/cookies
====================================================== */

/* ===============================
   Analytics Event Types
=============================== */

/**
 * CTA analytics event names
 */
export type CTAEventName =
  | "cta_viewed" // CTA was rendered
  | "cta_clicked" // CTA was clicked
  | "cta_action_dispatched" // Action was dispatched
  | "cta_action_failed" // Action dispatch failed

/**
 * Base analytics event
 */
export type CTAAnalyticsEvent = {
  /**
   * Event name
   */
  event: CTAEventName

  /**
   * Timestamp when event occurred
   */
  timestamp: Date

  /**
   * CTA intent that triggered event
   */
  intent: CTAIntent

  /**
   * Optional context (where CTA was shown)
   */
  context?: string

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>
}

/**
 * CTA viewed event
 */
export type CTAViewedEvent = CTAAnalyticsEvent & {
  event: "cta_viewed"
  /**
   * Action kind that would be triggered
   */
  actionKind: CTAActionKind
}

/**
 * CTA clicked event
 */
export type CTAClickedEvent = CTAAnalyticsEvent & {
  event: "cta_clicked"
  /**
   * Action kind being triggered
   */
  actionKind: CTAActionKind
  /**
   * Action target (route/modal/url)
   */
  actionTarget?: string
}

/**
 * CTA action dispatched event
 */
export type CTAActionDispatchedEvent = CTAAnalyticsEvent & {
  event: "cta_action_dispatched"
  /**
   * Dispatch result
   */
  result: DispatchResult
}

/**
 * CTA action failed event
 */
export type CTAActionFailedEvent = CTAAnalyticsEvent & {
  event: "cta_action_failed"
  /**
   * Failure reason
   */
  reason: string
  /**
   * Error details (optional)
   */
  error?: unknown
}

/* ===============================
   Analytics Tracker Type
=============================== */

/**
 * Analytics tracker function signature
 * 
 * UI provides this function.
 * Dispatcher uses it to track events.
 */
export type AnalyticsTracker = (event: CTAAnalyticsEvent) => void

/* ===============================
   Event Builders
=============================== */

/**
 * Create CTA viewed event
 * 
 * Pure event creation - no tracking.
 * 
 * @param contract - CTA contract
 * @param context - Optional context
 * @returns Analytics event
 */
export function createViewedEvent(
  contract: CTAContract,
  context?: string
): CTAViewedEvent {
  return {
    event: "cta_viewed",
    timestamp: new Date(),
    intent: contract.intent,
    actionKind: contract.action.kind,
    context,
    metadata: contract.action.metadata,
  }
}

/**
 * Create CTA clicked event
 * 
 * Pure event creation - no tracking.
 * 
 * @param contract - CTA contract
 * @param context - Optional context
 * @returns Analytics event
 */
export function createClickedEvent(
  contract: CTAContract,
  context?: string
): CTAClickedEvent {
  return {
    event: "cta_clicked",
    timestamp: new Date(),
    intent: contract.intent,
    actionKind: contract.action.kind,
    actionTarget: contract.action.target,
    context,
    metadata: contract.action.metadata,
  }
}

/**
 * Create action dispatched event
 * 
 * Pure event creation - no tracking.
 * 
 * @param contract - CTA contract
 * @param result - Dispatch result
 * @param context - Optional context
 * @returns Analytics event
 */
export function createActionDispatchedEvent(
  contract: CTAContract,
  result: DispatchResult,
  context?: string
): CTAActionDispatchedEvent {
  return {
    event: "cta_action_dispatched",
    timestamp: new Date(),
    intent: contract.intent,
    result,
    context,
    metadata: contract.action.metadata,
  }
}

/**
 * Create action failed event
 * 
 * Pure event creation - no tracking.
 * 
 * @param contract - CTA contract
 * @param reason - Failure reason
 * @param error - Optional error details
 * @param context - Optional context
 * @returns Analytics event
 */
export function createActionFailedEvent(
  contract: CTAContract,
  reason: string,
  error?: unknown,
  context?: string
): CTAActionFailedEvent {
  return {
    event: "cta_action_failed",
    timestamp: new Date(),
    intent: contract.intent,
    reason,
    error,
    context,
    metadata: contract.action.metadata,
  }
}

/* ===============================
   Analytics Helper
=============================== */

/**
 * Track CTA event using provided tracker
 * 
 * Convenience wrapper that creates and tracks event.
 * 
 * @param eventName - Event name
 * @param contract - CTA contract
 * @param tracker - Analytics tracker function
 * @param options - Optional tracking options
 */
export function trackCTAEvent(
  eventName: CTAEventName,
  contract: CTAContract,
  tracker: AnalyticsTracker,
  options?: {
    context?: string
    result?: DispatchResult
    reason?: string
    error?: unknown
  }
): void {
  let event: CTAAnalyticsEvent

  switch (eventName) {
    case "cta_viewed":
      event = createViewedEvent(contract, options?.context)
      break

    case "cta_clicked":
      event = createClickedEvent(contract, options?.context)
      break

    case "cta_action_dispatched":
      if (!options?.result) {
        throw new Error("Dispatch result required for action_dispatched event")
      }
      event = createActionDispatchedEvent(contract, options.result, options.context)
      break

    case "cta_action_failed":
      if (!options?.reason) {
        throw new Error("Reason required for action_failed event")
      }
      event = createActionFailedEvent(
        contract,
        options.reason,
        options.error,
        options.context
      )
      break

    default:
      const _exhaustive: never = eventName
      throw new Error(`Unknown event: ${_exhaustive}`)
  }

  tracker(event)
}

/* ===============================
   Analytics Policy (Read-Only)
=============================== */

/**
 * Analytics policy descriptor
 * 
 * Documents analytics approach (read-only).
 * Does NOT execute logic.
 * For documentation only.
 */
export const ANALYTICS_POLICY = {
  /**
   * What this module does
   */
  does: [
    "Creates analytics event descriptors",
    "Provides event builder functions",
    "Defines event structure",
  ],

  /**
   * What this module does NOT do
   */
  does_not: [
    "Track events (UI provides tracker)",
    "Import analytics SDKs",
    "Make network requests",
    "Store data locally",
    "Make tracking decisions",
  ],

  /**
   * Event types
   */
  events: {
    cta_viewed: "CTA was rendered to user",
    cta_clicked: "User clicked CTA",
    cta_action_dispatched: "Action was successfully dispatched",
    cta_action_failed: "Action dispatch failed",
  },

  /**
   * Privacy note
   */
  privacy: "All events are metadata only. UI controls actual tracking.",
} as const
