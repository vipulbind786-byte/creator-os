# CTA Decision Engine

**Status:** 🔒 FROZEN (PART 2 Complete)  
**Owner:** Core System  
**Type:** Logic-Only (No UI)

---

## 🎯 Purpose

The CTA Decision Engine is a **pure logic system** that determines what call-to-action (CTA) should be shown to users based on their subscription state and capability checks.

**Key Principle:** UI receives a complete contract and renders it. UI does NOT make decisions.

---

## 📦 Architecture

```
┌─────────────────────────────────────────────────┐
│  Input: Subscription + Capability + Error      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ resolveCTAIntent│
         └────────┬────────┘
                  │
                  ▼
              CTAIntent
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
   resolveCTACopy    resolveCTAAction
         │                 │
         ▼                 ▼
      CTACopy          CTAAction
         │                 │
         └────────┬────────┘
                  │
                  ▼
         ┌────────────────┐
         │buildCTAContract│
         └────────┬────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Output: Complete CTAContract (UI-ready)       │
└─────────────────────────────────────────────────┘
```

---

## 🧩 Components

### 1. **CTAIntent** (`types/cta.ts`)
Canonical intent enum representing WHAT the system wants the user to do.

**Values:**
- `UPGRADE` - User should upgrade to paid plan
- `PAY_NOW` - User needs to fix payment
- `FIX_LIMIT` - User hit usage limit
- `CONTACT_SUPPORT` - User should contact support
- `NONE` - No action needed

### 2. **Intent Resolver** (`lib/cta/resolveIntent.ts`)
Pure function that determines intent based on:
- Subscription state (from PART 1)
- Capability result (boolean | "limit_reached" | "feature_locked")
- Normalized error (null | "payment_required" | "limit_exceeded" | "unknown")

**Priority Order:**
1. PAY_NOW (payment issues)
2. CONTACT_SUPPORT (unknown errors)
3. FIX_LIMIT (limits exceeded)
4. UPGRADE (feature locked or no paid access)
5. NONE (all good)

### 3. **Copy Resolver** (`lib/cta/resolveCopy.ts`)
Maps `CTAIntent` → Translation keys.

**Rules:**
- NO raw strings
- ONLY `TranslationKey` references
- One-to-one mapping
- No fallback logic

### 4. **Action Resolver** (`lib/cta/resolveAction.ts`)
Maps `CTAIntent` → Action descriptors.

**Action Kinds:**
- `route` - Navigate to page
- `modal` - Open modal
- `external` - Open external URL
- `none` - No action

**Rules:**
- NO routing logic
- NO UI handling
- Only describes WHAT should happen

### 5. **Contract Builder** (`lib/cta/buildContract.ts`)
Aggregates Copy + Action into final contract.

**Output:**
```typescript
{
  intent: CTAIntent
  visible: boolean  // auto: intent !== "NONE"
  copy: CTACopy
  action: CTAAction
}
```

---

## 🔧 Usage

### Basic Example

```typescript
import { resolveCTAIntent, buildCTAContract } from "@/lib/cta"
import type { Subscription } from "@/types/subscription"

// 1. Resolve intent
const subscription: Subscription = {
  status: "past_due",
  // ... other fields
}

const intent = resolveCTAIntent({
  subscription,
  capabilityResult: false,
  error: "payment_required"
})
// → "PAY_NOW"

// 2. Build complete contract
const contract = buildCTAContract(intent)
// → {
//     intent: "PAY_NOW",
//     visible: true,
//     copy: {
//       labelKey: "cta.pay_now.label",
//       helperKey: "cta.pay_now.helper"
//     },
//     action: {
//       kind: "route",
//       target: "/billing",
//       metadata: { source: "cta_pay_now", action: "update_payment" }
//     }
//   }
```

### UI Integration (Future)

```typescript
// UI component (NOT part of PART 2)
function CTAButton({ contract }: { contract: CTAContract }) {
  if (!contract.visible) return null
  
  const label = t(contract.copy.labelKey)
  const helper = contract.copy.helperKey ? t(contract.copy.helperKey) : null
  
  const handleClick = () => {
    switch (contract.action.kind) {
      case "route":
        router.push(contract.action.target!)
        break
      case "modal":
        openModal(contract.action.target!)
        break
      case "external":
        window.open(contract.action.target!, "_blank")
        break
    }
  }
  
  return <button onClick={handleClick}>{label}</button>
}
```

---

## ✅ Guarantees

- ✅ **Pure functions** - No side effects
- ✅ **Deterministic** - Same input = same output
- ✅ **Type-safe** - Exhaustive checks
- ✅ **Testable** - Each function isolated
- ✅ **No UI coupling** - Zero React/Next.js imports
- ✅ **No routing logic** - UI interprets actions
- ✅ **No raw strings** - Only translation keys

---

## 🚫 Out of Scope

- ❌ UI components
- ❌ React hooks
- ❌ Routing implementation
- ❌ Modal state management
- ❌ Analytics tracking
- ❌ A/B testing
- ❌ Feature flags

---

## 🧪 Testing

Each function can be tested independently:

```typescript
import { resolveCTAIntent } from "@/lib/cta/resolveIntent"

describe("resolveCTAIntent", () => {
  it("returns PAY_NOW for past_due subscription", () => {
    const result = resolveCTAIntent({
      subscription: { status: "past_due", /* ... */ },
    })
    expect(result).toBe("PAY_NOW")
  })
  
  it("returns UPGRADE for free user with locked feature", () => {
    const result = resolveCTAIntent({
      subscription: { status: "free", /* ... */ },
      capabilityResult: "feature_locked",
    })
    expect(result).toBe("UPGRADE")
  })
})
```

---

## 🔒 Frozen Status

**PART 2 is FROZEN 🧊**

Any changes require:
1. Version bump discussion
2. Migration plan
3. Backward compatibility check

---

## 📚 Related

- **PART 1:** Subscription State (`/types/subscription.ts`, `/lib/subscription/state.ts`)
- **PART 3:** (Future) UI Integration
- **Translation System:** `/lib/i18n/`

---

**Last Updated:** 2024  
**Version:** 1.0.0
