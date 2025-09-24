import type { JWT as NextAuthJWT } from "next-auth/jwt";

export interface BackendUser {
  id: number;
  email: string;
  phone: string | null;
  username: string | null;
  name: string;
  user_type: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_onboarding_complete: boolean;
  onboarding_status: string;
  is_additional_info_required: boolean;
  smb: number | null;
  lender: number | null;
  referrer: number | null;
  session_id: string;
  [key: string]: any;
}

export interface JWT extends NextAuthJWT {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  raw?: BackendUser;
  error?: string;
}
