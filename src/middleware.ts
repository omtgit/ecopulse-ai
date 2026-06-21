import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for:
 * 1. Protecting dashboard routes (auth check via JWT cookie)
 * 2. Adding security headers
 * 3. Redirecting unauthenticated users
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers for all responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Check for auth token on protected routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/calculator") ||
    pathname.startsWith("/habits") ||
    pathname.startsWith("/challenges") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings");

  const isApiRoute = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth");

  if (isProtectedRoute || isApiRoute) {
    const token =
      request.cookies.get("next-auth.session-token")?.value ??
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!token && isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!token && isApiRoute) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", statusCode: 401 },
        { status: 401 }
      );
    }
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  if (isAuthRoute) {
    const token =
      request.cookies.get("next-auth.session-token")?.value ??
      request.cookies.get("__Secure-next-auth.session-token")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calculator/:path*",
    "/habits/:path*",
    "/challenges/:path*",
    "/leaderboard/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/api/((?!auth).*)",
  ],
};
