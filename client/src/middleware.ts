// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const isAuthenticated = !!(accessToken || refreshToken);

  const authRoutes = [
    "/signIn",
    "/signUp",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ];

  const protectedRoutes = [
    "/",
    "/chats",
    "/calls",
    "/profile",
    "/settings",
    "/friendsRequests",
  ];

  const isAuthRoute = authRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + "/")
  );

  /**
   * 1️⃣ Protect private routes
   */
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/signIn", req.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  /**
   * 2️⃣ Prevent logged-in users from auth pages
   */
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/chats", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
