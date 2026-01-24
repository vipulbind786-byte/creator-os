import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // Only protect /admin routes
  if (!req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 🔐 Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ❌ Not logged in
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔍 Check admin flag
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  // ❌ Not admin
  if (!profile?.is_admin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // ✅ Admin allowed
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};