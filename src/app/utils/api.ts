import axios from "axios";
import { api, setAxiosInterceptors } from "./apiHelper";
import { signOut } from "next-auth/react";

const handleApiError = (error: any, signal: AbortSignal) => {
  if (error.response) {
    const { status, data } = error.response;
    console.error(
      `Response error: Status ${status}, API called: ${
        error.config.url
      }, data: ${JSON.stringify(
        data
      )}, Response error: Status ${status},  API called: ${error.config.url}`
    );

    if (status === 401) {
      console.log("User is unauthorized, signing out...");
      signOut({ redirect: false });
    }

    return {
      data:
        data?.detail ||
        data?.error ||
        "We encountered an issue on our end. Please try again!",
      status: "error",
      code: status,
    };
  } else if (error.request) {
    console.error("No response received:", error.request);
    return {
      data: "No response received from the server",
      status: "error",
      code: 503,
    };
  } else {
    console.error("Error in setting up the request:", error.message);
    return {
      data: "Error in setting up the request",
      status: "error",
      code: 500,
    };
  }
};

export const requestOtpAPI = async (
  payload: { email: string; otp_type: "EMAIL" | "PHONE" },
  signal: AbortSignal
) => {
  try {
    const url = "/api/proxy/api/users/request-otp/";
    const response = await axios.post(url, payload, { signal });
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response, signal);
  } catch (error) {
    return handleApiError(error, signal);
  }
};

export async function verifyOtpAPI(
  payload: {
    phone?: string;
    email?: string;
    otp_code: string;
  },
  signal?: AbortSignal
) {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.NEXTAUTH_URL || "http://localhost:3000"
      : "";
  try {
    let url = "";
    if (typeof window === "undefined") {
      url = `${baseUrl}api/users/verify-otp/`;
    } else {
      url = `/api/proxy/api/users/verify-otp/`;
    }

    const response = await axios.post(url, payload, { signal });

    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    }
    return { data: response.data, status: "error" };
  } catch (error) {
    return handleApiError(error, signal);
  }
}

export const getSmbInfo = async (
  payload: { website: string },
  signal: AbortSignal
) => {
  setAxiosInterceptors();

  try {
    const url = "/api/proxy/core/smbs/initiate-onboarding/";
    const response = await axios.post(url, payload, { signal });
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response, signal);
  } catch (error) {
    return handleApiError(error, signal);
  }
};
export const getRefreshAccessToken = async (
  refresh: string,
  signal?: AbortSignal
) => {
  try {
    const url = "/api/proxy/api/users/refresh_token/";
    const response = await api.post(url, { refresh }, { signal });
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response, signal);
  } catch (error) {
    return handleApiError(error, signal);
  }
};
