# PAYMENT STRATEGY — SINGLE SOURCE OF TRUTH
🔒 OP-17 (LOCKED)

## Purpose
This document defines the **final, non-negotiable payment architecture**
for Creator OS.

It exists to:
- Prevent provider mixing
- Avoid entitlement corruption
- Simplify audits
- Eliminate future refactor risk

---

## 🔐 PAYMENT PROVIDERS (DECLARED)

### 🇮🇳 INDIA — RAZORPAY (PRIMARY)
- Used for all Indian users
- Handles:
  - One-time payments
  - Subscriptions
- Authority:
  - Webhooks are the **ONLY** source of truth
  - Client-side verification is NOT trusted

**Webhook**
- Endpoint: `/api/payments/webhook`
- Covers:
  - payment.captured
  - payment.failed
  - refund.processed
  - subscription.* events
  - invoice.payment_succeeded

**Entitlements**
- Stored in: `entitlements`
- Linked to:
  - `orders`
  - `creator_plan`

---

### 🌍 INTERNATIONAL — PADDLE (PLANNED)

- Used for all non-India users
- Razorpay will NEVER be used internationally

**Rules**
- Separate webhook endpoint (future)
- Separate entitlement pipeline
- Separate audit trail
- NO shared logic with Razorpay

---

## 🚫 HARD RULES (DO NOT BREAK)

❌ Do NOT mix providers in one flow  
❌ Do NOT reuse webhook logic across providers  
❌ Do NOT infer payment success from client  
❌ Do NOT manually grant access outside webhook + SOP  

---

## 🔎 SOURCE OF TRUTH

| Layer | Authority |
|-----|----------|
| Payment success | Webhook only |
| Subscription state | `creator_plan` |
| Product access | `entitlements + orders` |
| Auditing | `audit_logs` |

---

## 🧠 WHY THIS EXISTS

- Payment providers change
- Business models evolve
- Auditors ask questions
- Developers rotate

This document prevents:
- Silent access loss
- Double entitlements
- Compliance nightmares
- “Temporary hacks” becoming permanent bugs

---

## 🔒 LOCK STATUS

This document is **FINAL**.

Any future provider addition:
- Requires a NEW OP
- Requires a NEW doc
- Must NOT alter this declaration