import { createClient } from "@supabase/supabase-js";

// ZERO-KEY CLIENT ARCHITECTURE:
// All requests are securely proxied through the serverless endpoint at /api/supabase.
// Real Supabase Project URLs and API Keys are never exposed to the client or browser bundle.

const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "";
};

export const supabaseUrl = `${getBaseUrl()}/api/supabase`;
const proxyClientKey = "proxy-client-key";

export const supabase = createClient(supabaseUrl, proxyClientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
