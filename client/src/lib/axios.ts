// lib/axios.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: sends cookies with requests
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

/**
 * Get access token from memory (set after login)
 */
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/**
 * Request Interceptor - Attach access token to requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach access token if available
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor - Handle token refresh
 */
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If no response or not a 401, reject immediately
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest?.url || "";

    // Don't retry for auth endpoints
    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-tokens",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify-email",
      "/auth/resend-verification",
    ];

    if (authEndpoints.some((endpoint) => url.includes(endpoint))) {
      // If refresh token endpoint fails, redirect to login (but not if on auth pages)
      if (url.includes("/auth/refresh-tokens")) {
        accessToken = null; // Clear token
        if (typeof window !== "undefined") {
          const authRoutes = ["/signIn", "/signUp", "/forgot-password", "/reset-password", "/verify-email"];
          const currentPath = window.location.pathname;
          const isOnAuthPage = authRoutes.some(route => currentPath === route || currentPath.startsWith(route + "/"));
          
          if (!isOnAuthPage) {
            window.location.href = "/signIn";
          }
        }
      }
      return Promise.reject(error);
    }

    // If already retried, give up and redirect
    if (originalRequest._retry) {
      accessToken = null;
      if (typeof window !== "undefined") {
        const authRoutes = ["/signIn", "/signUp", "/forgot-password", "/reset-password", "/verify-email"];
        const currentPath = window.location.pathname;
        const isOnAuthPage = authRoutes.some(route => currentPath === route || currentPath.startsWith(route + "/"));
        
        if (!isOnAuthPage) {
          window.location.href = "/signIn";
        }
      }
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Update the original request with new token
          if (originalRequest.headers && accessToken) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axiosInstance.post<{
        success: boolean;
        data: { accessToken: string };
      }>("/auth/refresh-tokens");

      // Get new access token from response
      const newAccessToken = response.data.data.accessToken;
      setAccessToken(newAccessToken);

      // Update the original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      // Process queued requests
      processQueue();

      // Retry original request
      return axiosInstance(originalRequest);
    } catch (err) {
      // Refresh failed, clear token and redirect
      processQueue(err as AxiosError);
      accessToken = null;

      if (typeof window !== "undefined") {
        // Don't redirect if already on auth pages
        const authRoutes = ["/signIn", "/signUp", "/forgot-password", "/reset-password", "/verify-email"];
        const currentPath = window.location.pathname;
        const isOnAuthPage = authRoutes.some(route => currentPath === route || currentPath.startsWith(route + "/"));
        
        if (!isOnAuthPage) {
          window.location.href = "/signIn";
        }
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
