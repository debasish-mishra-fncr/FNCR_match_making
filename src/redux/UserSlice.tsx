import { getCurrentUserAPI, updateCurrentUserAPI } from "@/app/utils/api";
import { OnboardingStatus } from "@/app/utils/types/types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface UserData {
  email: string;
  id: string;
  is_additional_info_required: boolean;
  is_onboarding_complete: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  lender: string;
  name: string;
  onboarding_status: OnboardingStatus;
  phone: string;
  referrer: string;
  session_id: string;
  smb: string;
  user_type: string;
  username: string;
}

interface UserState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: true,
  error: null,
};

export const fetchCurrentUserSlice = createAsyncThunk<
  UserData,
  void,
  { rejectValue: string }
>("currentUser/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await getCurrentUserAPI();
    if (res.status !== "success") {
      return rejectWithValue(res.data as string);
    }
    return res.data as UserData;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateCurrentUserRedux = createAsyncThunk(
  "user/updateCurrentUser",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await updateCurrentUserAPI(payload);
      if (response.status === "success") {
        return response.data;
      } else {
        return rejectWithValue(response.data || "User update failed");
      }
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const UserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    updateUserFields: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUserSlice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserSlice.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload);
        state.user = action.payload;
        console.log(state.user);
      })
      .addCase(fetchCurrentUserSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});

export const { updateUserFields } = UserSlice.actions;
export const UserReducer = UserSlice.reducer;
