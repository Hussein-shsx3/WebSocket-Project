import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

/**
 * Validates if a JWT token is still valid (not expired)
 */
async function isTokenValid(token: string): Promise<boolean> {
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the access token from cookies
 */
async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value || null;
}

/**
 * Checks if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const accessToken = await getAccessToken();
  return !!accessToken && (await isTokenValid(accessToken));
}

/**
 * Protects a page by redirecting based on authentication status
 * If authenticated: allows access
 * If not authenticated: redirects to sign in
 */
export async function protectPage(): Promise<void> {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    redirect("/signIn");
  }
}

/**
 * Protects auth pages by redirecting authenticated users
 * If authenticated: redirects to chats
 * If not authenticated: allows access
 */
export async function protectAuthPage(): Promise<void> {
  const authenticated = await isAuthenticated();
  
  if (authenticated) {
    redirect("/chats");
  }
}

/**
 * Smart redirect for root page
 * If authenticated: redirects to chats
 * If not authenticated: redirects to signIn
 */
export async function redirectBasedOnAuth(): Promise<never> {
  const authenticated = await isAuthenticated();
  
  if (authenticated) {
    redirect("/chats");
  } else {
    redirect("/signIn");
  }
}
