# ARCHITECTURE RULES — INSIGHT ENGINE (V1)

Status: 🔒 LOCKED (Post v1 Freeze)  
Owner: Core System  
Audience: Developers, Future Maintainers, Product Engineers

---

## 🎯 PURPOSE

This document defines **non-negotiable architectural rules** for the Insight Engine.

Any change that violates these rules is considered a **breaking change** and
must be rejected unless a full version upgrade (v2+) is explicitly approved.

---

## 🧱 CORE PRINCIPLES (DO NOT BREAK)

### 1. Engine Purity
- Insight rules MUST be pure functions
- No DB access inside rules
- No UI logic inside engine
- No side effects

✅ Allowed: metrics → insight/null  
❌ Forbidden: DB calls, fetch, cookies, UI state

---

### 2. Database Is the Source of Truth
- Insight visibility, dismissal, resolution, cooldown
  are derived ONLY from DB state
- UI must NEVER guess state
- UI must NEVER mutate insight objects

✅ DB = truth  
❌ UI = authority

---

### 3. UI Is a Dumb Renderer
- UI receives insights and renders them
- UI may trigger API calls (dismiss / seen)
- UI must not:
  - resolve insights
  - dedupe insights
  - apply cooldown logic

---

### 4. One-Way Data Flow
Metrics -> Rules -> Pipeline -> DB Filter -> UI
Reverse flow is strictly forbidden.

---

### 5. Explainability Is Read-Only
- Explainability engine:
  - does NOT modify DB
  - does NOT affect visibility
- Used only for transparency & trust

Explainability failure must NOT break insights.

---

## 🧠 INSIGHT LIFECYCLE (LOCKED)

- NEW → ACTIVE
- ACTIVE → DISMISSED → COOLDOWN → ACTIVE
- ACTIVE → RESOLVED (terminal)

Once RESOLVED:
- Insight must NEVER reappear
- Even if rule becomes true again

---

## 🧩 MODULE RESPONSIBILITIES

### rules.ts
- Contains ONLY rule definitions
- No imports from DB, UI, APIs

### evaluate.ts
- Applies rules
- Applies cooldown logic
- Produces evaluated insights

### dedupe.ts
- Prevents duplicate semantic insights
- Pure logic only

### sessionCap.ts
- Limits insight count per session
- No persistence

### pipeline.ts
- Single orchestration entry point
- Dashboard MUST use this

### state.ts
- DB synchronization
- Resolution handling
- Lifecycle persistence

### explain.ts
- Read-only explanation
- Locked JSON output contract

---

## 🚫 EXPLICITLY OUT OF SCOPE (DO NOT ADD IN V1)

- Insight editing UI
- Rule toggling UI
- DB-driven rule configs
- Background cron jobs
- Webhooks
- ML / AI scoring
- A/B experiments

These belong to v2+ only.

---

## 🛡 FAILURE HANDLING RULES

- If metrics fail → return empty insights
- If DB fails → render dashboard without insights
- If explain API fails → drawer shows fallback text
- NEVER throw uncaught errors to UI

---

## 🧪 TESTING EXPECTATIONS

- Rules must be unit-testable
- Pipeline must be deterministic
- No random / time-based logic without explicit `now`

---

## 🧊 FREEZE GUARANTEE

As of v1:
- Core logic is locked
- Schema changes require migration docs
- Breaking changes require version bump

---

## 🧠 GOLDEN RULES (WRITE ON WALL)

❌ Never mutate insights in UI  
❌ Never add DB logic inside rules  
❌ Never couple explainability to UI  

✅ Engine stays pure  
✅ DB = truth  
✅ UI = dumb renderer  

---

END OF FILE