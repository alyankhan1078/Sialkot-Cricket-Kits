import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yokiizorrqopfhbvrtpa.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Public Supabase client (Client-side / standard queries)
export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin Supabase client (Server-side with full permissions)
export const getAdminSupabase = () => {
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!key) return null;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

/**
 * Server-only client for privileged writes. Checkout and admin mutations must
 * never fall back to the public key: doing so can make a failed database write
 * look successful when RLS or production credentials are misconfigured.
 */
export const requireAdminSupabase = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const isSupabaseConfigured = () => Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceRoleKey));
