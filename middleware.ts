/* ======================================================
   CREATOR OS — GLOBAL MIDDLEWARE
   ------------------------------------------------------
   RESPONSIBILITIES:
   ✔ Rate limiting (anti-spam / anti-bot)
   ✔ Auth wall
   ✔ Admin protection
   ✔ Zero client trust
   ✔ Edge safe

   🔒 HARD LOCK — DO NOT MODIFY
   (security critical file)
====================================================== */

import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { guardAPI } from "@/lib/ratelimit"

/* ======================================================
   GLOBAL MIDDLEWARE
====================================================== */

export async function middleware(req: NextRequest) {
  /* =====================================================
     1️⃣ GLOBAL RATE LIMIT (CHEAP — runs first)
  ===================================================== */

  if (!guardAPI(req)) {
    return new NextResponse("Too Many Requests", {
      status: 429,
    })
  }

  /* =====================================================
     2️⃣ AUTH WALL
  ===================================================== */

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  /* =====================================================
     3️⃣ PROTECTED APP AREAS
  ===================================================== */

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/purchases") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/admin")

  if (isProtected && !user) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

/* ======================================================
   MATCHER — ONLY RUN WHERE NEEDED
====================================================== */

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/purchases/:path*",
    "/billing/:path*",
    "/admin/:path*",
  ],
}

/* ======================================================
   🔒 HARD LOCK COMPLETE
   This file must NOT be edited again.
   Future changes → create new layer only.
====================================================== */