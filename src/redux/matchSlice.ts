import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMatchedLendersAlgoMatch } from '@/app/utils/api';


export interface Lender {
  name: string;
  website: string;
  linkedin_profile?: string;
  google_maps_profile?: string;
  founded_year?: number;
  competitive_advantage?: string;
  lending_capacity?: string;
  number_of_deals_funded?: number;
  total_amount_funded?: string;
  hq_city?: string;
  hq_state?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  products: string[];
  collaterals: string[];
  states?: string[];
  industries: string[];
  lender_type?: string[];
  website_summary?: string;
  notes?: string;

  // Buybox preferences
  min_lending_amount?: number;
  max_lending_amount?: number;
  min_lending_duration?: number;
  max_lending_duration?: number;
  min_total_revenue?: number;
  max_total_revenue?: number;
  min_annual_ebitda?: number;
  max_annual_ebitda?: number;
  min_years_of_operation?: number;
  excluded_states?: string[];
  excluded_industries?: string[];
  debt_service_coverage_ratio_preference?: number;
  ltv_ratio_preference?: number;

  tag?: string;
}


interface ChatbotState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  sessionID: string | null;
  lenderMatch: Lender[] | null;
}
const initialState: ChatbotState = {
   
  status: 'idle',
  error: null,
  lenderMatch: null,
  sessionID: null,
};

export const fetchLenderMatch = createAsyncThunk(
  'chatbot/fetchLenderMatch',
  async ({ smbId }: { smbId: string }, thunkAPI) => {
    const response = await getMatchedLendersAlgoMatch(smbId);

    // If the request was cancelled, reject with a special payload
    if (response.status === 'cancelled') {
      return thunkAPI.rejectWithValue({ cancelled: true, error: response.data });
    }

    if (response.status !== 'success') {
      return thunkAPI.rejectWithValue({ error: response.data });
    }
    return response.data;
  }
);

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    updateMatchesState: (state, action: PayloadAction<Partial<ChatbotState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLenderMatch.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLenderMatch.fulfilled, (state, action) => {
        state.status = 'succeeded';

        const algoMatches = (action.payload.algorithmic_matches?.matches || []).map(
          (match: any) => ({
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
            min_years_of_operation: match.buybox_preferences?.min_years_of_operation,
            excluded_states: match.buybox_preferences?.excluded_states || [],
            excluded_industries: match.buybox_preferences?.excluded_industries || [],
            debt_service_coverage_ratio_preference:
              match.buybox_preferences?.debt_service_coverage_ratio_preference,
            ltv_ratio_preference: match.buybox_preferences?.ltv_ratio_preference,

            tag: 'Algorithm',
          })
        );

        const llmMatches = (action.payload.llm_matches?.matches || []).map((match: any) => ({
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
          min_lending_duration: match.buybox_preferences?.min_lending_duration,
          max_lending_duration: match.buybox_preferences?.max_lending_duration,
          min_total_revenue: match.buybox_preferences?.min_total_revenue,
          max_total_revenue: match.buybox_preferences?.max_total_revenue,
          min_annual_ebitda: match.buybox_preferences?.min_annual_ebitda,
          max_annual_ebitda: match.buybox_preferences?.max_annual_ebitda,
          min_years_of_operation: match.buybox_preferences?.min_years_of_operation,
          excluded_states: match.buybox_preferences?.excluded_states || [],
          excluded_industries: match.buybox_preferences?.excluded_industries || [],
          debt_service_coverage_ratio_preference:
            match.buybox_preferences?.debt_service_coverage_ratio_preference,
          ltv_ratio_preference: match.buybox_preferences?.ltv_ratio_preference,

          tag: 'LLM',
        }));

        state.lenderMatch = [...algoMatches, ...llmMatches];
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
          state.status = 'idle';
          state.error = null;
          return;
        }

        // General error handling
        state.status = 'failed';
        state.error = errorPayload?.data || 'An unknown error occurred.';
      });
  },
});

export const { updateMatchesState } =
  matchesSlice.actions;

export default matchesSlice.reducer;
