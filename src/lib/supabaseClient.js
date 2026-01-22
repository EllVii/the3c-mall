import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  console.warn("Set these in .env for authentication to work");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
