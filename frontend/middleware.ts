// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // no session? redirect to /login
  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  // match any path with at least one segment that isn’t login, signup, _next, favicon.ico, etc.
  matcher: ['/((?!login|signup|_next/static|_next/image|favicon\\.ico).+)'],
}
