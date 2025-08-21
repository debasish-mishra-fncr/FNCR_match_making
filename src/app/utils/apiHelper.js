// axiosConfig.js
import axios from "axios";
import { getSession, signOut } from "next-auth/react";

// Create an Axios instance
const api = axios.create({
  baseURL: "/api/proxy/",
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === "SessionExpired"
    ) {
      await signOut({ callbackUrl: "/" });
    }
    return Promise.reject(error);
  }
);

let interceptorId = null;

async function getToken() {
  const session = await getSession();
  return session?.accessToken || "";
}

// Function to set or update the interceptor
const setAxiosInterceptors = async () => {
  // If an interceptor is already set, eject it

  if (interceptorId !== null) {
    api.interceptors.request.eject(interceptorId);
  }
  // Add a new interceptor and store its ID
  interceptorId = api.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization; // Remove Authorization header if no token
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Export the Axios instance and the interceptor setter
export { api, setAxiosInterceptors };
