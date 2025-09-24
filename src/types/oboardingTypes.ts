export type Industry = {
  title: string;
  code: string;
};

export type State = {
  title: string;
  code: string;
};

export const ANNUALIZED_REVENUE = [
  "<$1M",
  "$1M - $3M",
  "$3M - $5M",
  "$5M - $10M",
  "$10M+",
];
export const TARGET_COMPETITIVE_ADVANTAGE_OPTIONS = [
  "Lowest Interest",
  "Longest Repayment Time",
  "Quickest Access",
];
export const TARGET_TIMELINE = [
  "ASAP",
  "1-2 MONTHS",
  "3-6 MONTHS",
  ">6 MONTHS",
];
export const FUNDING_REASONS = [
  "Acquisition",
  "Growth",
  "Refinancing",
  "Runway / Bridge Financing",
  "Invoice Financing",
  "Working Capital",
  "Other",
];

export const INDUSTRIES: Industry[] = [
  { title: "Select an industry", code: "" },
  { title: "Consumer/Personal Loans", code: "CPL" },
  { title: "Real Estate / Construction", code: "REC" },
  { title: "F&B and Hospitality", code: "FBH" },
  { title: "Healthcare", code: "HC" },
  { title: "Franchising", code: "FR" },
  { title: "Agriculture", code: "AG" },
  { title: "Manufacturing", code: "MF" },
  { title: "Retail", code: "RT" },
  { title: "Wholesale / Distributors", code: "WD" },
  { title: "Finance / Insurance", code: "FI" },
  {
    title:
      "Professional Services (eg. Staffing, Legal, Accounting, Engineering, etc)",
    code: "PS",
  },
  { title: "Tech/SaaS", code: "TS" },
  {
    title: "Transportation, Warehousing, Logistics (includes trucking)",
    code: "TWL",
  },
  { title: "Utilities/Energy (includes oil and gas, renewables)", code: "UE" },
  { title: "Cross-border / Export-import", code: "CBEI" },
  { title: "Government Contractors / B2G", code: "GCB2G" },
  { title: "Sector Agnostic", code: "SA" },
  { title: "Not Specified", code: "NS" },
  { title: "Others", code: "OT" },
];

export const US_STATES: State[] = [
  { title: "Select a state", code: "" },
  { title: "Alabama", code: "AL" },
  { title: "Alaska", code: "AK" },
  { title: "Arizona", code: "AZ" },
  { title: "Arkansas", code: "AR" },
  { title: "California", code: "CA" },
  { title: "Colorado", code: "CO" },
  { title: "Connecticut", code: "CT" },
  { title: "Delaware", code: "DE" },
  { title: "Florida", code: "FL" },
  { title: "Georgia", code: "GA" },
  { title: "Hawaii", code: "HI" },
  { title: "Idaho", code: "ID" },
  { title: "Illinois", code: "IL" },
  { title: "Indiana", code: "IN" },
  { title: "Iowa", code: "IA" },
  { title: "Kansas", code: "KS" },
  { title: "Kentucky", code: "KY" },
  { title: "Louisiana", code: "LA" },
  { title: "Maine", code: "ME" },
  { title: "Maryland", code: "MD" },
  { title: "Massachusetts", code: "MA" },
  { title: "Michigan", code: "MI" },
  { title: "Minnesota", code: "MN" },
  { title: "Mississippi", code: "MS" },
  { title: "Missouri", code: "MO" },
  { title: "Montana", code: "MT" },
  { title: "Nebraska", code: "NE" },
  { title: "Nevada", code: "NV" },
  { title: "New Hampshire", code: "NH" },
  { title: "New Jersey", code: "NJ" },
  { title: "New Mexico", code: "NM" },
  { title: "New York", code: "NY" },
  { title: "North Carolina", code: "NC" },
  { title: "North Dakota", code: "ND" },
  { title: "Ohio", code: "OH" },
  { title: "Oklahoma", code: "OK" },
  { title: "Oregon", code: "OR" },
  { title: "Pennsylvania", code: "PA" },
  { title: "Rhode Island", code: "RI" },
  { title: "South Carolina", code: "SC" },
  { title: "South Dakota", code: "SD" },
  { title: "Tennessee", code: "TN" },
  { title: "Texas", code: "TX" },
  { title: "Utah", code: "UT" },
  { title: "Vermont", code: "VT" },
  { title: "Virginia", code: "VA" },
  { title: "Washington", code: "WA" },
  { title: "West Virginia", code: "WV" },
  { title: "Wisconsin", code: "WI" },
  { title: "Wyoming", code: "WY" },
];

export const PRODUCT_CODES: Record<string, string> = {
  TBL: "Term-Based Loan / Short-term Financing",
  EFL: "Equipment Financing / Equipment Loan",
  ABL: "Asset Based Lending",
  RELL: "Real Estate Related Loans (Mortgage, Construction Loans, Commercial Real Estate)",
  RCF: "Revolving Credit Facilities (Line of Credit, Credit Card, Overdraft, Revolving Loan Fund)",
  MCA: "Merchant Cash Advance (Business Cash Advance, Working Capital Advance, Revenue-Based Financing)",
  RAPF: "Receivables and Payables Financing (Accounts Receivable Financing, Purchase Order Financing, Invoice Financing, Factoring, Inventory Financing, Govt Receivables Financing)",
  SBA: "SBA Loans (Microloans, Disaster loans, PPP, 504 Loan, 7A Loan)",
  CL: "Consolidation Loans (Consolidation Loan, Refinancing Loan)",
  MA: "M&A Loans (Acquisition Loans, Mezzanine Financing)",
  CL401K: "Consumer Loans (Personal Loan, 401k financing)",
  SL: "Specialty Loans (Bridge Loan, Balloon Loan, Medical Practice Loan, Franchise Loan)",
  CD: "Convertible Debt",
  HM: "Hard Money",
};

export const COLLATERAL_CODES: Record<string, string> = {
  RECV: "Receivables",
  INV: "Inventory",
  PO: "Purchase Orders",
  EQ: "Equipment",
  PPE: "PPE",
  RE: "Real Estate",
  VEH: "Vehicle",
  TC: "Tax Credits",
  OA: "Other Assets",
  NSPEC: "Not Specified",
  UL: "Unsecured Loans",
  PGR: "Personal Guarantee Required",
};

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

export interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export interface FileWithMetadata {
  name: string;
  file: File;
  metadata: {
    document_purpose: string;
    description: string;
  };
}
