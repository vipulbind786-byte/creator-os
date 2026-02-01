# SECURITY & ABUSE MODEL — INSIGHT ENGINE (V1)

This document defines:
- Threat actors
- Abuse vectors
- Defensive boundaries

---

## 👿 THREAT ACTORS

### 1️⃣ NORMAL USER (Curious / careless)
- Click spam
- Reload abuse
- Dismiss everything blindly

### 2️⃣ POWER USER / CREATOR
- Tries to hide bad insights
- Tries to game cooldowns
- Tries to inflate metrics perception

### 3️⃣ MALICIOUS USER
- API spamming
- Forged requests
- Insight ID tampering

### 4️⃣ INTERNAL DEV ERROR
- Logic misuse
- Contract break
- Unsafe refactors

---

## 🧨 ABUSE VECTORS & DEFENSES

### 🔥 Insight Dismiss Abuse
**Attack**
- Rapid dismiss spam

**Defense**
- Cooldown escalation ladder
- DB = truth
- Dismiss count tracked
- No client authority

---

### 🔥 Insight “Seen” Spam
**Attack**
- Fake seen events to suppress insights

**Defense**
- Seen ≠ dismissed
- Seen only updates timestamp
- Cooldown logic unaffected

---

### 🔥 Explain API Abuse
**Attack**
- Query random insight IDs
- Infer system logic

**Defense**
- Auth required
- Insight must exist for user
- Context map is locked
- No dynamic rule exposure

---

### 🔥 Rule Enumeration
**Attack**
- Guess rule IDs
- Discover all system logic

**Defense**
- No rule list API
- No DB-driven rules
- Rule IDs only known internally

---

### 🔥 Replay / Automation
**Attack**
- Scripted dismiss / resolve

**Defense**
- Server-side auth
- No bulk destructive APIs
- Audit log tracks patterns

---

## 🔒 PRIVILEGE BOUNDARIES

| Layer | Trust Level |
|----|------------|
| UI | ❌ Untrusted |
| Client JS | ❌ Untrusted |
| API | ⚠️ Semi-trusted |
| DB | ✅ Source of truth |
| Engine | ✅ Pure logic |

---

## 🧠 DATA EXPOSURE RULES

❌ Never expose:
- Internal rule logic
- Priority weights
- Cooldown ladder values
- Dismiss counters

✅ Allowed:
- “Why am I seeing this?”
- Metric snapshot (safe)
- Human explanation

---

## 🧯 FAIL-SAFE PRINCIPLES

- Abuse → silence, not error
- Suspicious → deny, don’t warn
- Unclear → hide insight
- Unexpected → log + continue

---

## 🧊 LOCK STATUS

Security model is LOCKED for v1.

Any change requires:
- Threat re-evaluation
- Abuse simulation
- Explicit approval

---

END OF FILE