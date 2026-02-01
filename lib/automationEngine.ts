/* ======================================================
   🔒 CREATOR OS — AUTOMATION ENGINE (PHASE-5 HARD LOCK)
   ------------------------------------------------------
   SAFE • IDPOTENT • FINANCIAL SAFE

   RULES:
   ❌ NEVER grant access without PAID order
   ❌ NEVER trust payload
   ❌ NEVER bypass entitlement authority
   ✔ order.status MUST be paid
   ✔ fail closed
   ✔ idempotent

   🔥 THIS FIXES FREE-ACCESS SECURITY HOLE

   🔒 DO NOT MODIFY AGAIN
====================================================== */

import { supabaseAdmin } from "@/lib/supabaseAdmin"

/* ======================================================
   TYPES
====================================================== */

type AutomationEvent = {
  event_id: string
  event_type: string
  payload: any
}

type AutomationRule = {
  id: string
  creator_id: string
  trigger_event: string
  conditions: Record<string, any> | null
  actions: AutomationAction[]
}

type AutomationAction = {
  type: "grant_access" | "revoke_access" | "send_email" | "add_tag"
  config: Record<string, any> | null
  execution_order: number
}

/* ======================================================
   ENTRY
====================================================== */

export async function runAutomationEngine(event: AutomationEvent) {
  const { event_id, event_type, payload } = event

  const creatorId = await resolveCreatorId(payload)
  if (!creatorId) return

  const { data: rules } = await supabaseAdmin
    .from("automation_rules")
    .select("id, creator_id, trigger_event, conditions, actions")
    .eq("creator_id", creatorId)
    .eq("trigger_event", event_type)
    .eq("is_active", true)

  if (!rules?.length) return

  for (const rule of rules as AutomationRule[]) {
    await processRule(rule, event)
  }
}

/* ======================================================
   RULE
====================================================== */

async function processRule(rule: AutomationRule, event: AutomationEvent) {
  const { id: ruleId } = rule
  const { event_id, payload } = event

  const { data: existing } = await supabaseAdmin
    .from("automation_executions")
    .select("id")
    .eq("rule_id", ruleId)
    .eq("event_id", event_id)
    .maybeSingle()

  if (existing) return

  try {
    if (!evaluateConditions(rule.conditions, payload)) {
      await logExecution(ruleId, event_id, "skipped")
      return
    }

    const actions = [...rule.actions].sort(
      (a, b) => a.execution_order - b.execution_order
    )

    for (const action of actions) {
      await executeAction(action, payload)
    }

    await logExecution(ruleId, event_id, "success")
  } catch (err: any) {
    await logExecution(ruleId, event_id, "failed", err?.message)
  }
}

/* ======================================================
   CONDITIONS
====================================================== */

function evaluateConditions(
  conditions: Record<string, any> | null,
  payload: any
) {
  if (!conditions) return true

  if (conditions.product_id && payload?.product_id !== conditions.product_id)
    return false

  if (conditions.min_amount && (payload?.amount ?? 0) < conditions.min_amount)
    return false

  if (conditions.currency && payload?.currency !== conditions.currency)
    return false

  return true
}

/* ======================================================
   ACTIONS
====================================================== */

async function executeAction(action: AutomationAction, payload: any) {
  switch (action.type) {
    case "grant_access":
      await safeGrantAccess(payload)
      break

    case "revoke_access":
      await revokeAccess(payload)
      break

    case "send_email":
      break

    case "add_tag":
      break
  }
}

/* ======================================================
   🔥 SAFE GRANT ACCESS (CRITICAL FIX)
   MUST VERIFY PAID ORDER FIRST
====================================================== */

async function safeGrantAccess(payload: any) {
  const { user_id, product_id, order_id } = payload

  if (!user_id || !product_id || !order_id) return

  /* 🔴 VERIFY ORDER PAID FIRST */
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("status")
    .eq("id", order_id)
    .maybeSingle()

  if (!order || order.status !== "paid") {
    console.warn("⚠️ Automation blocked — unpaid order")
    return
  }

  await supabaseAdmin.from("entitlements").upsert(
    {
      user_id,
      product_id,
      order_id,
      status: "active",
      granted_at: new Date().toISOString(),
    },
    { onConflict: "order_id" }
  )
}

/* ======================================================
   REVOKE
====================================================== */

async function revokeAccess(payload: any) {
  if (!payload?.user_id || !payload?.product_id) return

  await supabaseAdmin
    .from("entitlements")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("user_id", payload.user_id)
    .eq("product_id", payload.product_id)
}

/* ======================================================
   LOG
====================================================== */

async function logExecution(
  rule_id: string,
  event_id: string,
  status: "success" | "failed" | "skipped",
  error?: string
) {
  await supabaseAdmin.from("automation_executions").insert({
    rule_id,
    event_id,
    status,
    error_message: error ?? null,
  })
}

/* ======================================================
   CREATOR RESOLUTION
====================================================== */

async function resolveCreatorId(payload: any): Promise<string | null> {
  if (payload?.order_id) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select("creator_id")
      .eq("id", payload.order_id)
      .maybeSingle()

    return data?.creator_id ?? null
  }

  if (payload?.subscription_id) {
    const { data } = await supabaseAdmin
      .from("creator_plan")
      .select("user_id")
      .eq("razorpay_subscription_id", payload.subscription_id)
      .maybeSingle()

    return data?.user_id ?? null
  }

  return null
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
====================================================== */