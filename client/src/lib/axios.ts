import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as any & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest?.url || "";
    const authEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-tokens",
      "/auth/forgot-password",
      "/auth/reset-password",
    ];

    // Check if this is an auth endpoint (use includes instead of startsWith)
    if (authEndpoints.some(endpoint => url.includes(endpoint))) {
      if (url.includes("/auth/refresh-tokens")) {
        if (typeof window !== "undefined") {
          window.location.href = "/signIn";
        }
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => axiosInstance(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axiosInstance.post("/auth/refresh-tokens");
      processQueue();
      return axiosInstance(originalRequest);
    } catch (err) {
      processQueue(err as AxiosError);
      if (typeof window !== "undefined") {
        window.location.href = "/signIn";
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;