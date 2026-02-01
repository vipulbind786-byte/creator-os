# CTA LIFECYCLE DIAGNOSTIC LAYER (PART 7)

**Status:** ✅ Complete  
**Version:** v1  
**Purpose:** Read-Only User Lifecycle Classification

---

## 🚨 WHAT THIS SYSTEM CANNOT DO

**ABSOLUTE RULE:**  
PART 7 is **DIAGNOSTIC ONLY**. It MUST NEVER:

❌ Change CTA intent  
❌ Change CTA visibility  
❌ Hide CTAs  
❌ Suppress CTAs  
❌ Gate features  
❌ Adjust pricing  
❌ Personalize UI  
❌ Run A/B tests  
❌ Optimize conversions  
❌ Make business decisions

**WHY:**  
Lifecycle classification is for **understanding users**, NOT for treating them differently.

---

## 🔒 IMPORT BOUNDARY (STRICTLY ENFORCED)

### ❌ FORBIDDEN IMPORTS

**PART 7 MUST NOT import from:**
- ❌ PART 1 (Subscription State)
- ❌ PART 2 (CTA Decision Engine)
- ❌ PART 3 (UI Binding Layer)
- ❌ PART 4 (UI Components)

**Exception:** Type-only imports are allowed:
```typescript
// ✅ ALLOWED
import type { LifecycleState } from "@/types/cta-lifecycle"
import type { SignalBucket } from "@/types/cta-lifecycle"

// ❌ FORBIDDEN
import { resolveCTAIntent } from "@/lib/cta/resolveIntent"
import { shouldShowCTA } from "@/lib/cta/ui/visibility"
```

### ❌ FORBIDDEN EXPORTS

**PART 1-6 MUST NOT import from PART 7:**
```typescript
// ❌ FORBIDDEN in PART 1-6
import { resolveLifecycleState } from "@/lib/cta/lifecycle"
import { buildLifecycleSnapshot } from "@/lib/cta/lifecycle"
```

**WHY:**  
If PART 1-6 imports PART 7, lifecycle becomes coupled to CTA logic.

---

## 📦 What's Included

### 1. Types (`/types/cta-lifecycle.ts`)
- `LifecycleState` - 8 states (NEW_USER → CHURNED)
- `LifecycleSignalInput` - Aggregated signals
- `LifecycleSnapshot` - Complete diagnostic snapshot
- `ConfidenceLevel` - high, medium, low
- `SignalBucket` - low, medium, high, unknown

### 2. Normalization (`normalize.ts`)
Pure normalization functions:
- `normalizeDaysSinceFirstSeen()` - Bucket: 0-7, 8-30, 31+
- `normalizeDaysSinceLastActivity()` - Bucket: 0-3, 4-14, 15+
- `normalizeExposureCount()` - Bucket: 0-5, 6-15, 16+
- `normalizeEngagementRatio()` - Bucket: <0.2, 0.2-0.5, >0.5
- `normalizeFatigueSeverity()` - Map from PART 6 analytics

### 3. State Resolver (`resolve.ts`)
Deterministic classification:
- `resolveLifecycleState()` - Classify user into ONE state
- `getStateDescription()` - Human-readable description
- Priority order: CHURNED → DORMANT → AT_RISK → POWER_USER → ACTIVE → ACTIVATING → ONBOARDING → NEW_USER

### 4. Snapshot Builder (`snapshot.ts`)
Audit-grade snapshots:
- `buildLifecycleSnapshot()` - Create complete snapshot
- `getSnapshotSummary()` - Human-readable summary
- `hasHighConfidence()` - Filter low-confidence
- `isSnapshotRecent()` - Cache invalidation

### 5. Versioning (`versioning.ts`)
Version tracking:
- `CTA_LIFECYCLE_VERSION` - Current version
- `validateVersionCompatibility()` - Version check
- `hasValidVersions()` - Snapshot validation

---

## 🎯 Lifecycle States (EXACT, LOCKED)

### NEW_USER
- **Definition:** User just signed up, minimal activity
- **Signals:** 0-7 days since first seen, minimal interaction

### ONBOARDING
- **Definition:** User is learning the product (0-7 days)
- **Signals:** Very new, some activity

### ACTIVATING
- **Definition:** User is building habits (8-30 days)
- **Signals:** New-ish, recent activity, some engagement

### ACTIVE
- **Definition:** User has regular usage patterns
- **Signals:** Established (8+ days), recent activity, moderate+ engagement

### POWER_USER
- **Definition:** User has high engagement and active subscription
- **Signals:** High engagement, active subscription, established, recent activity

### AT_RISK
- **Definition:** User showing churn signals
- **Signals:** High fatigue, dismissed as annoying, compliance flags, OR moderate inactivity + low engagement

