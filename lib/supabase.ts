import { createClient } from "@supabase/supabase-js";

// Server-side only — uses the service role key, never expose this to the browser.
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars are not set");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
