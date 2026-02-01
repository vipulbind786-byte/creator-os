# FAILURE RECOVERY PLAYBOOK
🔒 OP-18 (LOCKED)

## Purpose
This document defines **exact recovery procedures** for payment,
entitlement, and access failures in Creator OS.

It exists so that:
- Support can act without engineering
- No silent access loss occurs
- No revenue leakage occurs
- Every recovery is auditable

---

## 🔐 GLOBAL RULES (NON-NEGOTIABLE)

✅ Webhook = single authority  
❌ Client confirmation is NOT trusted  
❌ Manual DB edits without audit are FORBIDDEN  
✅ Every recovery action must leave an audit trail  

---

## 1️⃣ PENDING PAYMENT STUCK (> X MINUTES)

### Scenario
- Order status = `pending`
- No webhook received
- User claims payment was completed

### Action
1. Check `orders` table by:
   - `razorpay_order_id`
   - `user_id`
2. Check `webhook_events` table for:
   - payment.captured
3. If webhook exists → system will self-heal (wait)
4. If webhook DOES NOT exist:
   - Ask user to retry payment
   - ❌ DO NOT grant access manually

### Allowed
✅ Retry payment  
❌ Manual entitlement grant  

---

## 2️⃣ DUPLICATE PAYMENT (DOUBLE CHARGED)

### Scenario
- Two `payment.captured` events
- Same product + same user

### Action
1. Verify:
   - Two paid `orders`
2. Keep:
   - Oldest order = ACTIVE
3. Newer order:
   - Mark as `refunded`
4. Entitlement:
   - Must remain SINGLE + ACTIVE

### Required
✅ Refund newer payment  
✅ Audit log entry  

---

## 3️⃣ ACCESS LOST AFTER PAYMENT

### Scenario
- User paid
- Cannot access product

### Action
1. Check:
   - `orders.status === paid`
   - `entitlements.status === active`
2. If entitlement missing:
   - Verify webhook exists
3. If webhook exists but entitlement missing:
   - Manual entitlement GRANT allowed

### Manual Grant Rules
- ONLY after webhook verification
- MUST create audit log
- NEVER without payment proof

---

## 4️⃣ REFUND PROCESSED BUT ACCESS STILL ACTIVE

### Scenario
- Refund webhook received
- User still has access

### Action
1. Check `refund.processed` webhook
2. Verify order status = `refunded`
3. Update:
   - `entitlements.status = revoked`
4. Confirm access blocked

### Requirement
✅ Immediate revocation  
✅ Audit log  

---

## 5️⃣ SUBSCRIPTION PAYMENT FAILED

### Scenario
- Subscription invoice failed
- User still on PRO

### Action
1. Webhook handles:
   - `invoice.payment_failed`
2. Update:
   - `creator_plan.status = payment_failed`
3. Access:
   - Grace behavior allowed (UI-level)
   - Core entitlements remain unchanged

---

## 6️⃣ SUBSCRIPTION EXPIRED / CANCELLED

### Scenario
- subscription.completed / cancelled

### Action
1. Webhook updates:
   - `creator_plan.status = expired | cancelled`
2. Access:
   - Downgrade applies automatically
3. No manual override unless BUSINESS plan

---

## 7️⃣ MANUAL ENTITLEMENT GRANT (RARE)

### Allowed ONLY IF:
- Payment webhook verified
- Order exists
- Entitlement missing due to system fault

### Steps
1. Insert entitlement
2. Link correct order_id
3. Status = active
4. Write audit log:
   - actor_type = system | admin
   - reason = recovery

❌ NEVER for unpaid users  
❌ NEVER without webhook  

---

## 📋 REQUIRED AUDIT FIELDS

Every recovery MUST log:
- event_type
- entity_type
- entity_id
- actor_type
- timestamp

---

## 🔒 LOCK STATUS

This playbook is FINAL.

Any new failure mode:
- Requires NEW OP
- Requires NEW doc
- Must NOT modify this file