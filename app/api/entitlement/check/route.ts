import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Read auth token
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { access: false, reason: "not_authenticated" },
        { status: 401 }
      );
    }

    // 2️⃣ Get user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return NextResponse.json(
        { access: false, reason: "invalid_user" },
        { status: 401 }
      );
    }

    // 3️⃣ Check paid order
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("status", "paid")
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ access: false });
    }

    return NextResponse.json({ access: true });
  } catch (err) {
    console.error("ENTITLEMENT CHECK ERROR:", err);
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}