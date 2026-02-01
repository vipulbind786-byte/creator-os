"use client"

// components/cta/useCTA.ts

import { useRouter } from "next/navigation"
import { useCallback } from "react"
import type { ActionHandlers, AnalyticsTracker, ErrorHandler, CTAAnalyticsEvent, CTAError } from "@/lib/cta/ui"
import type { TranslationKey } from "@/lib/i18n/keys"

/* ======================================================
   CTA HOOKS

   Provides UI-required handlers for CTA system.
   
   PART 4.4 — Visibility Enforcement (via shouldShowCTA)
   PART 4.5 — Action Wiring (via action handlers)

   🚫 NO business logic
   🚫 NO intent decisions
====================================================== */

/**
 * Hook to get action handlers for CTA
 * 
 * UI provides router, modal manager, etc.
 * CTA system calls these handlers.
 */
export function useCTAActionHandlers(): ActionHandlers {
  const router = useRouter()

  return {
    // Route handler - uses Next.js router
    onRoute: useCallback(
      (path: string, metadata?: Record<string, unknown>) => {
        console.log("[CTA] Navigating to:", path, metadata)
        router.push(path)
      },
      [router]
    ),

    // Modal handler - UI must implement modal manager
    onModal: useCallback(
      (modalId: string, metadata?: Record<string, unknown>) => {
        console.log("[CTA] Opening modal:", modalId, metadata)
        // TODO: Implement modal manager
        // Example: openModal(modalId, metadata)
      },
      []
    ),

    // External handler - opens in new tab
    onExternal: useCallback(
      (url: string, metadata?: Record<string, unknown>) => {
        console.log("[CTA] Opening external:", url, metadata)
        window.open(url, "_blank", "noopener,noreferrer")
      },
      []
    ),
  }
}

/**
 * Hook to get analytics tracker for CTA
 * 
 * Optional - UI provides analytics implementation.
 */
export function useCTAAnalyticsTracker(): AnalyticsTracker | undefined {
  return useCallback((event: CTAAnalyticsEvent) => {
    console.log("[CTA Analytics]", event)
    // TODO: Implement analytics tracking
    // Example: analytics.track(event.event, event)
  }, [])
}

/**
 * Hook to get error handler for CTA
 * 
 * Optional - UI provides error logging.
 */
export function useCTAErrorHandler(): ErrorHandler | undefined {
  return useCallback((error: CTAError) => {
    console.error("[CTA Error]", error)
    // TODO: Implement error reporting
    // Example: errorReporter.report(error)
  }, [])
}

/**
 * Hook to get translation resolver for CTA
 * 
 * UI must provide translator function.
 * This is a placeholder - actual implementation depends on i18n setup.
 * 
 * @param translator - Translation function from i18n system
 */
export function useCTATranslate(translator: (key: TranslationKey) => string) {
  return useCallback(
    (key: string) => {
      return translator(key as TranslationKey)
    },
    [translator]
  )
}

/**
 * Complete CTA hooks
 * 
 * Provides all required handlers for CTA system.
 * 
 * @param translator - Translation function from i18n system
 */
export function useCTAHandlers(translator: (key: TranslationKey) => string) {
  const actionHandlers = useCTAActionHandlers()
  const analyticsTracker = useCTAAnalyticsTracker()
  const errorHandler = useCTAErrorHandler()
  const translate = useCTATranslate(translator)

  return {
    actionHandlers,
    analyticsTracker,
    errorHandler,
    translate,
  }
}
