import axios from "axios";
import { api, setAxiosInterceptors } from "./apiHelper";
import { signOut } from "next-auth/react";

interface ApiErrorResponse {
  detail?: string;
  error?: string;
  [key: string]: unknown;
}

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const { response, request, message, config } = error;

    if (response) {
      const { status, data } = response;
      console.error(
        `Response error: Status ${status}, API called: ${
          config?.url
        }, data: ${JSON.stringify(data)}`
      );

      return {
        data:
          data?.detail ||
          data?.error ||
          "We encountered an issue on our end. Please try again!",
        status: "error" as const,
        code: status,
      };
    } else if (request) {
      console.error("No response received:", request);
      return {
        data: "No response received from the server",
        status: "error" as const,
        code: 503,
      };
    } else {
      console.error("Error in setting up the request:", message);
      return {
        data: "Error in setting up the request",
        status: "error" as const,
        code: 500,
      };
    }
  }

  // If it's not an AxiosError, treat it as an unknown error
  console.error("Unexpected error:", error);
  return {
    data: "An unexpected error occurred",
    status: "error" as const,
    code: 500,
  };
};

export const requestOtpAPI = async (payload: {
  email: string;
  otp_type: "EMAIL" | "PHONE";
}) => {
  try {
    const url = "/api/users/request-otp/";
    const response = await api.post(url, payload);
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export async function verifyOtpAPI(payload: {
  phone?: string;
  email?: string;
  otp_code: string;
}) {
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

    const response = await api.post(url, payload);

    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    }
    return { data: response.data, status: "error" };
  } catch (error) {
    return handleApiError(error);
  }
}

export const getSmbInfo = async (payload: { website: string }) => {
  setAxiosInterceptors();

  try {
    const url = "/core/smbs/initiate-onboarding/";
    const response = await api.post(url, payload);
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response);
  } catch (error) {
    return handleApiError(error);
  }
};
export const getRefreshAccessToken = async (refresh: string) => {
  try {
    const url = `${process.env.NEXTAUTH_URL}api/auth/token/refresh/`;
    const response = await axios.post(url, { refresh });
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const postBulkDocsAPI = async (payload: FormData) => {
  setAxiosInterceptors();

  try {
    const url = `/core/documents/bulk-upload/`;
    const response = await api.post(url, payload);
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const postSmbInfo = async (id: string | number, payload: unknown) => {
  setAxiosInterceptors();

  try {
    const url = `/core/smbs/${id}/`;
    const response = await api.patch(url, payload);

    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else {
      return handleApiError(response);
    }
  } catch (error) {
    return handleApiError(error);
  }
};

export const processChat = async (payload: FormData) => {
  setAxiosInterceptors();
  try {
    const url = "/core/deal-abstracts/process/";
    const response = await api.post(url, payload);
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getMatchedLendersAlgoMatch = async (payload: unknown) => {
  try {
    const url = `/core/matches/algorithmic-match/${payload}/`;
    const response = await api.get(url);
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCurrentUserAPI = async () => {
  try {
    const url = `/api/users/me/`;
    const response = await api.get(url);
    if (response.status >= 200 && response.status < 300) {
      return { data: response.data, status: "success" };
    } else return handleApiError(response);
  } catch (error) {
    return handleApiError(error);
  }
};
