// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

// Use environment variables instead of hardcoded values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uknogewfmzdlquydukpp.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbm9nZXdmbXpkbHF1eWR1a3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjA2NDcsImV4cCI6MjA1NzY5NjY0N30.69u3Q0tDWGBRdbUclCc_7L13h1GC5A6h3LlZi7Mai_o";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbm9nZXdmbXpkbHF1eWR1a3BwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjEyMDY0NywiZXhwIjoyMDU3Njk2NjQ3fQ.RvHkudg-9BERY4xyRwAhDMTCfslim3LrbL4eykbjrJg";

// Regular Supabase client (for frontend usage)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin Supabase client (for server-side operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