### DORMANT
- **Definition:** User inactive for 15-29 days
- **Signals:** 15-29 days since last activity

### CHURNED
- **Definition:** User has left
- **Signals:** Subscription cancelled/expired OR 30+ days inactive

---

## ✅ ALLOWED USAGE

### User Segmentation (Reporting Only)
```typescript
import { buildLifecycleSnapshot } from "@/lib/cta/lifecycle"

// Build snapshot for reporting
const snapshot = buildLifecycleSnapshot(signalInput, new Date())

console.log(`User is ${snapshot.state} (${snapshot.confidence} confidence)`)

// Send to analytics dashboard (read-only)
analyticsLogger.log({
  user_id: userId,
  lifecycle_state: snapshot.state,
  confidence: snapshot.confidence,
})
```

### Cohort Analysis
```typescript
import { resolveLifecycleState } from "@/lib/cta/lifecycle"

// Classify users for cohort analysis
const users = await getAllUsers()
const cohorts = users.map((user) => ({
  user_id: user.id,
  state: resolveLifecycleState(user.signals),
}))

// Generate cohort report (read-only)
const report = generateCohortReport(cohorts)
```

### Confidence Filtering
```typescript
import { buildLifecycleSnapshot, hasHighConfidence } from "@/lib/cta/lifecycle"

// Build snapshot
const snapshot = buildLifecycleSnapshot(signalInput, new Date())

// Filter low-confidence for reporting
if (hasHighConfidence(snapshot)) {
  console.log(`High confidence: ${snapshot.state}`)
} else {
  console.log(`Low confidence: ${snapshot.state} (needs more data)`)
}
```

---

## ❌ FORBIDDEN USAGE (CODE EXAMPLES)

### ❌ DO NOT Use for CTA Decisions

```typescript
// ❌ WRONG - Lifecycle affecting CTA logic
import { resolveLifecycleState } from "@/lib/cta/lifecycle"

function resolveCTAIntent(input) {
  const state = resolveLifecycleState(lifecycleSignals)
  
  // ❌ FORBIDDEN - Using lifecycle to change intent
  if (state === "AT_RISK") {
    return "NONE" // ❌ WRONG - suppressing CTA
  }
  
  // ... rest of logic
}
```

**WHY FORBIDDEN:**  
This couples lifecycle to business logic, violating separation of concerns.

### ❌ DO NOT Use for Feature Gating

```typescript
// ❌ WRONG - Lifecycle affecting features
import { buildLifecycleSnapshot } from "@/lib/cta/lifecycle"

function canAccessFeature(userId) {
  const snapshot = buildLifecycleSnapshot(signals, new Date())
  
  // ❌ FORBIDDEN - Using lifecycle to gate features
  if (snapshot.state === "POWER_USER") {
    return true // ❌ WRONG - special treatment
  }
  
  return false
}
```

**WHY FORBIDDEN:**  
Lifecycle is for understanding, not for access control.

### ❌ DO NOT Use for Pricing

```typescript
// ❌ WRONG - Lifecycle affecting pricing
import { resolveLifecycleState } from "@/lib/cta/lifecycle"

function calculatePrice(userId) {
  const state = resolveLifecycleState(signals)
  
  // ❌ FORBIDDEN - Using lifecycle for pricing
  if (state === "AT_RISK") {
    return basePrice * 0.8 // ❌ WRONG - discount for at-risk
  }
  
  return basePrice
}
```

**WHY FORBIDDEN:**  
Pricing must be transparent and consistent, not based on hidden signals.

### ❌ DO NOT Use for Personalization

```typescript
// ❌ WRONG - Lifecycle affecting UI
import { buildLifecycleSnapshot } from "@/lib/cta/lifecycle"

function DashboardPage() {
  const snapshot = buildLifecycleSnapshot(signals, new Date())
  
  // ❌ FORBIDDEN - Using lifecycle to personalize UI
  if (snapshot.state === "ONBOARDING") {
    return <OnboardingDashboard /> // ❌ WRONG
  }
  
  return <RegularDashboard />
}
```

**WHY FORBIDDEN:**  
UI must be consistent, not based on hidden classification.

### ❌ DO NOT Use for A/B Testing

```typescript
// ❌ WRONG - Lifecycle affecting experiments
import { resolveLifecycleState } from "@/lib/cta/lifecycle"

function assignExperimentVariant(userId) {
  const state = resolveLifecycleState(signals)
  
  // ❌ FORBIDDEN - Using lifecycle for A/B testing
  if (state === "POWER_USER") {
    return "variant_A" // ❌ WRONG - biased assignment
  }
  
  return "variant_B"
}
```

**WHY FORBIDDEN:**  
Experiments must have random assignment, not based on lifecycle.

---

