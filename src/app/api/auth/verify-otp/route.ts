import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp_code } = body;

    // 1. Call backend verify-otp endpoint
    const response = await axios.post(
      `${API_BASE}/api/users/verify-otp/`,
      { email, otp_code },
      { validateStatus: () => true }
    );

    if (response.status >= 200 && response.status < 300) {
      const { access, refresh, user } = response.data;

      // 2. Return all needed info to NextAuth authorize
      return NextResponse.json({
        success: true,
        user,
        accessToken: access,
        refreshToken: refresh,
      });
    }

    // OTP verification failed
    return NextResponse.json(
      { success: false, error: response.data || "OTP verification failed" },
      { status: response.status }
    );
  } catch (err) {
    console.error("Verify OTP failed:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
