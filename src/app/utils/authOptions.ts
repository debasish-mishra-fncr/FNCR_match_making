import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";
import { verifyOtpAPI, getRefreshAccessToken } from "./api";

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const res = await getRefreshAccessToken(token.refreshToken);

    if (res.status !== "success") {
      throw new Error("Refresh AccessToken Error");
    }

    return {
      ...token,
      accessToken: res.data.access,
      refreshToken: res.data.refreshToken,
      accessTokenExpires:
        jwtDecode<{ exp: number }>(res.data.access).exp * 1000,
      raw: res.data,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        otp_code: { label: "OTP Code", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null;

        try {
          const { email, otp_code } = credentials as {
            email: string;
            otp_code: string;
          };

          const res = await verifyOtpAPI({ email, otp_code });

          if (res.status !== "success") {
            throw new Error(res.data);
          }

          return {
            id: email,
            accessToken: res.data.access,
            refreshToken: res.data.refresh,
            raw: res.data,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
            throw new Error(error.message);
          }
          throw new Error("Unknown authorization error");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }): Promise<JWT> {
      // Initial sign in
      if (account && user) {
        const accessToken = user.accessToken as string | undefined;
        const refreshToken = user.refreshToken as string | undefined;

        if (!accessToken) {
          throw new Error("No access token returned from authorize");
        }

        const decodedToken = jwtDecode<{ exp: number }>(accessToken);

        return {
          ...token,
          accessToken,
          refreshToken: refreshToken ?? "",
          accessTokenExpires: decodedToken.exp * 1000,
          raw: user.raw,
        };
      }

      // Return previous token if still valid
      if (Date.now() < (token as JWT).accessTokenExpires) {
        return token as JWT;
      }

      // Refresh expired token
      return refreshAccessToken(token as JWT);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.user = {
        ...session.user,
        raw: token.raw,
      };
      if (token.error) session.error = token.error;
      return session;
    },
  },
  pages: {
    signOut: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
