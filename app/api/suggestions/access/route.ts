import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

/* ===============================
   DOMAIN CONTRACTS (LOCKED)
=============================== */
import type { SuggestionAccessResponse } from "@/lib/suggestions/contracts"

/* ===============================
   DOMAIN EVALUATOR (LOCKED)
=============================== */
import {
  evaluateSuggestionAccess,
  type EvaluateSuggestionAccessParams,
} from "@/lib/suggestions/evaluateAccess"

/* ======================================================
   POST /api/suggestions/access
====================================================== */

export async function POST(req: Request) {
  /* -------------------------------
     Supabase Auth (SERVER)
  -------------------------------- */
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { allowed: false, reason: "PLAN_NOT_ALLOWED" },
      { status: 401 }
    )
  }

  /* -------------------------------
     Parse & validate input (SAFE)
  -------------------------------- */
  const body = (await req.json()) as Partial<EvaluateSuggestionAccessParams>

  if (
    !body?.suggestionType ||
    !body?.userPlanType ||
    typeof body?.paidUsersCount !== "number"
  ) {
    return NextResponse.json(
      { allowed: false, reason: "UNKNOWN_SUGGESTION_TYPE" },
      { status: 400 }
    )
  }

  /* -------------------------------
     Evaluate access (PURE DOMAIN)
  -------------------------------- */
  const result: SuggestionAccessResponse =
    evaluateSuggestionAccess({
      suggestionType: body.suggestionType,
      userPlanType: body.userPlanType,
      paidUsersCount: body.paidUsersCount,
      activeAddOns: body.activeAddOns ?? [],
    })

  return NextResponse.json(result)
}