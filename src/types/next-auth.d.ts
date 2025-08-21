import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: DefaultSession["user"] & {
      raw?: any;
    };
  }

  interface User extends DefaultUser {
    accessToken: string;
    refreshToken: string;
    raw?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
    raw?: any;
  }
}
