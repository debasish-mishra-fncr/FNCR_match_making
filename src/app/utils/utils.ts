import { JWT } from "next-auth/jwt";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const refreshAccessToken = async (token: string): Promise<JWT> => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL}/api/auth/token/refresh/`,
      {
        refresh: token,
      }
    );
    console.log("refresh token logicres", res);
    const accessToken = res.data.access;
    const refreshToken = res.data.refresh;

    const decoded = jwtDecode<{ exp: number }>(accessToken);

    return {
      accessToken,
      refreshToken,
      accessTokenExpires: decoded.exp * 1000,
    };
  } catch (err) {
    console.error("Refresh token error:", err);
    return {
      error: "RefreshAccessTokenError",
    } as JWT;
  }
};
