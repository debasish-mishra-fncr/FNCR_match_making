import axios, { AxiosError } from "axios";
import { NextRequest } from "next/server";

const API_BASE = "https://server.fncr.com";

async function handleRequest(
  req: NextRequest,
  paramsPromise: Promise<{ path: string[] }>,
  method: "GET" | "POST" | "PUT" | "DELETE"
): Promise<Response> {
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    // ✅ Await params before using
    const { path } = await paramsPromise;
    const search = req.nextUrl.search || "";

    const targetUrl = `${API_BASE}/${path.join("/")}/${search}`;

    const headers = {
      "Content-Type": "application/json",
    };

    const data =
      method !== "GET" && method !== "DELETE" ? await req.json() : undefined;

    const response = await axios({
      url: targetUrl,
      method,
      headers,
      data,
      signal,
      validateStatus: () => true,
    });

    console.log("Proxy response:", response.data);

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const error = err as AxiosError;

    console.error("Proxy error:", error.response?.data || error.message);

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
