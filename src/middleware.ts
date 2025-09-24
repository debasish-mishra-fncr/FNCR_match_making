import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const publicRoutes = ["/"];
  // Redirect authenticated users away from root ("/") to /properties
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
  // Redirect unauthenticated users trying to access protected routes
  if (!token && !publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
