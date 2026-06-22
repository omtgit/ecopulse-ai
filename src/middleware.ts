import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: adds security headers only.
 * Auth protection removed — all routes are publicly accessible.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
