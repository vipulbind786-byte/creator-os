# FAILURE MODES & SAFETY NETS — INSIGHT ENGINE (V1)

This document defines:
- What can fail
- How the system reacts
- What MUST NEVER happen

---

## 🧨 FAILURE CLASSIFICATION

### 1️⃣ ENGINE FAILURE (Logic crash)

**Examples**
- Rule throws exception
- Cooldown logic breaks
- Dedup fails

**RESPONSE**
- Engine returns empty insight list
- Logs error (server-side only)
- UI shows NO insights

**WHY**
> No insight is better than a wrong insight.

---

### 2️⃣ API FAILURE

**Examples**
- /dismiss fails
- /seen fails
- /explain fails

**RESPONSE**
- UI continues rendering
- Silent fail where possible
- Retry allowed only via user action

**MUST NOT**
❌ Block dashboard  
❌ Lock UI  
❌ Retry infinitely  

---

### 3️⃣ DATABASE FAILURE

**Examples**
- insight_state unavailable
- audit log insert fails

**RESPONSE**
- Treat all insights as NEW
- Do NOT auto-dismiss
- Do NOT auto-resolve
- Show minimal safe insights

**WHY**
> DB unavailable = no memory, not wrong memory.

---

### 4️⃣ PARTIAL DATA (METRICS INCOMPLETE)

**Examples**
- refundedAmount7d = null
- bestSellingProduct missing

**RESPONSE**
- Rules must short-circuit safely
- explain.ts shows “N/A”
- Insight skipped if unsafe

---

### 5️⃣ UI FAILURE

**Examples**
- Drawer fails
- Client JS error

**RESPONSE**
- Core dashboard still renders
- Insights hidden gracefully
- No blocking modals

---

## 🧯 GLOBAL SAFETY RULES

### ❌ NEVER DO THIS
- Show stale insights
- Guess user intent
- Mutate state without confirmation
- Retry destructive actions automatically

---

### ✅ ALWAYS DO THIS
- Fail closed (hide insight)
- Log server-side
- Prefer silence over noise
- Keep UI responsive

---

## 🔁 SAFE DEFAULTS

| Component | Safe default |
|--------|--------------|
| Engine | [] |
| API | { ok: false } |
| UI | Render dashboard without insights |
| DB | No writes |

---

## 🧊 LOCK STATUS

This failure strategy is LOCKED for v1.

Any change requires:
- Explicit approval
- Boundary review
- New failure analysis

---

END OF FILE


================================================================================================================================
================================================================================================================================


# FAILURE_MODES_AND_RECOVERY_V1

Version: v1
Status: LOCKED
Scope: Insight Engine Failure Handling (Human + System)

---

## 🎯 Objective

Define:
- What can break
- How system behaves when it breaks
- How a dev/operator recovers safely

WITHOUT:
- Cron jobs
- Background workers
- Auto-retries
- Infra tooling

This is a **manual-first, safe-failure design**.

---

## 🧠 Core Philosophy

> “Insights are guidance, not money flow.”

Therefore:
- Failure must NEVER block dashboard
- Failure must NEVER corrupt DB
- Failure must NEVER spam users
- Failure must degrade gracefully

---

## 🔥 FAILURE CLASSES

### 1️⃣ Rule Evaluation Failure

**Cause**
- Bug inside a rule
- Unexpected metric shape
- Division by zero, etc.

**Behavior**
- Rule is skipped
- Other rules continue
- Engine does NOT crash

**Where handled**
- `evaluateInsights()` try/catch per rule

**User impact**
- Missing one insight (acceptable)

**Recovery**
- Fix rule
- Deploy
- No data migration needed

---

### 2️⃣ Cooldown / Dedup Logic Failure

**Cause**
- Corrupt state row
- Unexpected null / malformed date

**Behavior**
- Insight treated as visible
- No crash
- No mutation

**User impact**
- Insight may reappear once

**Recovery**
- Inspect `insight_state`
- Fix row or delete it
- System self-heals next render

---

### 3️⃣ Insight State Write Failure (DB)

**Cause**
- Supabase outage
- RLS misconfig
- Network error

**Behavior**
- Insight still renders (read path wins)
- Seen / dismiss may not persist
- Error logged

**User impact**
- Insight may reappear next load

**Recovery**
- Fix DB
- No backfill needed
- User can dismiss again

---

### 4️⃣ Explainability API Failure

**Cause**
- Missing context mapping
- Metrics fetch failure
- Bad insightId

**Behavior**
- Drawer shows error or empty
- Dashboard unaffected

**User impact**
- “Why am I seeing this?” unavailable

**Recovery**
- Add missing explain context
- Fix API
- No DB changes

---

### 5️⃣ Audit Logger Failure

**Cause**
- Insert failure
- Schema mismatch

**Behavior**
- Main action still succeeds
- Event not logged

**User impact**
- NONE (audit is secondary)

**Recovery**
- Fix logger
- Historical gap acceptable

---

## 🧯 SAFE DEFAULTS (CRITICAL)

| Scenario | Default |
|--------|--------|
Rule throws | Skip rule |
Cooldown invalid | Show insight |
State missing | Treat as new |
Explain fails | Hide drawer |
Audit fails | Ignore |
Seen API fails | Ignore |
Dismiss API fails | Insight reappears |

---

## 🚫 Explicitly Forbidden “Fixes”

- ❌ Retrying writes in loops
- ❌ Auto-deleting state rows
- ❌ Silent data mutation
- ❌ Swallowing engine crashes
- ❌ Hiding all insights on error

---

## 🧪 Manual Recovery Checklist

When something looks wrong:

1. Check browser console
2. Check server logs
3. Check `insight_state` row
4. Check `audit_log` (optional)
5. Check explain drawer payload
6. Fix logic → redeploy

No migrations. No scripts. No cron.

---

## 🧱 Stability Guarantee

Even if:
- DB is flaky
- Rules are buggy
- Explainability breaks

👉 Dashboard STILL loads  
👉 Revenue numbers STILL correct  
👉 No user lock-in  

---

## ✅ Final Status

Failure modes IDENTIFIED  
Recovery paths DOCUMENTED  
No new code added  
No risk introduced  

**STEP 5.9 — COMPLETE & LOCKED**