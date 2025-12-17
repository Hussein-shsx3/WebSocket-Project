import { NextRequest, NextResponse } from "next/server";

/**
 * Decode JWT token without verification (for client-side middleware checks only)
 * Server will validate the actual token on API calls
 */
function decodeJWT(token: string): any | null {
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(
      base64Payload.replace(/-/g, "+").replace(/_/g, "/")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Middleware for route protection
 * - Protects /chats, /calls, /profile routes
 * - Redirects to /signIn if no token
 * - Redirects authenticated users away from auth pages
 * - Handles token expiry checks
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const accessToken = req.cookies.get("accessToken")?.value;
  const pathname = url.pathname;

  // Log to console (visible in terminal)
  console.log("\n[MIDDLEWARE] ====================================");
  console.log("[MIDDLEWARE] Request Path:", pathname);
  console.log("[MIDDLEWARE] Has Access Token:", !!accessToken);
  console.log("[MIDDLEWARE] ====================================\n");

  // Route definitions
  const protectedRoutes = ["/chats", "/calls", "/profile"];
  const authRoutes = ["/signIn", "/signUp", "/forgotPassword", "/resetPassword", "/verifyEmail"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isRootPath = pathname === "/";

  // Root path (/) - redirect based on auth status
  if (isRootPath) {
    if (!accessToken) {
      console.log("[MIDDLEWARE] ROOT: No token, redirecting to /signIn");
      url.pathname = "/signIn";
      return NextResponse.redirect(url);
    } else {
      // Verify token is valid
      const decoded = decodeJWT(accessToken);
      if (!decoded) {
        console.log("[MIDDLEWARE] ROOT: Invalid token, redirecting to /signIn");
        url.pathname = "/signIn";
        return NextResponse.redirect(url);
      }
      
      const isExpired = decoded.exp && Date.now() >= decoded.exp * 1000;
      if (isExpired) {
        console.log("[MIDDLEWARE] ROOT: Token expired, redirecting to /signIn");
        url.pathname = "/signIn";
        return NextResponse.redirect(url);
      }
      
      console.log("[MIDDLEWARE] ROOT: Valid token, redirecting to /chats");
      // Valid token, redirect to chats
      url.pathname = "/chats";
      return NextResponse.redirect(url);
    }
  }

  // If accessing protected route without token
  if (isProtectedRoute && !accessToken) {
    console.log("[MIDDLEWARE] PROTECTED: No token, redirecting to /signIn");
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }

  // If token exists, validate it
  if (accessToken) {
    const decoded = decodeJWT(accessToken);

    // Token is invalid (can't decode)
    if (!decoded) {
      console.log("[MIDDLEWARE] Invalid token format, redirecting to /signIn");
      url.pathname = "/signIn";
      return NextResponse.redirect(url);
    }

    // Check if token is expired
    const isExpired = decoded.exp && Date.now() >= decoded.exp * 1000;

    if (isExpired) {
      console.log("[MIDDLEWARE] Token expired, redirecting to /signIn");
      // Token expired, redirect to login
      url.pathname = "/signIn";
      return NextResponse.redirect(url);
    }

    // If authenticated user tries to access auth routes, redirect to chats
    if (isAuthRoute) {
      console.log("[MIDDLEWARE] AUTH ROUTE: Valid token, redirecting to /chats");
      url.pathname = "/chats";
      return NextResponse.redirect(url);
    }
  }

  console.log("[MIDDLEWARE] Allowing request to proceed");
  return NextResponse.next();
}

/**
 * Middleware matcher - which routes to apply middleware to
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next|favicon.ico|images|api).*)",
  ],
};
