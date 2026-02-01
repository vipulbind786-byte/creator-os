// /app/(dashboard)/orders/page.tsx

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"

/* ===============================
   i18n (SERVER)
=============================== */
import { detectLocale } from "@/lib/i18n/detectLocale"
import { loadDictionary } from "@/lib/i18n"
import { createTranslator } from "@/lib/i18n/runtime"
import { formatCurrency } from "@/lib/i18n/format"
import { formatDate } from "@/lib/formatters/date"

/* ===============================
   UI HELPERS
=============================== */
function OrdersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-md bg-muted/40"
        />
      ))}
    </div>
  )
}

export default async function OrdersPage() {
  /* -------------------------------
     Locale
  -------------------------------- */
  const locale = await detectLocale()
  const dictionary = loadDictionary(locale)
  const t = createTranslator(dictionary)

  /* -------------------------------
     Supabase
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

  /* -------------------------------
     Auth
  -------------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  /* -------------------------------
     Data
  -------------------------------- */
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, buyer_email, amount, created_at, products(name)")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false })

  /* -------------------------------
     UI
  -------------------------------- */
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold lg:text-3xl">
          {t("orders.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("orders.subtitle")}
        </p>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-frosted-snow">
        <div className="overflow-x-auto">
          {!orders && !error ? (
            <div className="p-6">
              <OrdersSkeleton />
            </div>
          ) : orders && orders.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    {t("billing.buyer")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    {t("billing.product")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    {t("billing.amount")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">
                    {t("billing.date")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/10 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium">
                      {order.buyer_email}
                    </td>

                    <td className="px-6 py-4 max-w-[220px]">
                      <span
                        className="block truncate"
                        title={order.products?.[0]?.name ?? ""}
                      >
                        {order.products?.[0]?.name ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-evergreen">
                        {formatCurrency(
                          (Number(order.amount) || 0) / 100,
                          locale
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                      {formatDate(order.created_at, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-muted-foreground">
                {t("orders.empty")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}