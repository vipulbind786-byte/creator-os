# CTA UI Binding Layer (PART 3)

**Status:** ✅ Complete  
**Version:** 1.0.0  
**Dependencies:** PART 1 (Subscription State), PART 2 (CTA Decision Engine)

---

## 📋 Overview

PART 3 provides a **logic-only UI binding layer** that connects the frozen CTA Decision Engine (PART 2) to the UI layer without changing its behavior.

**CRITICAL:** This is NOT a UI component library. It provides pure functions and type contracts that UI components consume.

---

## 🎯 Purpose

PART 3 answers the question: **"How does UI consume the CTA Decision Engine?"**

It provides:
- ✅ Type-safe contracts for UI consumption
- ✅ Pure transformation functions
- ✅ Error handling strategies
- ✅ Accessibility requirements
- ✅ Analytics event descriptors
- ✅ Integration guidelines

It does NOT provide:
- ❌ React/Vue/Svelte components
- ❌ Routing implementation
- ❌ Modal state management
- ❌ Actual rendering logic
- ❌ Styling/CSS

---

## 📦 Modules

### 1. **contract.ts** — UI-Safe Contract
- `CTAUIContract` - Extended contract with optional UI metadata
- `RenderedCTACopy` - Resolved translation strings
- `CTARenderState` - Complete rendering state
- Helper type guards

**Purpose:** Define what UI receives from the decision engine.

### 2. **renderer.ts** — Render Preparation
- `prepareCTAForRender()` - Transform contract to render state
- `buildRenderProps()` - Extract props for UI component
- `TranslationResolver` - Translation function signature

**Purpose:** Prepare contract for rendering without making decisions.

### 3. **visibility.ts** — Visibility Guard
- `shouldShowCTA()` - Check if CTA should be visible
- `canRenderCTA()` - Early return helper
- `VISIBILITY_POLICY` - Read-only documentation

**Purpose:** Pure passthrough of contract.visible with defensive guards.

### 4. **dispatcher.ts** — Action Dispatcher
- `dispatchCTAAction()` - Interpret action descriptor
- `createActionHandler()` - Handler factory
- `ActionHandlers` - Handler function signatures

**Purpose:** Delegate action execution to UI-provided handlers.

### 5. **analytics.ts** — Analytics Events
- Event type definitions (viewed, clicked, dispatched, failed)
- Event builder functions
- `trackCTAEvent()` - Convenience wrapper

**Purpose:** Create analytics event descriptors (UI provides tracker).

### 6. **errorBoundary.ts** — Error Handling
- `validateContract()` - Contract validation
- `handleCTAError()` - Error handling with fallback
- `FALLBACK_CONTRACT` - Display-safe fallback
- `safeExecute()` - Safe execution wrapper

**Purpose:** Graceful error handling with display-safe defaults.

### 7. **i18n.ts** — Translation Resolution
- `resolveCTACopy()` - Resolve translation keys
- `validateTranslationKeys()` - Key validation
- Fallback strategy for missing translations

**Purpose:** Safe translation resolution (UI provides translator).

### 8. **accessibility.ts** — Accessibility Contract
- `buildAccessibilityContract()` - ARIA attributes builder
- Keyboard navigation requirements
- Screen reader announcements
- WCAG AA compliance guidelines

**Purpose:** Define accessibility requirements for UI.

### 9. **empty.ts** — Empty State Handling
- `checkEmptyState()` - Detect empty states
- `isEmptyState()` - Convenience helper
- `handleEmptyState()` - Strategy-based handling

**Purpose:** Handle NONE intent and empty states gracefully.

### 10. **integration.md** — Integration Guide
- Step-by-step integration instructions
- Testing checklist
- Common pitfalls
- Flow diagrams

**Purpose:** Guide UI implementation.

---

## 🔌 Usage Example

```typescript
import { resolveCTAIntent, buildCTAContract } from "@/lib/cta"
import {
  prepareCTAForRender,
  dispatchCTAAction,
  buildAccessibilityContract,
  shouldShowCTA,
} from "@/lib/cta/ui"

// 1. Build contract (from PART 2)
const intent = resolveCTAIntent({
  subscription,
  capabilityResult: false,
  error: "payment_required"
})
const contract = buildCTAContract(intent)

// 2. Check visibility
const visibilityCheck = shouldShowCTA(contract)
if (!visibilityCheck.visible) return null

// 3. Prepare for rendering
const renderState = prepareCTAForRender(
  contract,
  (key) => t(key), // Your i18n function
  { context: "dashboard" }
)

// 4. Build accessibility
const a11y = buildAccessibilityContract(
  contract,
  renderState.copy.label,
  renderState.copy.helper
)

// 5. Create action handler
const handleAction = () => {
  dispatchCTAAction(contract.action, {
    onRoute: (path) => router.push(path),
    onModal: (id) => openModal(id),
    onExternal: (url) => window.open(url, '_blank')
  })
}

// 6. Render (your UI framework)
return (
  <button
    onClick={handleAction}
    aria-label={a11y.aria["aria-label"]}
    role={a11y.aria.role}
  >
    {renderState.copy.label}
  </button>
)
```

