# PERFORMANCE & SCALE MODEL — INSIGHT ENGINE (V1)

This document defines realistic scale limits, bottlenecks,
and degradation strategy for the Insight Engine.

---

## 📊 EXPECTED LOAD (V1 ASSUMPTIONS)

| Metric | Assumption |
|-----|-----------|
| Creators | 1 → 100k |
| Daily active creators | 10% |
| Insights per creator | 3–7 |
| Dashboard loads / day | ~2 per creator |
| Explain calls | Rare (≤1 per session) |

---

## 🧱 SYSTEM HOT PATHS

### 1️⃣ Dashboard Load (Critical Path)

Dashboard → Metrics Query → Insight Pipeline → State Filter → Render
Copy code

**Cost drivers**
- Orders table scans
- Insight_state lookup
- Pipeline computation

**Mitigations**
- Parallel queries (already done)
- Small insight_state table
- No joins inside insight engine
- Max 3 insights/session

---

### 2️⃣ Insight Pipeline (CPU)
- Pure JS
- O(rules) ~ 5–10
- O(insights) small

✅ Scales linearly  
❌ Not a bottleneck

---

### 3️⃣ Explain API
- Triggered manually
- Single insight at a time
- Uses same metrics loader

✅ Safe  
❌ Do NOT batch expose

---

### 4️⃣ Dismiss / Seen APIs
- Write-heavy but low volume
- Indexed by (user_id, insight_id)

✅ Cheap writes  
⚠️ Needs DB index (MANDATORY)

---

## 📌 REQUIRED DB INDEXES (LOCK)

```sql
CREATE INDEX idx_insight_state_user
ON insight_state(user_id);

CREATE INDEX idx_insight_state_user_insight
ON insight_state(user_id, insight_id);

CREATE INDEX idx_insight_audit_user
ON insight_audit(user_id);

================================================================================================================================

🧨 BOTTLENECK SCENARIOS
🚨 Scenario 1: Viral Creator (10k dashboard loads/day)
Impact
Metrics queries spike
Mitigation
Metrics caching (future)
Pre-aggregated stats table (future)
Acceptable in v1

🚨 Scenario 2: Explain spam
Impact
Extra DB reads
Mitigation
Auth required
Manual action
Rate-limit later (v2)

🚨 Scenario 3: Orders table explosion
Impact
Revenue queries slow
Mitigation
Time-bounded queries
Future rollup tables
NOT needed for v1

🧯 DEGRADATION STRATEGY
Failure                              Behavior
Insight engine fails        Show dashboard without insights
Explain fails                    Drawer shows error
State write fails              Insight reappears later
Metrics fail                   No insights rendered

❗ Never block revenue UI.

🧠 SCALING TRUTHS (HONEST)
❌ This is NOT infinite scale
❌ This is NOT FAANG infra

✅ This WILL handle:

100k creators
Millions of insight events
Real-world abuse

🔒 LOCK STATUS
Performance model LOCKED for v1.

Allowed in v2+:

Metric caching
Async pipelines
Background jobs
Rule evaluation offload

[END OF FILE]
