import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { BackendUser } from "@/types/authTypes";
import { refreshAccessToken } from "./utils";

const API_BASE = process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL;

// -----------------------------
// NextAuth Options
// -----------------------------
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "OTP Login",
      credentials: { email: {}, otp_code: {} },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null;
        console.log(credentials);
        const res = await axios.post(
          `${API_BASE}/api/users/verify-otp/`,
          credentials
        );
        console.log(res);
        const data = res.data;

        if (!data.access || !data.refresh || !data.user) {
          throw new Error(data.error || "OTP verification failed");
        }

        return {
          id: data.user.id.toString(),
          accessToken: data.access,
          refreshToken: data.refresh,
          raw: data.user as BackendUser,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("[JWT callback]", { token, user });

      if (user) {
        const decoded = jwtDecode<{ exp: number }>(user.accessToken as string);
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: decoded.exp * 1000,
          raw: user.raw,
        };
      }

      if (Date.now() < (token as JWT).accessTokenExpires) return token as JWT;

      return refreshAccessToken(token.refreshToken as string);
    },

    async session({ session, token }) {
      console.log("[Session callback]", { session, token });
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user = token.raw as BackendUser; // exact backend format
      if (token.error) session.error = token.error;
      return session;
    },
  },
  pages: { signOut: "/" },
  secret: process.env.NEXTAUTH_SECRET,
};
