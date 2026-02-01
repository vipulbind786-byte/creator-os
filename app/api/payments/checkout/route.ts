// app/api/payments/checkout/route.ts
// 🔒 PHASE-B FINAL HARD LOCK
// SERVER CONTROLLED CHECKOUT ENTRY
// AUTH REQUIRED • IDENTITY SAFE • NO CLIENT TRUST
// DO NOT MODIFY AFTER LOCK

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    /* =====================================================
       1️⃣ AUTH
    ===================================================== */
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* =====================================================
       2️⃣ VERIFY ORDER OWNERSHIP
    ===================================================== */
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "razorpay_order_id, amount, currency, buyer_email, user_id, product_id"
      )
      .eq("razorpay_order_id", orderId)
      .maybeSingle()

    if (!order || order.user_id !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    /* =====================================================
       3️⃣ SERVER-SAFE CHECKOUT HTML
    ===================================================== */
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Redirecting to Payment…</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
  <script>
    const options = {
      key: "${process.env.RAZORPAY_KEY_ID}",
      order_id: "${order.razorpay_order_id}",
      amount: ${order.amount},
      currency: "${order.currency}",
      name: "Creator OS",
      description: "Product Purchase",
      prefill: {
        email: "${order.buyer_email}"
      },

      handler: function () {
        window.location.href = "/payment/success?order_id=${order.razorpay_order_id}";
      },

      modal: {
        ondismiss: function () {
          window.location.href = "/payment/failed?productId=${order.product_id}";
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  </script>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    })
  } catch (err) {
    console.error("CHECKOUT_FATAL", err)

    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}