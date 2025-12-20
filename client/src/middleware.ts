import { NextRequest, NextResponse } from "next/server";

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Decode JWT token without verification (for client-side middleware checks only)
 * Server will validate the actual token on API calls
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(
      base64Payload.replace(/-/g, "+").replace(/_/g, "/")
    );
    return JSON.parse(jsonPayload) as JWTPayload;
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

  // Route definitions
  const protectedRoutes = ["/chats", "/calls", "/profile"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isRootPath = pathname === "/";

  // Root path (/) - redirect based on auth status
  if (isRootPath) {
    if (!accessToken) {
      url.pathname = "/signIn";
      return NextResponse.redirect(url);
    } else {
      // Verify token is valid
      const decoded = decodeJWT(accessToken);
      if (!decoded) {
        url.pathname = "/signIn";
        return NextResponse.redirect(url);
      }
      
      const isExpired = decoded.exp && Date.now() >= decoded.exp * 1000;
      if (isExpired) {
        url.pathname = "/signIn";
        return NextResponse.redirect(url);
      }
      
      // Valid token, redirect to chats
      url.pathname = "/chats";
      return NextResponse.redirect(url);
    }
  }

  // If accessing protected route without token
  if (isProtectedRoute && !accessToken) {
    url.pathname = "/signIn";
    return NextResponse.redirect(url);
  }

  // If token exists on protected route, validate it
  if (isProtectedRoute && accessToken) {
    const decoded = decodeJWT(accessToken);

    // Token is invalid (can't decode)
    if (!decoded) {
      url.pathname = "/signIn";
      return NextResponse.redirect(url);
    }

    // Check if token is expired
    const isExpired = decoded.exp && Date.now() >= decoded.exp * 1000;

    if (isExpired) {
      url.pathname = "/signIn";
      return NextResponse.redirect(url);
    }
  }

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
