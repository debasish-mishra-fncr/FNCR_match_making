import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getChatSessionAPI,
  getCurrentDealAbstract,
  getMatchedLendersAlgoMatch,
  processChat,
} from "@/app/utils/api";
import { Message, DealAbstract, Lender } from "@/types/ChatTypes";

export interface ChatbotState {
  messages: Message[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  dealAbstract: DealAbstract;
  sessionID: string | null;
  lenderMatch: Lender[] | null;
  lenderReason: Record<string, string>;
  fetchChatStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: ChatbotState = {
  messages: [
    // {
    //   text: "Hey! I'm OwlAI 🦉—here to help you find the best funding options for your business.",
    //   fromBot: true,
    //   files: null,
    // },
    // {
    //   text: "To get to know your business better, feel free to share whatever you've got—your website, recent financials, or any other info. You can upload it here, or just shoot it over to ai@fncr.com—whatever works best for you!",
    //   fromBot: true,
    //   files: null,
    // },
  ],
  status: "idle",
  fetchChatStatus: "idle",
  error: null,
  dealAbstract: {
    company_name: "",
    deal_abstract_title: "",
    website: "",
    internal_deal_evaluation: "",
    deal_abstract_for_lenders: "",
    completeness_and_engaging_score: 0,
    financier_valuation: "N/A",
    next_steps: [],
    friendly_chat_message: "",
    last_updated: null,
  },
  lenderMatch: null,
  sessionID: null,
  lenderReason: {},
};

export const fetchBotResponse = createAsyncThunk(
  "chatbot/fetchBotResponse",
  async (
    {
      userMessage,
      selectedFiles,
    }: { userMessage: string; selectedFiles: any[] },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("user_message", JSON.stringify(userMessage));
    const state = thunkAPI.getState() as { chatbot: ChatbotState };
    formData.append("session_id", state.chatbot.sessionID || "");
    selectedFiles.forEach((file) => {
      formData.append("attachments", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);
    });
    const response = await processChat(formData);

    // If the request was cancelled, reject with a special payload
    if (response.status === "cancelled") {
      return thunkAPI.rejectWithValue({
        cancelled: true,
        error: response.data,
      });
    }

    if (response.status !== "success") {
      return thunkAPI.rejectWithValue({ error: response.data });
    }
    return response.data;
  }
);

export const fetchLenderMatch = createAsyncThunk(
  "chatbot/fetchLenderMatch",
  async ({ smbId }: { smbId: number }, thunkAPI) => {
    const response = await getMatchedLendersAlgoMatch({
      smb_id: String(smbId),
    });

    // If the request was cancelled, reject with a special payload
    if (response.status === "cancelled") {
      return thunkAPI.rejectWithValue({
        cancelled: true,
        error: response.data,
      });
    }

    if (response.status !== "success") {
      return thunkAPI.rejectWithValue({ error: response.data });
    }
    return response.data;
  }
);
export const fetchCurrentDealAbstractRedux = createAsyncThunk(
  "chatbot/fetchCurrentDealAbstractRedux",
  async (_, thunkAPI) => {
    const response = await getCurrentDealAbstract();

    // If the request was cancelled, reject with a special payload
    if (response.status === "cancelled") {
      return thunkAPI.rejectWithValue({
        cancelled: true,
        error: response.data,
      });
    }

    // Handle other error cases
    if (response.status !== "success") {
      return thunkAPI.rejectWithValue({ error: response.data });
    }

    // Success
    return response.data;
  }
);

export const fetchChatSessionRedux = createAsyncThunk(
  "chatbot/fetchChatSessionRedux",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { chatbot: ChatbotState };
    const response = await getChatSessionAPI({
      session_id: String(state.chatbot.sessionID),
    });

    // If the request was cancelled, reject with a special payload
    if (response.status === "cancelled") {
      return rejectWithValue({ cancelled: true, error: response.data });
    }

    // Handle other error cases
    if (response.status !== "success") {
      return rejectWithValue({ error: response.data });
    }

    // Success
    return response.data;
  }
);

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    updateChatBotState: (
      state,
      action: PayloadAction<Partial<ChatbotState>>
    ) => {
      return { ...state, ...action.payload };
    },
    // Updated to accept both text and files in the payload
    addUserMessage: (
      state,
      action: PayloadAction<{
        text: string;
        files?: any[] | null;
        fromBot?: boolean;
      }>
    ) => {
      state.messages.push({
        text: action.payload.text,
        fromBot: action.payload.fromBot ?? false,
        files: action.payload.files || null,
        status: "sending",
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBotResponse.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBotResponse.fulfilled, (state, action) => {
        const res = action.payload;

        // Handle processing status - WebSocket will handle the actual response
        if (res.status === "processing") {
          state.sessionID = res.session_id;
          state.status = "succeeded";

          state.messages.push({
            text: "",
            fromBot: true,
            isLoading: true,
            files: null,
            taskId: res.task_id,
          });
          const lastPendingUserIndex = [...state.messages]
            .reverse()
            .findIndex((msg) => msg.status === "sending");

          if (lastPendingUserIndex !== -1) {
            // Fix index since .reverse() changes order
            const realIndex = state.messages.length - 1 - lastPendingUserIndex;
            state.messages[realIndex] = {
              ...state.messages[realIndex],
              status: "sent",
            };
          }
          return;
        }

        state.status = "succeeded";
      })
      .addCase(fetchBotResponse.rejected, (state, action) => {
        type RejectedPayload = {
          cancelled?: boolean;
          error?: string;
          data?: string;
          status?: string;
          code?: number;
        };
        const errorPayload = action.payload as RejectedPayload;

        // Handle cancellation specifically
        if (errorPayload.cancelled) {
          state.status = "idle";
          state.error = null;
          state.messages = state.messages.filter((msg) => !msg.isLoading);
          return;
        }

        // General error handling
        state.status = "failed";
        state.error = errorPayload?.data || "An unknown error occurred.";

        state.messages = [
          ...state.messages.filter((msg) => !msg.isLoading),
          {
            text:
              errorPayload?.data ||
              "I encountered an error while processing your request. Please try again.",
            fromBot: true,
            files: null,
          },
        ];
      })
      .addCase(fetchLenderMatch.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLenderMatch.fulfilled, (state, action) => {
        state.status = "succeeded";

        const algoMatches = (
          action.payload.algorithmic_matches?.matches || []
        ).map((match: any) => ({
          name: match.name,
          website: match.website,
          linkedin_profile: match.linkedin_profile,
          google_maps_profile: match.google_maps_profile,
          founded_year: match.founded_year,
          competitive_advantage: match.competitive_advantage,
          lending_capacity: match.lending_capacity,
          number_of_deals_funded: match.number_of_deals_funded,
          total_amount_funded: match.total_amount_funded,
          hq_city: match.hq_city,
          hq_state: match.hq_state,
          contact_name: match.contact_name,
          contact_email: match.contact_email,
          contact_phone: match.contact_phone,
          products: match.products_offered || [],
          collaterals: match.preferred_collateral || [],
          states: match.preferred_states || [],
          industries: match.preferred_industries || [],
          lender_type: match.lender_type || [],
          website_summary: match.website_summary,
          notes: match.notes,

          // Destructured buybox preferences
          min_lending_amount: match.buybox_preferences?.min_lending_amount,
          max_lending_amount: match.buybox_preferences?.max_lending_amount,
          min_lending_duration: match.buybox_preferences?.min_lending_duration,
          max_lending_duration: match.buybox_preferences?.max_lending_duration,
          min_total_revenue: match.buybox_preferences?.min_total_revenue,
          max_total_revenue: match.buybox_preferences?.max_total_revenue,
          min_annual_ebitda: match.buybox_preferences?.min_annual_ebitda,
          max_annual_ebitda: match.buybox_preferences?.max_annual_ebitda,
          min_years_of_operation:
            match.buybox_preferences?.min_years_of_operation,
          excluded_states: match.buybox_preferences?.excluded_states || [],
          excluded_industries:
            match.buybox_preferences?.excluded_industries || [],
          debt_service_coverage_ratio_preference:
            match.buybox_preferences?.debt_service_coverage_ratio_preference,
          ltv_ratio_preference: match.buybox_preferences?.ltv_ratio_preference,

          tag: "Algorithm",
        }));

        const llmMatches = (action.payload.llm_matches?.matches || []).map(
          (match: any) => ({
            id: match.id,
            name: match.name,
            website: match.website,
            linkedin_profile: match.linkedin_profile,
            google_maps_profile: match.google_maps_profile,
            founded_year: match.founded_year,
            competitive_advantage: match.competitive_advantage,
            lending_capacity: match.lending_capacity,
            number_of_deals_funded: match.number_of_deals_funded,
            total_amount_funded: match.total_amount_funded,
            hq_city: match.hq_city,
            hq_state: match.hq_state,
            contact_name: match.contact_name,
            contact_email: match.contact_email,
            contact_phone: match.contact_phone,
            products: match.products_offered || [],
            collaterals: match.preferred_collateral || [],
            states: match.preferred_states || [],
            industries: match.preferred_industries || [],
            lender_type: match.lender_type || [],
            website_summary: match.website_summary,
            notes: match.notes,

            //  Destructured buybox preferences
            min_lending_amount: match.buybox_preferences?.min_lending_amount,
            max_lending_amount: match.buybox_preferences?.max_lending_amount,
            min_lending_duration:
              match.buybox_preferences?.min_lending_duration,
            max_lending_duration:
              match.buybox_preferences?.max_lending_duration,
            min_total_revenue: match.buybox_preferences?.min_total_revenue,
            max_total_revenue: match.buybox_preferences?.max_total_revenue,
            min_annual_ebitda: match.buybox_preferences?.min_annual_ebitda,
            max_annual_ebitda: match.buybox_preferences?.max_annual_ebitda,
            min_years_of_operation:
              match.buybox_preferences?.min_years_of_operation,
            excluded_states: match.buybox_preferences?.excluded_states || [],
            excluded_industries:
              match.buybox_preferences?.excluded_industries || [],
            debt_service_coverage_ratio_preference:
              match.buybox_preferences?.debt_service_coverage_ratio_preference,
            ltv_ratio_preference:
              match.buybox_preferences?.ltv_ratio_preference,

            tag: "LLM",
          })
        );

        state.lenderMatch = [...algoMatches, ...llmMatches];
        state.lenderReason = action.payload.llm_reason;
      })
      .addCase(fetchLenderMatch.rejected, (state, action) => {
        type RejectedPayload = {
          cancelled?: boolean;
          error?: string;
          data?: string;
          status?: string;
          code?: number;
        };
        const errorPayload = action.payload as RejectedPayload;

        // Handle cancellation specifically
        if (errorPayload.cancelled) {
          state.status = "idle";
          state.error = null;
          state.messages = state.messages.filter((msg) => !msg.isLoading);
          return;
        }

        // General error handling
        state.status = "failed";
        state.error = errorPayload?.data || "An unknown error occurred.";
      })
      .addCase(fetchCurrentDealAbstractRedux.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentDealAbstractRedux.fulfilled, (state, action) => {
        const abstractContent = action.payload.deal_abstract?.content;
        const session = action.payload.session;
        const {
          company_name,
          deal_abstract_title,
          website,
          internal_deal_evaluation,
          deal_abstract_for_lenders,
          completeness_and_engaging_score,
          financier_valuation,
          next_steps,
          friendly_chat_message,
        } = abstractContent || {};

        (state.dealAbstract = {
          company_name,
          deal_abstract_title,
          website,
          internal_deal_evaluation,
          deal_abstract_for_lenders,
          completeness_and_engaging_score:
            Number(completeness_and_engaging_score) || 0,
          financier_valuation,
          next_steps,
          friendly_chat_message,
          last_updated: action.payload.deal_abstract?.updated_at
            ? action.payload.deal_abstract.updated_at
            : null,
        }),
          (state.sessionID = session.session_id);
        state.status = "succeeded";
      })
      .addCase(fetchCurrentDealAbstractRedux.rejected, (state, action) => {
        type RejectedPayload = {
          cancelled?: boolean;
          error?: string;
          data?: string;
          status?: string;
          code?: number;
        };
        const errorPayload = action.payload as RejectedPayload;

        // Handle cancellation specifically
        if (errorPayload.cancelled) {
          state.status = "idle";
          state.error = null;
          state.messages = state.messages.filter((msg) => !msg.isLoading);
          return;
        }

        // General error handling
        state.status = "failed";
        state.error = errorPayload?.data || "An unknown error occurred.";
      })
      .addCase(fetchChatSessionRedux.pending, (state) => {
        state.fetchChatStatus = "loading";
        state.error = null;
      })
      .addCase(fetchChatSessionRedux.fulfilled, (state, action) => {
        const session = action.payload;
        const rawMessages = session?.messages || [];

        const formattedMessages = rawMessages
          .slice(2)
          .map((msg: any, index: number) => {
            let text = msg.content ?? "";
            let nextSteps = [];
            let completeness_and_engaging_score: null | number = null;
            if (msg.triggered_abstraction && typeof msg.content === "string") {
              try {
                const parsed = JSON.parse(msg.content);

                text = parsed.friendly_chat_message ?? "";
                nextSteps = parsed.next_steps ?? [];

                const score = Number(parsed.completeness_and_engaging_score);
                completeness_and_engaging_score = !isNaN(score) ? score : 0;
              } catch (err) {
                console.error("Failed to parse JSON content:", err);
                text = "";
                nextSteps = [];
                completeness_and_engaging_score = 0;
              }
            }

            if (
              typeof text === "string" &&
              text.length >= 2 &&
              ((text.startsWith('"') && text.endsWith('"')) ||
                (text.startsWith("'") && text.endsWith("'")))
            ) {
              text = text.slice(1, -1);
            }

            const files =
              Array.isArray(msg.documents) && msg.documents.length > 0
                ? msg.documents.map((doc: any) => ({
                    id: doc.id,
                    name: doc.name || doc.original_filename || "File",
                    url: doc.file_url,
                    type: doc.content_type,
                  }))
                : null;

            return {
              id: msg.id,
              text,
              fromBot: msg.role === "assistant",
              files,
              nextSteps,
              reply_type: msg.triggered_abstraction
                ? "abstractor_reply"
                : "conversational_reply",
              completeness_and_engaging_score,
              createdAt: msg.updated_at,
            };
          });

        // Set the formatted messages
        state.messages = [...state.messages, ...formattedMessages];

        if (formattedMessages.length > 0) {
          const lastMessage = formattedMessages[formattedMessages.length - 1];

          if (!lastMessage.fromBot) {
            console.log(
              "[Redux] Detected pending response - adding loading message"
            );
            state.messages.push({
              text: "",
              fromBot: true,
              isLoading: true,
              files: null,
            });
          }
        }

        state.fetchChatStatus = "succeeded";
        state.error = null;
      })
      .addCase(fetchChatSessionRedux.rejected, (state, action) => {
        type RejectedPayload = {
          cancelled?: boolean;
          error?: string;
          data?: string;
          status?: string;
          code?: number;
        };
        const errorPayload = action.payload as RejectedPayload;

        // Handle cancellation specifically
        if (errorPayload.cancelled) {
          state.status = "idle";
          state.error = null;
          state.messages = state.messages.filter((msg) => !msg.isLoading);
          return;
        }

        // General error handling
        state.fetchChatStatus = "failed";
        state.error = errorPayload?.data || "An unknown error occurred.";
      });
  },
});

export const { addUserMessage, updateChatBotState } = chatbotSlice.actions;

export default chatbotSlice.reducer;