## 🎯 Correct Integration Pattern

### Step 1: CTA Logic (PART 1-4)
```typescript
// CTA logic runs independently
const intent = resolveCTAIntent({ subscription, capabilityResult })
const contract = buildCTAContract(intent)

// CTA is shown based on contract ONLY
if (shouldShowCTA(contract)) {
  renderCTA(contract)
}
```

### Step 2: Governance Observation (PART 5)
```typescript
// AFTER CTA logic, record for observability
import { recordExposure } from "@/lib/cta/governance"

const memory = recordExposure(existingMemory, new Date())
```

### Step 3: Analytics Aggregation (PART 6)
```typescript
// Separate process - analytics reporting
import { generateFatigueSignals } from "@/lib/cta/analytics"

const fatigueSignals = generateFatigueSignals(memory, new Date())
```

### Step 4: Lifecycle Classification (PART 7)
```typescript
// Separate process - lifecycle diagnostic
import { buildLifecycleSnapshot } from "@/lib/cta/lifecycle"

const signalInput = {
  days_since_first_seen: 15,
  days_since_last_activity: 2,
  total_exposures: 10,
  total_interactions: 3,
  fatigue_severity: fatigueSignals.severity,
  subscription_status: "active",
}

const snapshot = buildLifecycleSnapshot(signalInput, new Date())

// Display in admin dashboard (read-only)
console.log(getSnapshotSummary(snapshot))
```

**KEY:** Lifecycle observes and classifies, never decides.

---

## 🚫 WHY NO AUTOMATION EXISTS

**PART 7 is intentionally powerless.**

We do NOT provide:
- Auto-suppression based on lifecycle
- Auto-personalization based on state
- Auto-pricing based on classification
- Smart recommendations
- Predictive models

**WHY:**

1. **Fairness:** All users deserve equal treatment
2. **Transparency:** Users should know why they see what they see
3. **Trust:** Hidden classification erodes trust
4. **Compliance:** Differential treatment may violate regulations
5. **Separation:** Lifecycle must remain separate from business logic

**If you need automation, you're using the wrong tool.**

---

## 📊 Signal Input Guidelines

### Required Signals (Minimum)
- `days_since_first_seen` - From PART 5 governance
- `days_since_last_activity` - From PART 5 governance

### Recommended Signals
- `total_exposures` - From PART 5 governance
- `total_interactions` - From PART 5 governance
- `fatigue_severity` - From PART 6 analytics
- `subscription_status` - From PART 1 (type-only)

### Optional Signals
- `dismissal_count` - From PART 5 governance
- `dismissed_as_annoying` - From PART 5 governance
- `has_compliance_flags` - From PART 6 analytics

### Missing Signals
- Missing signals reduce confidence
- `unknown` ≠ zero
- `unknown` = data not available
- Low confidence snapshots should be flagged

---

## 🧪 Confidence Calculation

### High Confidence
- 0-1 unknown signals
- Clear state classification
- Sufficient data

### Medium Confidence
- 2-3 unknown signals
- Some ambiguity
- Partial data

### Low Confidence
- 4+ unknown signals
- High ambiguity
- Insufficient data

**Use Case:** Filter low-confidence snapshots in reporting.

---

## 📚 Architecture

```
┌─────────────────────────────────────────────────────────┐
│ PART 1-6: CTA System + Governance + Analytics (FROZEN)  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ (one-way observation)
                 ▼
┌─────────────────────────────────────────────────────────┐
│ PART 7: Lifecycle Diagnostic (OBSERVATIONAL)            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Signals → Normalize → Resolve → Snapshot           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                 │
                 ▼
         Admin Dashboard / Reports
```

**Flow:** CTA system runs → Governance observes → Analytics aggregates → Lifecycle classifies → Reports generated

**NO FEEDBACK LOOP** - Lifecycle never affects CTA.

---

## ✅ Guarantees

- ✅ PART 7 is diagnostic only
- ✅ No imports from PART 1-6 (except types)
- ✅ No exports used by PART 1-6
- ✅ Pure functions only
- ✅ No side effects
- ✅ Deterministic classification
- ✅ Version tracked
- ✅ Audit-grade snapshots

---

## 📚 Related Documentation

- **PART 1:** `/lib/subscription/state.ts`
- **PART 2:** `/lib/cta/README.md`
- **PART 3:** `/lib/cta/ui/README.md`
- **PART 4:** `/components/cta/README.md`
- **PART 5:** `/lib/cta/governance/README.md`
- **PART 6:** `/lib/cta/analytics/README.md`

---

**PART 7 CANNOT AFFECT CTA BEHAVIOR** ✅

Any violation of this rule is a **CRITICAL BUG** and must be fixed immediately.

This is diagnostic infrastructure, not growth tooling.
