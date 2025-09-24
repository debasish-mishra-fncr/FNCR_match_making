// api.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";
import { signOut, getSession } from "next-auth/react";
import { refreshAccessToken } from "./utils";

export const api = axios.create({
  baseURL: `/api/proxy`,
  withCredentials: true,
});

// In-memory tokens
let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!)
  );
  failedQueue = [];
};

export function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

// Attach access token before requests
api.interceptors.request.use(async (config) => {
  // If we don’t have a token in memory, fallback to session
  if (!accessToken) {
    const session = await getSession();
    if (session?.accessToken && session?.refreshToken) {
      accessToken = session.accessToken as string;
      refreshToken = session.refreshToken as string;
    }
  }

  if (accessToken) {
    const headers = config.headers as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) return Promise.reject(error);

    const status = error.response.status;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          const headers = originalRequest.headers as AxiosRequestHeaders;
          headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        if (!refreshToken) throw new Error("No refresh token available");

        // Ask backend for new tokens
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken.error) throw new Error(newToken.error);

        accessToken = newToken.accessToken;
        refreshToken = newToken.refreshToken;
        processQueue(null, accessToken);

        const headers = originalRequest.headers as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await signOut({ callbackUrl: "/" });
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
