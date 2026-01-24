# Phase 1 – Critical Security & Duplication Fixes

## Progress Tracker

### Step 1: Create Environment Variable Validation Helper
- [x] Create `lib/env.ts` with validation functions

### Step 2: Update Library Files with Validation
- [x] Update `lib/supabaseClient.ts`
- [x] Update `lib/supabaseAdmin.ts`
- [x] Update `lib/razorpay.ts`

### Step 3: Remove Duplicate Routes
- [x] Delete `app/api/payments/verify_payment/route.ts`
- [x] Delete `app/api/razorpay/order/route.ts`
- [x] Delete empty directories if any

### Step 4: Update Kept Routes (Optional Enhancement)
- [x] Update `app/api/payments/verify/route.ts` with env validation
- [x] Verify `app/api/payments/create-order/route.ts` consistency

### Step 5: Verification
- [x] Confirm all files modified/deleted
- [x] Verify no broken imports
- [x] Document changes

## Files to Modify:
- lib/env.ts (NEW)
- lib/supabaseClient.ts
- lib/supabaseAdmin.ts
- lib/razorpay.ts
- app/api/payments/verify/route.ts

## Files to Delete:
- app/api/payments/verify_payment/route.ts
- app/api/razorpay/order/route.ts
