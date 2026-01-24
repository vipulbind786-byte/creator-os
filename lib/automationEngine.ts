import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* ======================================================
   TYPES (STRICT & SAFE)
====================================================== */

type AutomationEvent = {
  event_id: string;
  event_type: string;
  payload: any;
};

type AutomationRule = {
  id: string;
  creator_id: string;
  trigger_event: string;
  conditions: Record<string, any> | null;
  actions: AutomationAction[];
};

type AutomationAction = {
  type: "grant_access" | "revoke_access" | "send_email" | "add_tag";
  config: Record<string, any> | null;
  execution_order: number;
};

/* ======================================================
   ENTRY POINT
====================================================== */

export async function runAutomationEngine(event: AutomationEvent) {
  const { event_id, event_type, payload } = event;

  console.log("⚙️ Automation engine start:", event_type);

  /* --------------------------------------
     1️⃣ Resolve creator_id (trusted only)
  -------------------------------------- */
  const creatorId = await resolveCreatorId(payload);

  if (!creatorId) {
    console.warn("⚠️ No creator resolved, skipping automations");
    return;
  }

  /* --------------------------------------
     2️⃣ Fetch active rules
  -------------------------------------- */
  const { data: rules, error } = await supabaseAdmin
    .from("automation_rules")
    .select("id, creator_id, trigger_event, conditions, actions")
    .eq("creator_id", creatorId)
    .eq("trigger_event", event_type)
    .eq("is_active", true);

  if (error || !rules?.length) {
    console.log("ℹ️ No automation rules matched");
    return;
  }

  /* --------------------------------------
     3️⃣ Process rules one-by-one
  -------------------------------------- */
  for (const rule of rules as AutomationRule[]) {
    await processRule(rule, event);
  }

  console.log("✅ Automation engine finished");
}

/* ======================================================
   RULE PROCESSOR
====================================================== */

async function processRule(rule: AutomationRule, event: AutomationEvent) {
  const { id: ruleId } = rule;
  const { event_id, payload } = event;

  /* --------------------------------------
     1️⃣ Idempotency check
  -------------------------------------- */
  const { data: existing } = await supabaseAdmin
    .from("automation_executions")
    .select("id")
    .eq("rule_id", ruleId)
    .eq("event_id", event_id)
    .maybeSingle();

  if (existing) {
    console.log("⏭️ Automation already executed:", ruleId);
    return;
  }

  try {
    /* --------------------------------------
       2️⃣ Condition evaluation
    -------------------------------------- */
    const conditionsPassed = evaluateConditions(rule.conditions, payload);

    if (!conditionsPassed) {
      await logExecution(ruleId, event_id, "skipped");
      return;
    }

    /* --------------------------------------
       3️⃣ Execute actions (ordered)
    -------------------------------------- */
    const actions = [...rule.actions].sort(
      (a, b) => a.execution_order - b.execution_order
    );

    for (const action of actions) {
      await executeAction(action, payload);
    }

    /* --------------------------------------
       4️⃣ Log success
    -------------------------------------- */
    await logExecution(ruleId, event_id, "success");
  } catch (err: any) {
    console.error("🔥 Automation failed:", err);

    await logExecution(ruleId, event_id, "failed", err?.message);
  }
}

/* ======================================================
   CONDITION EVALUATION (STRICT)
====================================================== */

function evaluateConditions(
  conditions: Record<string, any> | null,
  payload: any
): boolean {
  if (!conditions) return true;

  // Example supported conditions (v1)
  if (conditions.product_id) {
    if (payload?.product_id !== conditions.product_id) return false;
  }

  if (conditions.min_amount) {
    if ((payload?.amount ?? 0) < conditions.min_amount) return false;
  }

  if (conditions.currency) {
    if (payload?.currency !== conditions.currency) return false;
  }

  return true;
}

/* ======================================================
   ACTION EXECUTION (SAFE MODE)
====================================================== */

async function executeAction(
  action: AutomationAction,
  payload: any
) {
  switch (action.type) {
    case "grant_access":
      await grantAccess(payload);
      break;

    case "revoke_access":
      await revokeAccess(payload);
      break;

    case "send_email":
      console.log("📧 Email action (stub):", action.config);
      break;

    case "add_tag":
      console.log("🏷️ Tag action (stub):", action.config);
      break;

    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

/* ======================================================
   ACTION HELPERS
====================================================== */

async function grantAccess(payload: any) {
  if (!payload?.user_id || !payload?.product_id) return;

  await supabaseAdmin.from("entitlements").upsert(
    {
      user_id: payload.user_id,
      product_id: payload.product_id,
      status: "active",
    },
    { onConflict: "user_id,product_id" }
  );

  console.log("🔓 Access granted:", payload.user_id);
}

async function revokeAccess(payload: any) {
  if (!payload?.user_id || !payload?.product_id) return;

  await supabaseAdmin
    .from("entitlements")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("user_id", payload.user_id)
    .eq("product_id", payload.product_id);

  console.log("⛔ Access revoked:", payload.user_id);
}

/* ======================================================
   EXECUTION LOGGING
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
  });
}

/* ======================================================
   CREATOR RESOLUTION (TRUSTED ONLY)
====================================================== */

async function resolveCreatorId(payload: any): Promise<string | null> {
  // Payment / order based
  if (payload?.order_id) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select("creator_id")
      .eq("id", payload.order_id)
      .maybeSingle();

    return data?.creator_id ?? null;
  }

  // Subscription based
  if (payload?.subscription_id) {
    const { data } = await supabaseAdmin
      .from("creator_plan")
      .select("user_id")
      .eq("razorpay_subscription_id", payload.subscription_id)
      .maybeSingle();

    return data?.user_id ?? null;
  }

  return null;
}