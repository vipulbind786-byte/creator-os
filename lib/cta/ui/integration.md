# CTA UI Integration Checklist

**Status:** PART 3 Complete — UI Binding Layer  
**Version:** 1.0.0  
**Last Updated:** 2024

---

## 📋 Overview

This checklist guides UI implementation to integrate the CTA Decision Engine (PART 1 + PART 2) with the UI Binding Layer (PART 3).

**CRITICAL:** This is a LOGIC-ONLY integration. No actual UI components are provided in PART 3.

---

## ✅ Pre-Integration Checklist

### PART 1 — Subscription State (FROZEN)
- [ ] `/types/subscription.ts` exists and is frozen
- [ ] `/lib/subscription/state.ts` exists and is frozen
- [ ] All subscription helper functions are available
- [ ] Zero TypeScript errors in PART 1

### PART 2 — CTA Decision Engine (FROZEN)
- [ ] `/types/cta.ts` exists and is frozen
- [ ] `/lib/cta/resolveIntent.ts` exists and is frozen
- [ ] `/lib/cta/resolveCopy.ts` exists and is frozen
- [ ] `/lib/cta/resolveAction.ts` exists and is frozen
- [ ] `/lib/cta/buildContract.ts` exists and is frozen
- [ ] `/lib/i18n/keys.ts` has CTA translation keys
- [ ] `/lib/i18n/en.ts` has CTA translations
- [ ] `/lib/i18n/hi.ts` has CTA translations
- [ ] Zero TypeScript errors in PART 2

### PART 3 — UI Binding Layer (THIS PART)
- [ ] `/lib/cta/ui/contract.ts` exists
- [ ] `/lib/cta/ui/renderer.ts` exists
- [ ] `/lib/cta/ui/visibility.ts` exists
- [ ] `/lib/cta/ui/dispatcher.ts` exists
- [ ] `/lib/cta/ui/analytics.ts` exists
- [ ] `/lib/cta/ui/errorBoundary.ts` exists
- [ ] `/lib/cta/ui/i18n.ts` exists
- [ ] `/lib/cta/ui/accessibility.ts` exists
- [ ] `/lib/cta/ui/empty.ts` exists
- [ ] Zero TypeScript errors in PART 3

---

## 🔌 Integration Steps

### Step 1: Import Dependencies

```typescript
// In your UI component file
import { resolveCTAIntent, buildCTAContract } from "@/lib/cta"
import { prepareCTAForRender, buildRenderProps } from "@/lib/cta/ui/renderer"
import { shouldShowCTA } from "@/lib/cta/ui/visibility"
import { dispatchCTAAction, createActionHandler } from "@/lib/cta/ui/dispatcher"
import { trackCTAEvent } from "@/lib/cta/ui/analytics"
import { buildAccessibilityContract } from "@/lib/cta/ui/accessibility"
import { validateContract } from "@/lib/cta/ui/errorBoundary"
import { checkEmptyState } from "@/lib/cta/ui/empty"
import type { Subscription } from "@/types/subscription"
```

### Step 2: Provide Required Functions

UI must provide these functions:

```typescript
// Translation resolver
const translate = (key: TranslationKey) => t(key) // Your i18n function

// Action handlers
const actionHandlers = {
  onRoute: (path: string) => router.push(path),
  onModal: (modalId: string) => openModal(modalId),
  onExternal: (url: string) => window.open(url, '_blank')
}

// Analytics tracker (optional)
const trackAnalytics = (event: CTAAnalyticsEvent) => {
  analytics.track(event.event, event)
}

// Error handler (optional)
const handleError = (error: CTAError) => {
  console.error('CTA Error:', error)
  // Report to error tracking service
}
```

### Step 3: Build CTA Contract

```typescript
// Get subscription state (from your app)
const subscription: Subscription = {
  status: "past_due",
  startedAt: new Date(),
  trialEndsAt: null,
  currentPeriodEnd: new Date(),
  cancelledAt: null
}

// Resolve intent
const intent = resolveCTAIntent({
  subscription,
  capabilityResult: false,
  error: "payment_required"
})

// Build contract
const contract = buildCTAContract(intent)

// Validate contract (with error handling)
const validContract = validateContract(contract, handleError)
```

### Step 4: Check Visibility

```typescript
// Check if should show CTA
const visibilityCheck = shouldShowCTA(validContract)

if (!visibilityCheck.visible) {
  return null // Don't render
}

// Or use empty state check
const emptyState = checkEmptyState(validContract)
if (emptyState.isEmpty) {
  return null // Don't render
}
```

### Step 5: Prepare for Rendering

