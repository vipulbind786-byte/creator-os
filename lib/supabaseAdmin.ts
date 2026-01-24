import { createClient } from "@supabase/supabase-js";
import { validateSupabaseAdminEnv } from "./env";

// Validate environment variables before creating admin client
const { url, serviceRoleKey } = validateSupabaseAdminEnv();

export const supabaseAdmin = createClient(
  url,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
