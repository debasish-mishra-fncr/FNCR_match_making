// axiosConfig.js
import axios from 'axios';
import { getSession } from 'next-auth/react';

// Create an Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let interceptorId = null;

async function getToken() {
  const session = await getSession();
  return session?.accessToken || '';
}

// Function to set or update the interceptor
const setAxiosInterceptors = async () => {
  // If an interceptor is already set, eject it

  if (interceptorId !== null) {
    api.interceptors.request.eject(interceptorId);
  }
  // Add a new interceptor and store its ID
  interceptorId = api.interceptors.request.use(
    async config => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization; // Remove Authorization header if no token
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

// Export the Axios instance and the interceptor setter
export { api, setAxiosInterceptors };