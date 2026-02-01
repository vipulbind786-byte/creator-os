# CTA SYSTEM — DEVELOPER CONSTITUTION (STRICT)

⚠️ READ THIS BEFORE TOUCHING ANY CTA CODE

This document defines NON-NEGOTIABLE rules for the CTA system.
Violating these rules will introduce hidden bugs, revenue leaks,
and long-term maintenance debt.

--------------------------------------------------
SYSTEM OVERVIEW
--------------------------------------------------

The CTA system is divided into FOUR FROZEN LAYERS:

PART 1 — Subscription State
PART 2 — CTA Decision Engine
PART 3 — UI Binding Layer
PART 4 — UI Components

DATA FLOWS ONLY TOP → DOWN

Subscription → Intent → Contract → UI

NO layer may pull logic upward.

--------------------------------------------------
GLOBAL NON-NEGOTIABLE RULES
--------------------------------------------------

1. ❌ NEVER infer CTA intent in UI
2. ❌ NEVER show CTA without a CTAContract
3. ❌ NEVER hardcode CTA copy in components
4. ❌ NEVER route directly inside CTAButton
5. ❌ NEVER add business logic in PART 3 or PART 4
6. ❌ NEVER add a CTA without an Intent
7. ❌ NEVER add an Intent without updating all mappings

If you break any of the above:
→ You are bypassing monetization logic.

--------------------------------------------------
PART 1 — SUBSCRIPTION STATE (FROZEN)
--------------------------------------------------

Location:
- /types/subscription.ts
- /lib/subscription/state.ts

Allowed changes:
✅ Add NEW helper functions (pure)
❌ Modify existing helper behavior
❌ Add UI logic
❌ Add pricing rules

RULE:
Subscription helpers answer ONLY questions like:
"isActive?", "isTrial?", "needsPaymentAttention?"

--------------------------------------------------
PART 2 — CTA DECISION ENGINE (FROZEN)
--------------------------------------------------

Location:
- /types/cta.ts
- /lib/cta/*

ROLE:
Decides WHAT the user should do.
NOT how it looks.
NOT how it routes.

RULES:
- CTAIntent is the ONLY output
- Priority order is deterministic
- Same input MUST produce same intent

Adding a new CTAIntent requires:
1. Update CTAIntent type
2. Update resolveCTAIntent()
3. Update resolveCTACopy()
4. Update resolveCTAAction()
5. Update i18n keys (en + hi)
6. Update README

If ANY step is skipped → BUILD MUST FAIL.

--------------------------------------------------
PART 3 — UI BINDING LAYER (FROZEN)
--------------------------------------------------

Location:
- /lib/cta/ui/*

ROLE:
Transforms CTAContract into UI-safe structures.

STRICT RULES:
❌ No React
❌ No JSX
❌ No router imports
❌ No window / document access
❌ No side effects

Allowed:
✅ Type guards
✅ Accessibility contracts
✅ Analytics descriptors
✅ Error fallback contracts

PART 3 MUST REMAIN FRAMEWORK-AGNOSTIC.

--------------------------------------------------
PART 4 — UI COMPONENTS (CONTROLLED)
--------------------------------------------------

Location:
- /components/cta/*

ROLE:
Render only.
Never decide.

RULES:
- CTAContainer owns visibility
- CTAButton is PURE presentation
- useCTA handles wiring only
- UI receives FINAL data, never computes it

UI MAY:
✅ Style
✅ Animate
✅ Layout
❌ Decide intent
❌ Override visibility
❌ Change copy keys

--------------------------------------------------
ADDING A NEW CTA (CHECKLIST)
--------------------------------------------------

DO NOT SKIP ANY STEP.

1. Define new CTAIntent
2. Define business condition (PART 2)
3. Define copy keys
4. Define action descriptor
5. Add i18n translations
6. Verify PART 3 compatibility
7. Render via existing CTAContainer

If step 7 requires new logic → DESIGN IS WRONG.

--------------------------------------------------
SURFACE RULES (VERY IMPORTANT)
--------------------------------------------------

ONE SURFACE = ONE CTA

Surfaces:
- dashboard_banner
- billing_alert
- product_gate
- empty_state

Never stack CTAs.
Never show multiple CTAs for same intent.

--------------------------------------------------
ERROR HANDLING RULE
--------------------------------------------------

If anything fails:
- Fallback to FALLBACK_CONTRACT
- Show NOTHING rather than wrong CTA

Wrong CTA = revenue damage.

--------------------------------------------------
FUTURE EXTENSION POLICY
--------------------------------------------------

Allowed extensions:
✅ New Intent
✅ New Surface
✅ New Copy
✅ New Analytics events

Disallowed:
❌ Logic shortcuts
❌ UI-based decisions
❌ Silent overrides

--------------------------------------------------
FINAL WARNING
--------------------------------------------------

This system is intentionally strict.

If it feels "hard to change":
→ That is the DESIGN WORKING.

Ease of change comes from:
- Clear intent
- Clear ownership
- Clear flow

Not from shortcuts.

--------------------------------------------------
OWNER SIGN-OFF REQUIRED
--------------------------------------------------

Any change to PART 1 or PART 2 requires:
- Written rationale
- Impact analysis
- Version bump