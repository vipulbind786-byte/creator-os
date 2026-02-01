// lib/supabaseBrowser.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { validateSupabaseClientEnv } from "./env";

const { url, anonKey } = validateSupabaseClientEnv();

/**
 * Cookie-based Supabase browser client
 * ✅ Works with Next.js App Router
 * ✅ Syncs session to cookies
 * ✅ Middleware + Server Components compatible
 */
export const supabaseBrowser = createBrowserClient(url, anonKey);