// lib/cta/ui/renderer.ts

import type { CTAContract } from "@/lib/cta/buildContract"
import type { CTAUIContract, RenderedCTACopy, CTARenderState } from "./contract"
import type { TranslationKey } from "@/lib/i18n/keys"

/* ======================================================
   CTA RENDERER INTERFACE — NO JSX YET

   ✔ Defines HOW to prepare contract for rendering
   ✔ NO actual rendering (that's UI component's job)
   ✔ NO routing logic
   ✔ NO state management
   ✔ Pure transformation only

   🚫 NO React imports
   🚫 NO JSX
   🚫 NO DOM manipulation
====================================================== */

/* ===============================
   Translation Resolver Type
=============================== */

/**
 * Function signature for resolving translation keys
 * 
 * UI layer provides this function.
 * Renderer uses it to resolve keys → strings.
 */
export type TranslationResolver = (key: TranslationKey) => string

/* ===============================
   Render Preparation
=============================== */

/**
 * Prepare CTA contract for rendering
 * 
 * Pure transformation:
 * - Takes frozen contract from PART 2
 * - Resolves translation keys using provided resolver
 * - Returns render-ready state
 * 
 * NO decisions, NO logic changes, NO side effects.
 * 
 * @param contract - Frozen CTAContract from PART 2
 * @param translate - Translation resolver function
 * @param options - Optional UI metadata
 * @returns CTARenderState ready for UI
 * 
 * @example
 * const renderState = prepareCTAForRender(
 *   contract,
 *   (key) => t(key),
 *   { context: "dashboard" }
 * )
 */
export function prepareCTAForRender(
  contract: CTAContract,
  translate: TranslationResolver,
  options?: {
    instanceId?: string
    context?: string
    metadata?: Record<string, unknown>
  }
): CTARenderState {
  // Resolve translation keys to strings
  const label = translate(contract.copy.labelKey)
  const helper = contract.copy.helperKey
    ? translate(contract.copy.helperKey)
    : undefined

  const renderedCopy: RenderedCTACopy = {
    label,
    helper,
  }

  // Create UI contract with optional metadata
  const uiContract: CTAUIContract = {
    ...contract,
    ui: options
      ? {
          instanceId: options.instanceId,
          createdAt: new Date(),
          context: options.context,
          metadata: options.metadata,
        }
      : undefined,
  }

  // Return complete render state
  return {
    contract: uiContract,
    copy: renderedCopy,
    shouldRender: contract.visible, // Direct passthrough, no new logic
  }
}

/* ===============================
   Render Props Builder
=============================== */

/**
 * Props that UI component needs to render CTA
 * 
 * This is the interface between logic and UI.
 * UI component receives these props and renders.
 */
export type CTARenderProps = {
  /**
   * Resolved label text
   */
  label: string

  /**
   * Resolved helper text (optional)
   */
  helper?: string

  /**
   * Whether to show the CTA
   * Direct from contract.visible
   */
  visible: boolean

  /**
   * Action handler (to be implemented by UI)
   * Receives action descriptor from contract
   */
  onAction: () => void

  /**
   * Optional ARIA label for accessibility
   */
  ariaLabel?: string

  /**
   * Optional CSS class names
   */
  className?: string

  /**
   * Optional test ID for testing
   */
  testId?: string
}

/**
 * Build render props from render state
 * 
 * Pure transformation - no logic.
 * Extracts what UI needs from render state.
 * 
 * @param renderState - Prepared render state
 * @param onAction - Action handler (provided by UI)
 * @param options - Optional rendering options
 * @returns Props for UI component
 */
export function buildRenderProps(
  renderState: CTARenderState,
  onAction: () => void,
  options?: {
    ariaLabel?: string
    className?: string
    testId?: string
  }
): CTARenderProps {
  return {
    label: renderState.copy.label,
    helper: renderState.copy.helper,
    visible: renderState.shouldRender,
    onAction,
    ariaLabel: options?.ariaLabel,
    className: options?.className,
    testId: options?.testId,
  }
}
