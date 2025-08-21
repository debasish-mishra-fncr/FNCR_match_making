import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getSmbInfo, postBulkDocsAPI, postSmbInfo } from "@/app/utils/api";

export interface FundingAmount {
  label: string;
  min: number;
  max: number;
}

export const FUNDING_AMOUNTS: FundingAmount[] = [
  { label: "$50K - $250K", min: 50000, max: 250000 },
  { label: "$250K - $1M", min: 250000, max: 1000000 },
  { label: "$1M - $5M", min: 1000000, max: 5000000 },
  { label: "$5M - $10M", min: 5000000, max: 10000000 },
  { label: "$10M - $20M", min: 10000000, max: 20000000 },
  { label: "$20M+", min: 20000000, max: 9007199254740991 },
];

export interface FileWithMetadata {
  name: string;
  file:File;
  metadata: {
    document_purpose: string;
    description: string;
  };
}

interface SMBOnboardingState {
  id: number | null;
  name: string;
  website: string;
  linkedin_profile: string;
  google_maps_profile: string;
  city: string;
  state: string;
  years_of_operation: number | null;
  industry: string[];
  product: string[];
  collateral: string[];
  lending_amount_start: number | null;
  lending_amount_end: number | null;
  target_lending_duration_start: number | null;
  target_lending_duration_end: number | null;
  target_timeline: string;
  target_competitive_advantage: string[];
  notes_business: string;
  notes_use_of_finance: string;
  notes_ownership_structure: string;
  notes_additional: string;
  website_summary: string;
  smbDocs: FileWithMetadata[];
  annualized_revenue: string;
  funding_reasons: string[];
  currentStep: number; // Track current step in the onboarding flow
  // API Status
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SMBOnboardingState = {
  id: null,
  name: "",
  website: "",
  linkedin_profile: "",
  google_maps_profile: "",
  city: "",
  state: "",
  years_of_operation: null,
  industry: [],
  product: [],
  collateral: [],
  lending_amount_start: null,
  lending_amount_end: null,
  target_lending_duration_start: 2,
  target_lending_duration_end: 6,
  target_timeline: "",
  target_competitive_advantage: [],
  notes_business: "",
  notes_use_of_finance: "",
  notes_ownership_structure: "",
  notes_additional: "",
  website_summary: "",
  smbDocs: [],
  annualized_revenue: "",
  funding_reasons: [],
  currentStep: 0, // Start from step 0
  status: "idle",
  error: null,
};

// Async thunk for fetching SMB info
export const fetchSmbInfo = createAsyncThunk(
  "onboarding/fetchSmbInfo",
  async (website: string, { rejectWithValue }) => {
    try {
      const response = await getSmbInfo({ website });
      if (response.status === "success") {
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch SMB info");
    }
  }
);

// Selector to build API payload
const buildSmbOnboardingPayload = (state: SMBOnboardingState) => {
  console.log("Building payload from onboarding state:", state);

  const isNonEmptyString = (v: any) => typeof v === "string" && v.trim() !== "";
  const isNonNull = (v: any) => v !== null && v !== undefined;
  const isNonEmptyArray = (v: any) => Array.isArray(v) && v.length > 0;

  const rootFields: [string, any, (v: any) => boolean][] = [
    ["id", state.id, isNonNull],
    ["name", state.name, isNonEmptyString],
    ["website", state.website, isNonEmptyString],
    ["linkedin_profile", state.linkedin_profile, isNonEmptyString],
    ["google_maps_profile", state.google_maps_profile, isNonEmptyString],
    ["state", state.state, isNonEmptyString],
    ["years_of_operation", state.years_of_operation, isNonNull],
  ];

  const smbPreferenceFields: [string, any, (v: any) => boolean][] = [
    ["industry", state.industry, isNonEmptyArray],
    ["product", state.product, isNonEmptyArray],
    ["collateral", state.collateral, isNonEmptyArray],
    ["lending_amount_start", state.lending_amount_start, isNonNull],
    ["lending_amount_end", state.lending_amount_end, isNonNull],
    [
      "target_lending_duration_start",
      state.target_lending_duration_start,
      isNonNull,
    ],
    [
      "target_lending_duration_end",
      state.target_lending_duration_end,
      isNonNull,
    ],
    ["target_timeline", state.target_timeline, isNonEmptyString],
    [
      "target_competitive_advantage",
      state.target_competitive_advantage,
      isNonEmptyArray,
    ],
    ["notes_business", state.notes_business, isNonEmptyString],
    ["notes_use_of_finance", state.notes_use_of_finance, isNonEmptyString],
    [
      "notes_ownership_structure",
      state.notes_ownership_structure,
      isNonEmptyString,
    ],
    ["notes_additional", state.notes_additional, isNonEmptyString],
    ["annualized_revenue", state.annualized_revenue, isNonEmptyString],
    ["funding_reasons", state.funding_reasons, isNonEmptyArray],
  ];

  const payload: Record<string, any> = {};

  rootFields.forEach(([key, value, predicate]) => {
    if (predicate(value)) payload[key] = value;
  });

  const smbPreferences: Record<string, any> = {};
  smbPreferenceFields.forEach(([key, value, predicate]) => {
    if (predicate(value)) smbPreferences[key] = value;
  });

  if (Object.keys(smbPreferences).length > 0) {
    payload.smb_preferences = smbPreferences;
  }

  return payload;
};

// Async thunk for submitting final onboarding data
export const submitSmbOnboardingData = createAsyncThunk(
  "onboarding/submitOnboardingData",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { onboarding: SMBOnboardingState };
      const payload = buildSmbOnboardingPayload(state.onboarding);
      const response = await postSmbInfo(state.onboarding.id || "", payload);
      if (response.status === "success") {
        resetOnboarding();
        return response.data;
      } else {
        return rejectWithValue(response.data);
      }
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to submit onboarding data"
      );
    }
  }
);

