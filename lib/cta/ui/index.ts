// lib/cta/ui/index.ts

/* ======================================================
   CTA UI BINDING LAYER — BARREL EXPORT

   Clean exports for UI integration.
   All PART 3 modules in one place.
====================================================== */

// Contract types and helpers
export type {
  CTAUIContract,
  RenderedCTACopy,
  CTARenderState,
} from "./contract"
export { isContractVisible, hasHelperText } from "./contract"

// Renderer
export type {
  TranslationResolver,
  CTARenderProps,
} from "./renderer"
export { prepareCTAForRender, buildRenderProps } from "./renderer"

// Visibility
export type { VisibilityCheckResult } from "./visibility"
export { shouldShowCTA, canRenderCTA, VISIBILITY_POLICY } from "./visibility"

// Dispatcher
export type {
  RouteHandler,
  ModalHandler,
  ExternalHandler,
  ActionHandlers,
  DispatchResult,
} from "./dispatcher"
export {
  dispatchCTAAction,
  createActionHandler,
  DISPATCH_POLICY,
} from "./dispatcher"

// Analytics
export type {
  CTAEventName,
  CTAAnalyticsEvent,
  CTAViewedEvent,
  CTAClickedEvent,
  CTAActionDispatchedEvent,
  CTAActionFailedEvent,
  AnalyticsTracker,
} from "./analytics"
export {
  createViewedEvent,
  createClickedEvent,
  createActionDispatchedEvent,
  createActionFailedEvent,
  trackCTAEvent,
  ANALYTICS_POLICY,
} from "./analytics"

// Error Boundary
export type {
  CTAErrorType,
  CTAError,
  ErrorHandler,
} from "./errorBoundary"
export {
  FALLBACK_CONTRACT,
  FALLBACK_COPY,
  createCTAError,
  handleCTAError,
  validateContract,
  safeExecute,
  ERROR_RECOVERY_STRATEGY,
} from "./errorBoundary"

// i18n
export type { TranslationOptions } from "./i18n"
export {
  resolveCTACopy,
  validateTranslationKeys,
  I18N_RENDERING_POLICY,
} from "./i18n"

// Accessibility
export type {
  CTAAriaAttributes,
  KeyboardNavigation,
  CTAAccessibilityContract,
} from "./accessibility"
export {
  buildAccessibilityContract,
  ACCESSIBILITY_POLICY,
} from "./accessibility"

// Empty State
export type {
  EmptyStateReason,
  EmptyState,
  EmptyStateHandling,
} from "./empty"
export {
  checkEmptyState,
  isEmptyState,
  shouldRenderCTA,
  handleEmptyState,
  EMPTY_STATE_POLICY,
} from "./empty"
