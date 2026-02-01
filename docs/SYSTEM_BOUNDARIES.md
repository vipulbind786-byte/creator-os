# SYSTEM BOUNDARIES — INSIGHT ENGINE (V1 LOCKED)

This document defines **strict boundaries** between
UI, Engine, APIs, and Database.

Breaking these rules = architectural violation.

---

## 🧱 SYSTEM LAYERS
──────────────┐ │     UI       │  (React / Client Components) └──────┬───────┘ │ read-only ▼ ┌──────────────┐ │     API      │  (Next.js Route Handlers) └──────┬───────┘ │ controlled writes ▼ ┌──────────────┐ │   ENGINE     │  (Pure Logic) └──────┬───────┘ │ decisions only ▼ ┌──────────────┐ │     DB       │  (Source of Truth) └──────────────┘
---

## 🎨 UI (CLIENT)

**ALLOWED**
- Render insights
- Trigger actions (dismiss / explain)
- Open drawers / modals
- Send intent to API

**FORBIDDEN**
❌ Mutating insight state  
❌ Writing cooldown logic  
❌ Applying rules  
❌ Resolving insights  
❌ Reading DB directly  

> UI = dumb renderer + event emitter

---

## 🌐 API LAYER

**ALLOWED**
- Authenticate user
- Call engine (read-only)
- Persist state changes
- Log audit events

**FORBIDDEN**
❌ Business rules  
❌ Cooldown math  
❌ Priority logic  
❌ Explainability reasoning  

> API = traffic cop, not brain

---

## 🧠 ENGINE (PURE LOGIC)

Includes:
- rules.ts
- evaluate.ts
- cooldown.ts
- dedupe.ts
- sessionCap.ts
- explain.ts
- resolveRules.ts

**ALLOWED**
- Read inputs
- Compute decisions
- Return immutable results

**FORBIDDEN**
❌ DB access  
❌ API calls  
❌ Cookies  
❌ Dates except via params  
❌ Side effects  

> Engine = math, not memory

---

## 🗄️ DATABASE (TRUTH)

**ALLOWED**
- Persist lifecycle state
- Store audit logs
- Enforce uniqueness

**FORBIDDEN**
❌ Business logic  
❌ Derived decisions  
❌ UI assumptions  

> DB = history + authority

---

## 🔁 DATA FLOW (ONE WAY)
DB ─▶ Engine ─▶ API ─▶ UI ▲ │ (inputs)
❌ Reverse flow is NOT allowed.

---

## 🧨 VIOLATION EXAMPLES

| Violation | Why dangerous |
|---------|---------------|
| Rule reads DB | Non-deterministic |
| UI resolves insight | State corruption |
| API applies cooldown | Logic duplication |
| Engine mutates state | Impossible to debug |

---

## 🧊 VERSION GUARANTEE

These boundaries are LOCKED for v1.

Future changes require:
- Version bump
- Migration plan
- Boundary re-audit

---

END OF FILE
