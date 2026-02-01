// app/api/products/[productId]/route.ts
// 🔒 OP-14: OWNER PRODUCT FETCH — FINAL
// OWNER-ONLY • ARCHIVE-SAFE • FUTURE-PROOF

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: Request,
  { params }: { params: { productId: string } }
) {
  try {
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

    /* -----------------------------
       Auth (OWNER)
    ----------------------------- */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    /* -----------------------------
       Fetch product (OWNER VIEW)
       - Archived = invisible even to owner
       - Scheduled allowed (owner preview)
    ----------------------------- */
    const { data: product, error } = await supabase
      .from("products")
      .select(
        "id, name, price, description, status, publish_at"
      )
      .eq("id", params.productId)
      .eq("creator_id", user.id)
      .neq("status", "archived")
      .maybeSingle()

    if (error || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (err) {
    console.error("PRODUCT_GET_ERROR", err)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}