export const completeAdditionalDataUploadSMBRedux = createAsyncThunk(
  "onboarding/uploadBulkDocument",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as { onboarding: SMBOnboardingState };
    const smbDocs = state.onboarding.smbDocs;

    const payload = buildSmbOnboardingPayload(state.onboarding);
    const isPayloadInvalid =
      !payload ||
      Object.keys(payload).length === 0 ||
      (Object.keys(payload).length === 1 && Object.hasOwn(payload, "id"));

    // Early exit if no docs OR payload invalid
    if (isPayloadInvalid || !smbDocs || smbDocs.length === 0) {
      if (!isPayloadInvalid) {
        const smbInfoResponse = await postSmbInfo(
          state?.onboarding?.id || "",
          payload
        );
        resetOnboarding();
        return { smbInfo: smbInfoResponse, bulkDocs: null };
      }

      resetOnboarding();
      return { smbInfo: null, bulkDocs: null };
    }
    const smbInfoPromise = postSmbInfo(state?.onboarding?.id || "", payload);
    const formData = new FormData();
    const fileMetadata: any[] = [];

    smbDocs.forEach((doc) => {
      fileMetadata.push({
        name: doc.name,
        document_purpose: doc.metadata.document_purpose,
        description: doc.metadata.description,
      });

      formData.append("files", doc.file);
    });

    formData.append("file_metadata", JSON.stringify(fileMetadata));

    // Run both in parallel only if docs exist
    const [smbInfoResponse, bulkDocsResponse] = await Promise.all([
      smbInfoPromise,
      postBulkDocsAPI(formData),
    ]);

    if (bulkDocsResponse.status === "cancelled") {
      return thunkAPI.rejectWithValue({
        cancelled: true,
        error: bulkDocsResponse.data,
      });
    }

    if (bulkDocsResponse.status !== "success") {
      return thunkAPI.rejectWithValue({ error: bulkDocsResponse.data });
    }

    resetOnboarding();
    return { smbInfo: smbInfoResponse, bulkDocs: bulkDocsResponse.data };
  }
);

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    updateOnboarding(
      state,
      action: PayloadAction<Partial<SMBOnboardingState>>
    ) {
      const { smbDocs, ...rest } = action.payload;

      if (smbDocs) {
        state.smbDocs = [...state.smbDocs, ...smbDocs];
      }

      Object.assign(state, rest); // update the rest normally
    },

    updateCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    resetOnboarding() {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSmbInfo.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSmbInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Update state with the fetched data
        if (action.payload) {
          state.id = action.payload?.id;
          state.name = action.payload?.name;
          state.website = action.payload?.website;
          state.state = action.payload?.state;
          state.linkedin_profile = action.payload?.linkedin_profile;
          state.google_maps_profile = action.payload?.google_maps_profile;
          state.years_of_operation = action.payload?.years_of_operation;
          state.website_summary = action.payload?.website_summary;
          state.industry = action.payload?.smb_preferences?.industry;
          state.product = action.payload?.smb_preferences?.product;
        }
      })
      .addCase(fetchSmbInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch SMB info";
      })
      .addCase(submitSmbOnboardingData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitSmbOnboardingData.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(submitSmbOnboardingData.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || "Failed to submit onboarding data";
      });
  },
});

export const { updateOnboarding, updateCurrentStep, resetOnboarding } =
  onboardingSlice.actions;

export default onboardingSlice.reducer;
