import { createClient } from "@supabase/supabase-js";
import { validateSupabaseClientEnv } from "./env";

// Validate environment variables before creating client
const { url, anonKey } = validateSupabaseClientEnv();

export const supabase = createClient(
  url,
  anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
