// 🔒 ADMIN PAYMENT METRICS PAGE — SERVER GATE (FINAL)
// SERVER ONLY • AUTH ONLY • ADMIN ONLY

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"

import PaymentMetricsClient from "./PaymentMetricsClient"

export default async function Page() {
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

  /* 🔐 NOT LOGGED IN */
  if (!user) redirect("/login")

  /* 🔥 ADMIN CHECK (CRITICAL) */
  if (user.user_metadata?.is_admin !== true) {
    redirect("/") // or 403 page
  }

  return <PaymentMetricsClient />
}