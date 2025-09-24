import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: DefaultSession["user"] & {
      raw?: unknown;
    };
  }

  interface User extends DefaultUser {
    accessToken: string;
    refreshToken: string;
    raw?: unknown;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: string;
    raw?: unknown;
  }
}
