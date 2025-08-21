import axios, { AxiosError } from "axios";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";

const API_BASE = "https://server.fncr.com";

async function handleRequest(
  req: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
): Promise<Response> {
  const controller = new AbortController();
  const signal = controller.signal;

  const { path } = await paramsPromise;
  const search = req.nextUrl.search || "";
  const targetUrl = `${API_BASE}/${path.join("/")}/${search}`;

  // forward all headers except host/connection
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host" && key.toLowerCase() !== "connection") {
      headers[key] = value;
    }
  });
  let data: unknown;
  if (headers["content-type"] === "application/json") {
    data = await req.json();
  } else {
    data = await req.arrayBuffer();
  }
  // Fetch access token from session
  const session = await getServerSession(authOptions);
  let accessToken = session?.accessToken;
  const refreshToken = session?.refreshToken;

  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  try {
    const response = await axios({
      url: targetUrl,
      method,
      headers,
      data,
      signal,
      validateStatus: () => true,
    });

    console.log("Response status:", response.status);

    // If 401/403, try refreshing token once
    if ((response.status === 401 || response.status === 403) && refreshToken) {
      console.log("Refreshing token...");
      try {
        const baseUrl = process.env.NEXTAUTH_URL;
        const refreshResponse = await axios.post(
          `${baseUrl}/api/users/refresh_token/`,
          { refresh: refreshToken }
        );

        if (refreshResponse.status >= 200 && refreshResponse.status < 300) {
          accessToken = refreshResponse.data.access;
          headers["Authorization"] = `Bearer ${accessToken}`;

          // Retry original request
          const retryResponse = await axios({
            url: targetUrl,
            method,
            headers,
            data,
            signal,
            validateStatus: () => true,
          });
          return new Response(JSON.stringify(retryResponse.data), {
            status: retryResponse.status,
          });
        } else {
          return new Response(JSON.stringify({ error: "SessionExpired" }), {
            status: 401,
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: "SessionExpired" }), {
          status: 401,
        });
      }
    }

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.log("Error:", error.response?.data);
    return new Response(
      JSON.stringify(
        (error.response?.data as object) || { message: "Proxy request failed" }
      ),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Export HTTP methods
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, ctx.params, "GET");
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, ctx.params, "POST");
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, ctx.params, "PUT");
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, ctx.params, "DELETE");
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, ctx.params, "PATCH");
}
