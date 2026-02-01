# OBSERVABILITY_INSIGHT_ENGINE_V1

Version: v1  
Status: LOCKED  
Scope: Debugging, Logging, Human Observability (NOT monitoring infra)

---

## 🎯 Objective

Make the Insight Engine:
- Easy to debug
- Easy to reason about
- Safe to extend later
- Transparent for developers

WITHOUT:
- Adding monitoring tools
- Adding external services
- Adding background jobs
- Polluting core logic

---

## 👁️ What “Observability” Means Here

This project follows **HUMAN-FIRST observability**, not infra-level monitoring.

Observability here means:
- A developer can answer **WHY** an insight appeared
- A developer can trace **WHEN** it changed state
- A developer can verify **WHAT** rule triggered it
- A developer can debug issues using logs + DB

---

## 🧩 Observability Layers

### 1️⃣ Explainability Engine (Primary)

Already implemented via:
- `explainInsight()`
- Explain Drawer UI
- `/api/insights/explain`

This answers:
- Why am I seeing this?
- Which metric triggered it?
- What was the threshold?
- Why now (first time / cooldown expired)?

This is the **core observability layer**.

---

### 2️⃣ Audit Log (Secondary)

Already implemented via:
- `auditLogger.ts`
- Events:
  - seen
  - dismissed
  - resolved

Stored in DB with:
- user_id
- insight_id
- event
- timestamp
- metadata

This answers:
- What happened historically?
- Did the user dismiss this before?
- Was it auto-resolved?
- When did state change?

---

### 3️⃣ Defensive Console Logging (Tertiary)

Allowed ONLY in:
- API routes
- Dashboard server page
- Never inside rules

Purpose:
- Catch DB failures
- Catch invalid payloads
- Catch unexpected runtime errors

🚫 NEVER:
- Log inside rule functions
- Log inside pipeline helpers
- Log inside explainability logic

---

## 🛑 Explicitly Disallowed

The following are **NOT allowed**:

- ❌ Logging inside rule functions
- ❌ Logging inside cooldown evaluator
- ❌ Logging inside dedupe / session cap
- ❌ Silent mutation without audit log
- ❌ Debug flags inside engine logic

---

## 🧠 Debug Playbooks (Human SOP)

### Problem: “Why did this insight show?”

→ Open Explain Drawer  
→ Check:
- trigger.metric_key
- trigger.threshold
- why_now.reason

---

### Problem: “Why did it reappear?”

→ Check `cooldown_until`  
→ Check audit log for dismiss count  
→ Check severity escalation

---

### Problem: “Why is it NOT showing?”

→ Check:
- `insight_state.status`
- `cooldown_until`
- session cap
- dedupe

---

## 🧱 Invariants (Do Not Break)

- Observability must NEVER change logic
- Explainability must remain read-only
- Logs must not affect execution
- Debug must be removable without refactor

---

## ✅ Final Status

- Explainability = ACTIVE
- Audit log = ACTIVE
- Debug discipline = DOCUMENTED
- No infra dependency introduced

**STEP 5.8 — COMPLETE**