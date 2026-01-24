/**
 * Environment Variable Validation Helper
 * Ensures all required environment variables are present at runtime
 * Throws descriptive errors if variables are missing
 */

interface EnvConfig {
  // Supabase (Public)
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  
  // Supabase (Server-only)
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // Razorpay
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
}

/**
 * Validates that a required environment variable exists
 * @param key - The environment variable name
 * @param value - The environment variable value
 * @throws Error if the variable is missing or empty
 */
function validateEnvVar(key: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `Please add it to your .env.local file.`
    );
  }
  return value;
}

/**
 * Validates Supabase client environment variables
 * Used for client-side Supabase operations
 */
export function validateSupabaseClientEnv() {
  return {
    url: validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: validateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

/**
 * Validates Supabase admin environment variables
 * Used for server-side admin operations
 */
export function validateSupabaseAdminEnv() {
  return {
    url: validateEnvVar('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceRoleKey: validateEnvVar('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

/**
 * Validates Razorpay environment variables
 * Used for payment processing
 */
export function validateRazorpayEnv() {
  return {
    keyId: validateEnvVar('RAZORPAY_KEY_ID', process.env.RAZORPAY_KEY_ID),
    keySecret: validateEnvVar('RAZORPAY_KEY_SECRET', process.env.RAZORPAY_KEY_SECRET),
  };
}

/**
 * Validates all environment variables at once
 * Useful for startup checks
 */
export function validateAllEnv(): EnvConfig {
  const supabaseClient = validateSupabaseClientEnv();
  const supabaseAdmin = validateSupabaseAdminEnv();
  const razorpay = validateRazorpayEnv();

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseClient.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseClient.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: supabaseAdmin.serviceRoleKey,
    RAZORPAY_KEY_ID: razorpay.keyId,
    RAZORPAY_KEY_SECRET: razorpay.keySecret,
  };
}
