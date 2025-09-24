// api.js
import { api } from "./apiHelper";

/* ---------------------------
   Helpers
---------------------------- */
const handleResponse = (response: any) => {
  if (response?.status >= 200 && response?.status < 300) {
    return { data: response.data, status: "success" };
  }
  return handleApiError(response);
};

const handleApiError = (error: any) => {
  // Cancelled request
  if (error?.name === "CanceledError" || error?.name === "AbortError") {
    return { data: "Request cancelled", status: "cancelled", code: 0 };
  }

  // Server responded with error
  if (error?.response) {
    const { status, data } = error.response;
    return {
      data:
        data?.detail ||
        data?.error ||
        data?.non_field_errors?.[0] ||
        "An error occurred on the server.",
      status: "error",
      code: status,
    };
  }

  // No response received
  if (error?.request) {
    console.error("No response received:", error.request);
    return {
      data: "No response received from the server.",
      status: "error",
      code: 503,
    };
  }

  // Request setup/unknown error
  return {
    data: "Unexpected error occurred while setting up the request.",
    status: "error",
    code: 500,
  };
};

/* ---------------------------
   API Calls
---------------------------- */

// Deal APIs
export const processChat = async (payload: FormData) => {
  try {
    const res = await api.post("/core/deal-abstracts/process/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

export const getCurrentDealAbstract = async () => {
  try {
    const res = await api.get("/core/deal-abstracts/current/");
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

// SMB APIs
export const getSmbInfo = async (payload: { website: string }) => {
  try {
    const res = await api.post("/core/smbs/initiate-onboarding/", payload);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

export const postSmbInfo = async (payload: {
  id: string | number;
  rest: any;
}) => {
  const { id, ...rest } = payload;
  if (!id) throw new Error("ID required for postSmbInfo");

  try {
    const res = await api.patch(`/core/smbs/${id}/`, rest);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

// Lender APIs
export const getLenderInfo = async (payload: { website: string }) => {
  try {
    const res = await api.post("/core/lender/initiate-onboarding/", payload);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

export const postLenderInfo = async (payload: { id: number; rest: any }) => {
  const { id, ...rest } = payload;
  if (!id) throw new Error("ID required for postLenderInfo");

  try {
    const res = await api.patch(`/core/lenders/${id}/`, rest);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

// Auth APIs
export const requestOtpAPI = async (payload: {
  email: string;
  otp_type: "EMAIL" | "PHONE";
}) => {
  try {
    const res = await api.post("/api/users/request-otp/", payload);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

export const verifyOtpAPI = async (payload: {
  email: string;
  otp_code: string;
}) => {
  try {
    const res = await api.post("/api/users/verify-otp/", payload);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

export const updateCurrentUserAPI = async (payload: {
  id: number;
  rest: any;
}) => {
  const { id, ...rest } = payload;
  if (!id) throw new Error("ID required for updateCurrentUserAPI");

  try {
    const res = await api.patch(`/api/users/${id}/`, rest);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

export const getCurrentUserAPI = async () => {
  try {
    const res = await api.get("/api/users/me/");
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

// Documents
export const postBulkDocsAPI = async (payload: FormData) => {
  try {
    const res = await api.post("/core/documents/bulk-upload/", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

// Matches
export const getMatchedLendersAlgoMatch = async (payload: {
  smb_id: string;
}) => {
  try {
    const res = await api.get(
      `/core/matches/algorithmic-match/${payload.smb_id}/`
    );
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};

export const getChatSessionAPI = async (payload: { session_id: string }) => {
  try {
    const res = await api.get(`/core/chat-sessions/${payload.session_id}/`);
    return handleResponse(res);
  } catch (e) {
    return handleApiError(e);
  }
};
