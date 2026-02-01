# CTA UI Components (PART 4)

**Status:** ✅ Complete  
**Version:** 1.0.0  
**Dependencies:** PART 1, PART 2, PART 3

---

## 📋 Overview

PART 4 provides **production-ready React components** that consume the frozen CTA system (PART 1, 2, 3).

**CRITICAL:** These components do NOT contain business logic. They ONLY render what the CTA contracts tell them to render.

---

## 🎯 What's Included

### **PART 4.1** — CTA Surface Definition
- `surfaces.ts` - Defines WHERE CTAs appear
- ONE CTA per surface enforced

### **PART 4.2** — CTA Container Component
- `CTAContainer.tsx` - Main container component
- Accepts CTAContract, calls PART 3 helpers
- NO intent decisions

### **PART 4.3** — CTA Button Component
- `CTAButton.tsx` - Pure presentational button
- Receives resolved label + helper
- NO logic

### **PART 4.4** — Visibility Enforcement
- Implemented in CTAContainer
- Uses `shouldShowCTA()` from PART 3
- NO custom visibility logic

### **PART 4.5** — Action Wiring
- `useCTA.ts` - Hooks for action handlers
- UI provides: router, modal manager, external handler
- Uses `dispatchCTAAction()` from PART 3

### **PART 4.6** — Accessibility Enforcement
- Implemented in CTAButton
- Uses `buildAccessibilityContract()` from PART 3
- WCAG AA compliant

### **PART 4.7** — Error Boundary Usage
- Implemented in CTAContainer
- Uses `validateContract()` from PART 3
- Fallback to FALLBACK_CONTRACT

### **PART 4.8** — Empty/NONE Intent Handling
- Implemented in CTAContainer
- Uses `checkEmptyState()` from PART 3
- Gracefully renders nothing

### **PART 4.9** — Analytics Hook Wiring
- Implemented in useCTA.ts
- Uses event descriptors from PART 3
- NO analytics logic

### **PART 4.10** — Integration Example
- `DashboardCTA.tsx` - Complete demo
- Shows full flow: Subscription → Intent → Contract → UI
- NO mock logic

---

## 🔌 Usage

### Basic Usage

```typescript
import { DashboardCTA } from "@/components/cta"
import { createTranslator } from "@/lib/i18n/runtime"
import { TRANSLATIONS_EN } from "@/lib/i18n/en"

// In your component
const translator = createTranslator(TRANSLATIONS_EN)

<DashboardCTA
  subscription={userSubscription}
  capabilityResult={hasAccess}
  error={normalizedError}
  translator={translator}
/>
```

### Advanced Usage

```typescript
import { CTAContainer, useCTAHandlers } from "@/components/cta"
import { resolveCTAIntent, buildCTAContract } from "@/lib/cta"

function MyCustomCTA() {
  const { actionHandlers, analyticsTracker, errorHandler, translate } =
    useCTAHandlers(translator)

  const contract = buildCTAContract(
    resolveCTAIntent({
      subscription,
      capabilityResult,
      error,
    })
  )

  return (
    <CTAContainer
      contract={contract}
      surface="billing_alert"
      translate={translate}
      actionHandlers={actionHandlers}
      analyticsTracker={analyticsTracker}
      errorHandler={errorHandler}
    />
  )
}
```

---

## 📦 Components

### CTAContainer

Main container that orchestrates CTA rendering.

**Props:**
- `contract` - CTAContract from PART 2
- `surface` - Where CTA appears
- `translate` - Translation function
- `actionHandlers` - Action handlers (router, modal, external)
- `analyticsTracker` - Optional analytics tracker
- `errorHandler` - Optional error handler
- `className` - Optional CSS classes

### CTAButton

Pure presentational button component.

**Props:**
- `contract` - Validated contract
- `renderState` - Prepared render state
- `accessibility` - Accessibility contract
- `actionHandlers` - Action handlers
- `analyticsTracker` - Optional analytics tracker
- `surface` - Surface identifier

### DashboardCTA

Complete integration example for dashboard.

**Props:**
- `subscription` - User's subscription state
- `capabilityResult` - Capability check result
- `error` - Normalized error (optional)
- `translator` - Translation function

---

## 🎨 Styling

Components use Tailwind CSS classes and shadcn/ui Button component.

**CSS Classes:**
- `.cta-container` - Container wrapper
- `.cta-surface-{surface}` - Surface-specific styling
- `.cta-button` - Button element
- `.cta-label` - Label text
- `.cta-helper` - Helper text

**Customization:**
```typescript
<CTAContainer
  contract={contract}
  surface="dashboard_banner"
  className="my-custom-class"
  // ...
/>
```

---

## ♿ Accessibility

All components are WCAG AA compliant:

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Screen reader support (ARIA labels)
- ✅ Focus visible indicators
- ✅ Semantic HTML
- ✅ Color contrast (UI responsibility)

---

## 🚨 Constraints

### MUST NOT
- ❌ Add business logic to components
- ❌ Make intent decisions in UI
- ❌ Bypass CTA contracts
- ❌ Modify PART 1, 2, or 3 code
- ❌ Add new CTAIntent values
- ❌ Hardcode pricing or features

### MUST
- ✅ Use CTAContract as single source of truth
- ✅ Call PART 3 helpers for all logic
- ✅ Provide all required handlers
- ✅ Handle errors gracefully
- ✅ Support accessibility
- ✅ Track analytics (optional)

---

## 🧪 Testing

### Unit Tests
```typescript
import { render, screen } from "@testing-library/react"
import { DashboardCTA } from "@/components/cta"

test("renders CTA when contract is visible", () => {
  render(
    <DashboardCTA
      subscription={{ status: "past_due", ... }}
      capabilityResult={false}
      error="payment_required"
      translator={(key) => key}
    />
  )
  
  expect(screen.getByRole("button")).toBeInTheDocument()
})
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│ PART 1: Subscription State (FROZEN)                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ PART 2: CTA Decision Engine (FROZEN)                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ PART 3: UI Binding Layer (FROZEN)                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ PART 4: UI Components (THIS)                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ surfaces.ts      → Surface definitions              │ │
│ │ CTAContainer.tsx → Main container                   │ │
│ │ CTAButton.tsx    → Presentational button            │ │
│ │ useCTA.ts        → Hooks for handlers               │ │
│ │ DashboardCTA.tsx → Integration example              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Guarantees

- ✅ Zero business logic in components
- ✅ All decisions from PART 2 contracts
- ✅ Accessibility compliant
- ✅ Error handling with fallbacks
- ✅ Analytics tracking support
- ✅ Production-ready code
- ✅ Zero TypeScript errors

---

## 📚 Related Documentation

- **PART 1:** `/lib/subscription/state.ts`
- **PART 2:** `/lib/cta/README.md`
- **PART 3:** `/lib/cta/ui/README.md`
- **Integration:** `/lib/cta/ui/integration.md`

---

**PART 4 COMPLETE AND READY FOR FREEZE** 🎉