---

## 🧪 Testing

### Unit Tests
```typescript
import { prepareCTAForRender, shouldShowCTA } from "@/lib/cta/ui"

describe("CTA UI Binding", () => {
  it("should prepare contract for rendering", () => {
    const contract = buildCTAContract("UPGRADE")
    const renderState = prepareCTAForRender(
      contract,
      (key) => key,
      { context: "test" }
    )
    
    expect(renderState.shouldRender).toBe(true)
    expect(renderState.copy.label).toBeDefined()
  })

  it("should detect empty states", () => {
    const contract = buildCTAContract("NONE")
    const check = shouldShowCTA(contract)
    
    expect(check.visible).toBe(false)
    expect(check.reason).toBe("intent_none")
  })
})
```

---

## 🚨 Constraints

### MUST NOT
- ❌ Modify PART 1 or PART 2 code
- ❌ Add new CTAIntent values
- ❌ Add new translation keys
- ❌ Make visibility decisions (use contract.visible)
- ❌ Import React/Next.js in PART 3 files
- ❌ Add routing logic
- ❌ Add modal state management

### MUST
- ✅ Keep all functions pure
- ✅ Provide defensive guards
- ✅ Use exhaustive type checks
- ✅ Delegate to UI-provided handlers
- ✅ Return display-safe fallbacks
- ✅ Document all public APIs

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
│ - Intent Resolution                                      │
│ - Copy Resolution                                        │
│ - Action Resolution                                      │
│ - Contract Building                                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ PART 3: UI Binding Layer (THIS)                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ contract.ts      → UI-safe contracts                │ │
│ │ renderer.ts      → Render preparation               │ │
│ │ visibility.ts    → Visibility guards                │ │
│ │ dispatcher.ts    → Action delegation                │ │
│ │ analytics.ts     → Event descriptors                │ │
│ │ errorBoundary.ts → Error handling                   │ │
│ │ i18n.ts          → Translation resolution           │ │
│ │ accessibility.ts → A11y requirements                │ │
│ │ empty.ts         → Empty state handling             │ │
│ └─────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ UI LAYER (YOUR IMPLEMENTATION)                           │
│ - React/Vue/Svelte components                            │
│ - Actual rendering                                       │
│ - Event handlers                                         │
│ - Styling                                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Guarantees

### Type Safety
- ✅ Zero TypeScript errors
- ✅ Exhaustive type checks
- ✅ Strict null checks
- ✅ No `any` types

### Purity
- ✅ All functions are pure
- ✅ No side effects
- ✅ Deterministic output
- ✅ No Date.now() (accept dates as input)

### Backward Compatibility
- ✅ No breaking changes to PART 1 or PART 2
- ✅ Additive-only changes
- ✅ Optional metadata fields
- ✅ Graceful degradation

### Error Handling
- ✅ Never throws to UI
- ✅ Always provides fallback
- ✅ Display-safe defaults
- ✅ Defensive guards

---

## 📚 Related Documentation

- **PART 1:** `/lib/subscription/state.ts`
- **PART 2:** `/lib/cta/README.md`
- **Integration:** `/lib/cta/ui/integration.md`
- **Architecture:** `/docs/ARCHITECTURE_RULES.md`

---

## ✅ Validation Checklist

Before using PART 3:

- [ ] PART 1 is frozen and untouched
- [ ] PART 2 is frozen and untouched
- [ ] Zero TypeScript errors
- [ ] All functions are pure
- [ ] UI provides all required handlers
- [ ] Error handling is in place
- [ ] Accessibility requirements understood
- [ ] Integration guide reviewed

---

## 🎓 Key Concepts

### Contract-Based Design
UI receives complete contracts, not partial data. No decisions in UI.

### Inversion of Control
UI provides handlers (router, modal, analytics). PART 3 calls them.

### Defensive Programming
All functions handle null/undefined gracefully with fallbacks.

### Separation of Concerns
Logic (PART 2) → Binding (PART 3) → Rendering (UI)

---

**END OF PART 3 README**
