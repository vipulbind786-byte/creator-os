// components/cta/index.ts

/* ======================================================
   CTA COMPONENTS — BARREL EXPORT

   Clean exports for all PART 4 UI components.
====================================================== */

// Surface definitions
export type { CTASurface, CTASurfaceConfig } from "./surfaces"
export { CTA_SURFACES, getSurfaceConfig } from "./surfaces"

// Container component
export type { CTAContainerProps } from "./CTAContainer"
export { CTAContainer } from "./CTAContainer"

// Button component
export type { CTAButtonProps } from "./CTAButton"
export { CTAButton } from "./CTAButton"

// Hooks
export {
  useCTAActionHandlers,
  useCTAAnalyticsTracker,
  useCTAErrorHandler,
  useCTATranslate,
  useCTAHandlers,
} from "./useCTA"

// Integration examples
export type { DashboardCTAProps } from "./DashboardCTA"
export { DashboardCTA } from "./DashboardCTA"
