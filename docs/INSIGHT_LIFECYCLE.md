# INSIGHT LIFECYCLE — V1 (LOCKED)

This document defines the **complete lifecycle of an Insight**
from birth to permanent resolution.

---

## 🧬 LIFECYCLE STATES
┌──────────┐ │  NEW     │ └────┬─────┘ │ first_seen ▼ ┌──────────┐ │ ACTIVE   │◄───────────────┐ └────┬─────┘                │ │ dismiss               │ cooldown_expired ▼                       │ ┌──────────┐                 │ │ DISMISSED│                 │ └────┬─────┘                 │ │ cooldown_until        │ ▼                       │ ┌──────────┐                 │ │ COOLDOWN │─────────────────┘ └──────────┘
ACTIVE ── auto-resolve ──▶ RESOLVED (TERMINAL)
---

## 🧱 STATE DEFINITIONS

### 1️⃣ NEW
- Insight has never appeared before
- No DB row exists yet

**Entry**
- Rule triggers for first time

**Exit**
- Insert into `insight_state`
- Moves to ACTIVE

---

### 2️⃣ ACTIVE
- Insight is eligible for rendering
- Shown on dashboard

**Entry**
- New insight
- Cooldown expired
- Severity escalated

**Exit paths**
- User dismisses → DISMISSED
- Auto-resolve rules pass → RESOLVED

---

### 3️⃣ DISMISSED
- User explicitly hid the insight
- Escalation counter increments

**Entry**
- User clicks “Dismiss”

**Exit**
- Immediately enters COOLDOWN

---

### 4️⃣ COOLDOWN
- Insight suppressed temporarily
- Duration escalates with dismiss count

**Cooldown ladder**
1st dismiss → 1 day 2nd dismiss → 3 days 3rd dismiss → 7 days 4th+        → 30 days
**Exit**
- cooldown_until <= now → ACTIVE

---

### 5️⃣ RESOLVED (TERMINAL)
- Insight permanently closed
- Condition no longer relevant

**Entry**
- Auto-resolve rule satisfied

**Exit**
❌ NONE — terminal state

Insight must NEVER reappear.

---

## 🔒 IMMUTABLE RULES

- RESOLVED is terminal
- UI cannot change state directly
- Rules cannot resolve insights
- DB is the only authority

---

## 🧠 WHY THIS MATTERS

- Prevents alert fatigue
- Preserves user trust
- Enables explainability
- Makes ML upgrade possible later

---

## 🧊 VERSION GUARANTEE

This lifecycle is LOCKED for v1.  
Any change requires:
- Schema migration
- Version bump
- Documentation update

---

END OF FILE