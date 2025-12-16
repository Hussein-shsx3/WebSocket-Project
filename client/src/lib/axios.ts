import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Create axios instance with default config
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Token management utilities
 */
const tokenManager = {
  getAccessToken: () => Cookies.get("accessToken"),
  setAccessToken: (token: string) =>
    Cookies.set("accessToken", token, {
      expires: 7,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }),
  getRefreshToken: () => Cookies.get("refreshToken"),
  setRefreshToken: (token: string) =>
    Cookies.set("refreshToken", token, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }),
  clearTokens: () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  },
};

/**
 * Flag to prevent multiple refresh attempts
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token || "");
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

/**
 * Request interceptor - Add access token to headers
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - Handle token refresh
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is not 401, reject
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If this is a login/register/auth endpoint, don't try to refresh - return error as is
    if (originalRequest?.url?.includes("/auth/login") || 
        originalRequest?.url?.includes("/auth/register") ||
        originalRequest?.url?.includes("/auth/forgot-password") ||
        originalRequest?.url?.includes("/auth/reset-password")) {
      return Promise.reject(error);
    }

    // If this is a refresh token endpoint, logout
    if (originalRequest?.url?.includes("/auth/refresh-tokens")) {
      tokenManager.clearTokens();
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }
      return Promise.reject(error);
    }

    // Prevent multiple refresh attempts
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    isRefreshing = true;
    const refreshToken = tokenManager.getRefreshToken();

    if (!refreshToken) {
      tokenManager.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }
      return Promise.reject(error);
    }

    try {
      // Attempt to refresh token
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh-tokens`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { accessToken: newAccessToken } = response.data;
      tokenManager.setAccessToken(newAccessToken);

      // Update original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processQueue(null, newAccessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed - logout user
      tokenManager.clearTokens();
      processQueue(refreshError as AxiosError);

      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }

      return Promise.reject(refreshError);
    }
  }
);

export { tokenManager };
