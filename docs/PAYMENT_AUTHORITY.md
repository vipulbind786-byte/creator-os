# PAYMENT AUTHORITY — SINGLE SOURCE OF TRUTH
🔒 OP-11 (LOCKED)

## Purpose
This document defines the **final and exclusive authority** for payment verification
inside Creator OS.

This is a **non-negotiable system rule** designed to prevent:
- revenue leakage
- double grants
- manual overrides
- audit failures
- future developer confusion

---

## ❌ NON-EXISTENT ENDPOINTS (INTENTIONAL)

The following endpoint **DOES NOT EXIST** and **MUST NEVER BE ADDED**:

- `/api/payments/verify`

Reason:
- Manual or request-based verification introduces race conditions
- It breaks webhook idempotency
- It creates audit ambiguity
- It enables payment forgery vectors

Any reference to payment verification outside webhooks is **invalid by design**.

---

## ✅ SINGLE AUTHORITY: PAYMENT WEBHOOKS

**Razorpay Webhooks are the ONLY authority** for:

- Payment confirmation
- Order status transitions
- Entitlement grant / revoke
- Subscription lifecycle updates

### Authoritative Flow
User → Razorpay Checkout → Razorpay Webhook → orders table → entitlements table → access checks

There is **no other valid path**.

---

## 🔐 RULES (HARD LOCK)

1. Orders are marked `paid` **ONLY** by webhook events  
2. Entitlements are granted/revoked **ONLY** by webhook events  
3. UI or API requests **must never** mutate payment state  
4. Manual verification is **explicitly forbidden**  
5. Access checks rely on DB state, not API calls  

Violation of any rule = **production risk**.

---

## 🧾 AUDIT & RECOVERY

- Webhook idempotency is enforced via `webhook_events`
- Duplicate events are ignored safely
- Failed or delayed webhooks are handled via:
  - retry
  - manual entitlement grant (documented separately)
- All critical transitions are audit-logged

---

## 🧠 DESIGN PHILOSOPHY

> “If the webhook didn’t say it, it didn’t happen.”

This principle guarantees:
- deterministic money flow
- replay safety
- zero trust on client-side signals
- future payment-provider extensibility

---

## 🔒 LOCK STATUS

This document is **FINAL**.

- No new verification endpoints allowed
- No exceptions
- No conditional logic
- No feature flags

Any change requires **explicit architectural re-approval**.