```typescript
// Prepare render state
const renderState = prepareCTAForRender(
  validContract,
  translate,
  {
    context: "dashboard",
    instanceId: "cta-1"
  }
)

// Build accessibility contract
const a11y = buildAccessibilityContract(
  validContract,
  renderState.copy.label,
  renderState.copy.helper
)

// Create action handler
const handleAction = createActionHandler(
  validContract.action,
  actionHandlers
)

// Build render props
const renderProps = buildRenderProps(
  renderState,
  handleAction,
  {
    ariaLabel: a11y.aria["aria-label"],
    className: "cta-button",
    testId: "cta-upgrade"
  }
)
```

### Step 6: Track Analytics (Optional)

```typescript
// Track when CTA is viewed
useEffect(() => {
  if (renderState.shouldRender) {
    trackCTAEvent("cta_viewed", validContract, trackAnalytics, {
      context: "dashboard"
    })
  }
}, [renderState.shouldRender])

// Track when CTA is clicked
const handleClick = () => {
  trackCTAEvent("cta_clicked", validContract, trackAnalytics, {
    context: "dashboard"
  })
  
  const result = dispatchCTAAction(validContract.action, actionHandlers)
  
  if (result.dispatched) {
    trackCTAEvent("cta_action_dispatched", validContract, trackAnalytics, {
      context: "dashboard",
      result
    })
  } else {
    trackCTAEvent("cta_action_failed", validContract, trackAnalytics, {
      context: "dashboard",
      reason: result.reason || "unknown"
    })
  }
}
```

### Step 7: Render UI (Your Implementation)

```typescript
// Example using your UI framework
return (
  <button
    onClick={handleClick}
    role={a11y.aria.role}
    aria-label={a11y.aria["aria-label"]}
    aria-disabled={a11y.aria["aria-disabled"]}
    tabIndex={a11y.keyboard.tabIndex}
    className={renderProps.className}
    data-testid={renderProps.testId}
  >
    <span>{renderProps.label}</span>
    {renderProps.helper && (
      <span className="helper">{renderProps.helper}</span>
    )}
  </button>
)
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Test contract building with various subscription states
- [ ] Test visibility logic with different intents
- [ ] Test action dispatching for all action kinds
- [ ] Test empty state detection
- [ ] Test error handling with invalid contracts
- [ ] Test accessibility contract generation

### Integration Tests
- [ ] Test full flow: subscription → intent → contract → render
- [ ] Test translation resolution
- [ ] Test action handler execution
- [ ] Test analytics tracking
- [ ] Test error recovery

### Accessibility Tests
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Test screen reader announcements
- [ ] Test focus management
- [ ] Test ARIA attributes
- [ ] Test color contrast (UI responsibility)

---

## 🚨 Common Pitfalls

### ❌ DON'T
- Don't modify PART 1 or PART 2 code
- Don't add new CTAIntent values
- Don't add new translation keys without updating PART 2
- Don't make visibility decisions in UI (use contract.visible)
- Don't import Next.js router in PART 3 files
- Don't call window.location directly in PART 3 files

### ✅ DO
- Use provided helper functions
- Provide all required handlers to UI layer
- Handle errors gracefully with fallbacks
- Track analytics for debugging
- Test accessibility thoroughly
- Follow the integration flow exactly

---

## 📊 Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ PART 1: Subscription State (FROZEN)                     │
│ - Subscription type                                      │
│ - State helper functions                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ PART 2: CTA Decision Engine (FROZEN)                    │
│ - resolveCTAIntent()                                     │
│ - buildCTAContract()                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ PART 3: UI Binding Layer (THIS PART)                    │
│ - prepareCTAForRender()                                  │
│ - dispatchCTAAction()                                    │
│ - buildAccessibilityContract()                           │
│ - Error handling & analytics                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ UI LAYER (YOUR IMPLEMENTATION)                           │
│ - React/Vue/etc component                                │
│ - Actual rendering                                       │
│ - Event handlers                                         │
│ - Styling                                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Validation

Before considering integration complete:

- [ ] Zero TypeScript errors across all parts
- [ ] All helper functions are pure (no side effects)
- [ ] No PART 1 or PART 2 code was modified
- [ ] UI provides all required handlers
- [ ] Error handling is in place
- [ ] Accessibility requirements are met
- [ ] Analytics tracking is implemented (optional)
- [ ] Empty states are handled gracefully
- [ ] Integration tests pass

---

## 📚 Reference

### Key Files
- **PART 1:** `/types/subscription.ts`, `/lib/subscription/state.ts`
- **PART 2:** `/types/cta.ts`, `/lib/cta/*.ts`, `/lib/i18n/keys.ts`
- **PART 3:** `/lib/cta/ui/*.ts`

### Documentation
- PART 1: See `/lib/subscription/state.ts` comments
- PART 2: See `/lib/cta/README.md`
- PART 3: See this file

---

## ✅ Sign-Off

Once all checklist items are complete:

- [ ] PART 1 is frozen and untouched
- [ ] PART 2 is frozen and untouched
- [ ] PART 3 integration is complete
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Ready for UI component implementation

**Integration Status:** ⏳ Pending UI Implementation

---

**END OF INTEGRATION CHECKLIST**
