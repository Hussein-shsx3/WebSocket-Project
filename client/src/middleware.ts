// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/chats",
  "/calls",
  "/profile",
  "/settings",
  "/friendsRequests",
];

const authRoutes = [
  "/signIn",
  "/signUp",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication tokens
  // - refreshToken: HTTP-only cookie set by server (may not work cross-origin)
  // - accessToken: Client-side cookie set by frontend (works same-origin)
  const hasRefreshToken = request.cookies.has("refreshToken");
  const hasAccessToken = request.cookies.has("accessToken");
  const isAuthenticated = hasRefreshToken || hasAccessToken;

  /* -----------------------------
    1. Handle root path `/`
  ------------------------------ */
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/chats", request.url));
    } else {
      return NextResponse.redirect(new URL("/signIn", request.url));
    }
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  /* -----------------------------
    2. Protected route without authentication
  ------------------------------ */
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/signIn", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  /* -----------------------------
    3. Auth routes while logged in
  ------------------------------ */
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/chats", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
