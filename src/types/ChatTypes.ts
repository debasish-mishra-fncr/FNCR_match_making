export interface NextStep {
  rank: number;
  description: string;
  incremental_impact: number;
}
export interface DealAbstract {
  company_name: string;
  deal_abstract_title: string;
  website: string;
  internal_deal_evaluation: string;
  deal_abstract_for_lenders: string;
  completeness_and_engaging_score: number;
  financier_valuation: string;
  next_steps: NextStep[] | null;
  friendly_chat_message: string;
  last_updated: string | null;
}
export interface Message {
  id?: string;
  text: string;
  fromBot: boolean;
  files: any[] | null;
  isLoading?: boolean;
  nextSteps?: NextStep[] | null;
  matches?: any[];
  reply_type?: "abstractor_reply" | "conversational_reply";
  completeness_and_engaging_score?: number;
  createdAt?: string;
  taskId?: string;
  status?: string;
}

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
