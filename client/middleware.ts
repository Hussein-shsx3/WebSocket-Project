import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  "/chats",
  "/calls",
  "/profile",
];

/**
 * Public auth routes that should redirect to /chats if user is already authenticated
 */
const authRoutes = [
  "/signIn",
  "/sginUp",
  "/signUp",
  "/forgotPassword",
  "/resetPassword",
  "/verifyEmail",
  "/resendVerification",
];

/**
 * Middleware to protect routes and handle authentication redirects
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get access token from cookies
  const accessToken = request.cookies.get("accessToken")?.value;
  
  // Check if user is authenticated
  const isAuthenticated = !!accessToken && isTokenValid(accessToken);

  // Protected routes that require authentication
  const isProtectedRoute = 
    pathname === "/" || 
    protectedRoutes.some(route => pathname.startsWith(route));

  // Public auth routes
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/signIn", request.url));
  }

  // If trying to access auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/chats", request.url));
  }

  return NextResponse.next();
}

/**
 * Check if JWT token is valid (not expired)
 */
function isTokenValid(token: string): boolean {
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    
    // Check if token has expiration and if it's expired
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    }
    
    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

/**
 * Middleware config - specify which routes should run middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};
