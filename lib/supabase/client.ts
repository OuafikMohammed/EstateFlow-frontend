// File: lib/supabase/client.ts
// Purpose: Browser/Client-side Supabase client for Client Components
// This client uses the anon key and is safe to use in the browser

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
