// app/providers.tsx
'use client'

import { useState, ReactNode } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

export function Providers({ children }: { children: ReactNode }) {
  const [supabaseClient] = useState(() =>
    // no `persistSession` or `options.auth` here
    createBrowserSupabaseClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // if you need to tweak cookie behavior, use cookieOptions:
      // cookieOptions: { name: 'sb:token', lifetime: 60 * 60 * 24 * 7, path: '/' }
    })
  )

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  )
}
