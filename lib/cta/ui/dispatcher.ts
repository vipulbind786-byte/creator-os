// lib/cta/ui/dispatcher.ts

import type { CTAAction, CTAActionKind } from "@/lib/cta/resolveAction"
import type { CTAIntent } from "@/types/cta"

/* ======================================================
   CTA ACTION DISPATCHER — PURE, NO ROUTER IMPORT

   ✔ Describes HOW to execute actions
   ✔ NO actual routing (UI provides router)
   ✔ NO modal state (UI provides modal manager)
   ✔ NO window.location (UI provides handler)
   ✔ Pure action descriptor interpretation

   🚫 NO Next.js router imports
   🚫 NO window.location.href
   🚫 NO modal state management
   🚫 NO side effects
====================================================== */

/* ===============================
   Action Handler Types
=============================== */

/**
 * Handler for route actions
 * UI provides this function
 */
export type RouteHandler = (path: string, metadata?: Record<string, unknown>) => void

/**
 * Handler for modal actions
 * UI provides this function
 */
export type ModalHandler = (modalId: string, metadata?: Record<string, unknown>) => void

/**
 * Handler for external actions
 * UI provides this function
 */
export type ExternalHandler = (url: string, metadata?: Record<string, unknown>) => void

/**
 * Collection of action handlers
 * UI provides all of these
 */
export type ActionHandlers = {
  onRoute: RouteHandler
  onModal: ModalHandler
  onExternal: ExternalHandler
}

/* ===============================
   Dispatch Result
=============================== */

/**
 * Result of action dispatch
 * 
 * For debugging/analytics only.
 * Does NOT affect execution.
 */
export type DispatchResult = {
  /**
   * Whether action was dispatched
   */
  dispatched: boolean

  /**
   * Action kind that was dispatched
   */
  kind: CTAActionKind

  /**
   * Target of the action (if any)
   */
  target?: string

  /**
   * Reason if not dispatched
   */
  reason?: "no_action" | "invalid_action" | "missing_handler"
}

/* ===============================
   Action Dispatcher
=============================== */

/**
 * Dispatch CTA action using provided handlers
 * 
 * Pure interpretation of action descriptor.
 * Delegates actual execution to UI-provided handlers.
 * 
 * NO routing logic here - just calls the right handler.
 * 
 * @param action - Action descriptor from contract
 * @param handlers - UI-provided action handlers
 * @returns Dispatch result (for debugging/analytics)
 * 
 * @example
 * const result = dispatchCTAAction(
 *   contract.action,
 *   {
 *     onRoute: (path) => router.push(path),
 *     onModal: (id) => openModal(id),
 *     onExternal: (url) => window.open(url, '_blank')
 *   }
 * )
 */
export function dispatchCTAAction(
  action: CTAAction | null | undefined,
  handlers: ActionHandlers
): DispatchResult {
  // Defensive: null/undefined action
  if (!action) {
    return {
      dispatched: false,
      kind: "none",
      reason: "invalid_action",
    }
  }

  // Handle each action kind
  switch (action.kind) {
    case "route":
      if (!action.target) {
        return {
          dispatched: false,
          kind: "route",
          reason: "invalid_action",
        }
      }
      handlers.onRoute(action.target, action.metadata)
      return {
        dispatched: true,
        kind: "route",
        target: action.target,
      }

    case "modal":
      if (!action.target) {
        return {
          dispatched: false,
          kind: "modal",
          reason: "invalid_action",
        }
      }
      handlers.onModal(action.target, action.metadata)
      return {
        dispatched: true,
        kind: "modal",
        target: action.target,
      }

    case "external":
      if (!action.target) {
        return {
          dispatched: false,
          kind: "external",
          reason: "invalid_action",
        }
      }
      handlers.onExternal(action.target, action.metadata)
      return {
        dispatched: true,
        kind: "external",
        target: action.target,
      }

    case "none":
      return {
        dispatched: false,
        kind: "none",
        reason: "no_action",
      }

    default:
      // Exhaustive check
      const _exhaustive: never = action.kind
      return _exhaustive
  }
}

/* ===============================
   Action Handler Factory
=============================== */

/**
 * Create action handler function for UI
 * 
 * Convenience wrapper that binds handlers.
 * Returns a single function UI can call.
 * 
 * @param action - Action descriptor
 * @param handlers - UI-provided handlers
 * @returns Handler function
 * 
 * @example
 * const handleAction = createActionHandler(
 *   contract.action,
 *   { onRoute, onModal, onExternal }
 * )
 * 
 * <button onClick={handleAction}>Click</button>
 */
export function createActionHandler(
  action: CTAAction | null | undefined,
  handlers: ActionHandlers
): () => void {
  return () => {
    dispatchCTAAction(action, handlers)
  }
}

/* ===============================
   Dispatch Policy (Read-Only)
=============================== */

/**
 * Action dispatch policy descriptor
 * 
 * Documents how actions are dispatched (read-only).
 * Does NOT execute logic.
 * For documentation/debugging only.
 */
export const DISPATCH_POLICY = {
  /**
   * What this dispatcher does
   */
  does: [
    "Interprets action descriptor from PART 2",
    "Calls UI-provided handlers",
    "Returns dispatch result for analytics",
  ],

  /**
   * What this dispatcher does NOT do
   */
  does_not: [
    "Import Next.js router",
    "Call window.location",
    "Manage modal state",
    "Make routing decisions",
    "Add new action types",
  ],

  /**
   * Handler requirements
   */
  handlers: {
    onRoute: "UI must provide router.push or equivalent",
    onModal: "UI must provide modal manager",
    onExternal: "UI must provide window.open or equivalent",
  },
} as const
