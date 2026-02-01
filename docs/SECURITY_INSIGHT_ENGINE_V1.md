# SECURITY & ABUSE MODEL — INSIGHT ENGINE (V1)

This document defines security boundaries, abuse vectors,
and data-safety guarantees for the Insight Engine.

---

## 🔐 AUTH & ACCESS CONTROL

### Server-only guarantees
- All insight state mutations require authenticated user
- Supabase RLS enforced on:
  - insight_state
  - insight_audit
- user_id ALWAYS derived from auth session (never client input)

### Client restrictions
- UI can ONLY:
  - mark_seen
  - dismiss
  - request explain
- UI can NEVER:
  - resolve
  - edit rules
  - mutate metrics

---

## 🧱 API HARDENING

### Endpoints
| Endpoint | Risk | Mitigation |
|-------|------|-----------|
| /insights/seen | spam | idempotent updates |
| /insights/dismiss | abuse | auth + per-row update |
| /insights/explain | scraping | auth + manual trigger |

### Required guards
- Auth required on all routes
- JSON schema validation (implicit)
- No batch explain
- No cross-user writes

---

## 🚨 ABUSE SCENARIOS & MITIGATION

### 1️⃣ Explain spam
**Vector**
- Rapid explain calls

**Mitigation**
- Manual UI trigger
- Session-based access
- Future: rate limit (v2)

---

### 2️⃣ Insight farming
**Vector**
- Forcing insights repeatedly

**Mitigation**
- Cooldown ladder
- Dismiss escalation
- Session cap

---

### 3️⃣ State poisoning
**Vector**
- Client forging insight IDs

**Mitigation**
- Insight IDs validated server-side
- No blind inserts without auth
- DB constraints

---

### 4️⃣ Data exfiltration
**Vector**
- Reading other users’ insight states

**Mitigation**
- RLS: user_id = auth.uid()
- No admin bypass in app code

---

## 🧾 AUDIT LOG POLICY

### What we log
- dismissed
- resolved
- auto_resolved
- explain_requested

### What we NEVER log
- raw revenue
- PII
- payment identifiers

Audit log = metadata only.

---

## 🔒 DATA SAFETY GUARANTEES

| Area | Guarantee |
|---|---|
| Revenue | Read-only for insights |
| Insight rules | Code-defined only |
| State | DB = source of truth |
| Explainability | Read-only |
| UI | Dumb renderer |

---

## 🧯 FAILURE & ATTACK RESPONSE

| Failure | Response |
|------|---------|
| API abuse | Disable endpoint |
| Logic bug | Insights disappear |
| DB failure | Revenue UI unaffected |
| Explain crash | Drawer fails gracefully |

---

## 🧠 SECURITY TRUTHS (HONEST)

❌ Not bank-grade security  
❌ No WAF / bot detection (v1)

✅ Strong enough for:
- Indie SaaS
- Creator platforms
- Public launch

---

## 🔒 LOCK STATUS

Security model LOCKED for v1.

Allowed in v2+:
- Rate limiting
- Signed insight IDs
- Admin dashboards
- Anomaly detection

---

END OF FILE

================================================================================================================================
================================================================================================================================

# SECURITY_INSIGHT_ENGINE_V1

Version: v1  
Status: LOCKED  
Scope: Insight Engine (Rules + State + APIs + UI rendering)

---

## 🎯 Objective

Ensure the Insight Engine is:
- Abuse-resistant
- Predictable
- Safe for creators
- Hard to misuse accidentally by developers

WITHOUT adding complexity, background jobs, or heavy security layers.

---

## 🚨 Abuse Scenarios Considered

The following misuse cases were explicitly considered during design:

1. Repeated `/api/insights/seen` calls (refresh spam)
2. Fake or injected `insightId` in:
   - `/dismiss`
   - `/explain`
3. Client attempting to:
   - Mutate insight priority
   - Modify insight logic
4. Excessive insights rendered in one session
5. Developer accidentally:
   - Adding DB logic inside rules
   - Adding UI coupling to engine
   - Mutating insights in client

---

## 🛡️ Existing Protections (Already Implemented)

### Architecture-Level
- Insight Engine is **pure logic**
- Rules have **NO DB / NO UI**
- Single entry point: `runInsightPipeline()`
- Deterministic execution

### Data-Level
- DB is the **only source of truth**
- `insight_state` protected via RLS
- All writes go through API routes only
- User isolation enforced by Supabase auth

### Runtime-Level
- Session cap prevents insight flooding
- Deduplication prevents rule explosion
- Cooldown escalation enforces silence windows
- Seen / dismissed are idempotent operations

### UI-Level
- UI is a dumb renderer
- No insight mutation allowed in client
- Explainability is read-only

---

## 🔐 Explicit Non-Goals (Out of Scope by Design)

The following are **intentionally NOT implemented**:

- ❌ Client-side insight validation
- ❌ Encrypted insight payloads
- ❌ Background cron jobs
- ❌ Webhooks
- ❌ ML-based abuse detection
- ❌ Rate limiting at edge (handled externally if needed)
- ❌ DB-driven rule configuration
- ❌ Rule toggling UI
- ❌ Insight editing UI

---

## 🧠 Security Philosophy

- Trust architecture, not patches
- Prevent misuse by design, not checks
- Fail safe, not clever
- Developer mistakes are more dangerous than users

---

## 🧱 Invariants (Must NEVER Break)

- Engine remains pure
- DB remains source of truth
- UI never mutates insights
- Rules never touch DB
- Explainability never affects logic

---

## ✅ Final Status

- Threat model reviewed
- Abuse scenarios documented
- Boundaries locked
- No runtime changes introduced

**STEP 5.7 — COMPLETE**
