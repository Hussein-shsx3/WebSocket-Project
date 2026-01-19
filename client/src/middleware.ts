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

  const refreshToken = request.cookies.get("refreshToken")?.value;

  /* -----------------------------
    1. Handle root path `/`
  ------------------------------ */
  if (pathname === "/") {
    if (refreshToken) {
      return NextResponse.redirect(new URL("/chats", request.url));
    } else {
      return NextResponse.redirect(new URL("/signIn", request.url));
    }
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  /* -----------------------------
    2. Protected route without auth
  ------------------------------ */
  if (isProtectedRoute && !refreshToken) {
    const signInUrl = new URL("/signIn", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  /* -----------------------------
    3. Auth routes while logged in
  ------------------------------ */
  if (isAuthRoute && refreshToken) {
    return NextResponse.redirect(new URL("/chats", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
