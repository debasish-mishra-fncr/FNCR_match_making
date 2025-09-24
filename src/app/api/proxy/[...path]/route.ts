import axios, { AxiosError } from "axios";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";

const API_BASE = process.env.NEXT_PUBLIC_PRODUCTION_BASE_URL;

async function handleRequest(
  req: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
): Promise<Response> {
  const { path } = await paramsPromise;
  const search = req.nextUrl.search || "";
  console.log("path", path, "search", search);
  
  const targetUrl = `${API_BASE}/${path.join("/")}${search}/`;
  console.log("targetUrl", targetUrl);
  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") || "application/json",
  };

  // Parse body
  let data: unknown;
  if (headers["Content-Type"].includes("application/json")) {
    data = await req.json().catch(() => ({}));
  } else {
    data = await req.arrayBuffer();
  }

  // Attach access token from session
  const session = await getServerSession(authOptions);
  let accessToken = session?.accessToken;
  const refreshToken = session?.refreshToken;

  console.log("accessToken", accessToken);
  console.log("refreshToken", refreshToken);

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    let response = await axios({
      url: targetUrl,
      method,
      headers,
      data,
      validateStatus: () => true,
    });

    console.log("response", response);
    // Handle token refresh on 401/403
    if ((response.status === 401 || response.status === 403) && refreshToken) {
      try {
        const refreshResponse = await axios.post(
          `${API_BASE}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        if (refreshResponse.status >= 200 && refreshResponse.status < 300) {
          accessToken = refreshResponse.data.access;
          headers["Authorization"] = `Bearer ${accessToken}`;

          // Retry original request
          response = await axios({
            url: targetUrl,
            method,
            headers,
            data,
            validateStatus: () => true,
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

// Export handlers
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
