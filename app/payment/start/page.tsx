// app/payment/start/page.tsx
// 🔒 PHASE-B HARD LOCK — PAYMENT START
// SERVER ONLY
// ❌ NO CLIENT CHECKOUT
// ❌ NO PRICE TRUST
// ❌ NO ORDER LOGIC IN CLIENT
// ✅ SERVER CREATES ORDER
// ✅ SERVER REDIRECTS TO CHECKOUT

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

type Props = {
  searchParams: {
    productId?: string
  }
}

export default async function PaymentStartPage({
  searchParams,
}: Props) {
  const productId = searchParams.productId

  /* -----------------------------
     HARD GUARD
  ----------------------------- */
  if (!productId) redirect("/")

  /* -----------------------------
     Auth
  ----------------------------- */
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

  if (!user) redirect("/login")

  /* =====================================================
     SERVER → CREATE ORDER
     (single source of truth)
  ===================================================== */
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/create-order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
      cache: "no-store",
    }
  )

  if (!res.ok) redirect(`/payment/failed?productId=${productId}`)

  const { checkoutUrl } = await res.json()

  if (!checkoutUrl) redirect(`/payment/failed?productId=${productId}`)

  /* -----------------------------
     REDIRECT TO CHECKOUT
  ----------------------------- */
  redirect(checkoutUrl)
}