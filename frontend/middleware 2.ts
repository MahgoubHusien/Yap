import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("📌 Middleware triggered for path:", req.nextUrl.pathname);

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // ✅ Attach Supabase session to response before checking session
  await supabase.auth.getSession(); // Forces cookies to sync
  const { data: { session } } = await supabase.auth.getSession();

  console.log("🔍 Middleware - Session exists:", !!session);

  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    console.log("🚨 No session found, redirecting to /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("✅ Session detected, allowing access to:", req.nextUrl.pathname);
  return res;
}

// ✅ Apply middleware ONLY to protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
