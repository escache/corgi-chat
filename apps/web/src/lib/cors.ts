import { NextResponse } from "next/server";

function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) {
    return null;
  }

  const allow = process.env.DESKTOP_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
  // Always allow the web app's own origin.
  const webBase = process.env.NEXT_PUBLIC_ORIGIN ?? "";
  if (webBase) {
    allow.push(webBase);
  }

  if (process.env.NODE_ENV === "development") {
    allow.push("http://localhost:5173", "https://localhost:5173");
  }

  if (allow.length === 0 || allow.includes("*") || allow.includes(origin)) {
    return origin;
  }

  return null;
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = getAllowedOrigin(request);
  if (!origin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function json<T>(request: Request, body: T, init?: ResponseInit): NextResponse<T> {
  const headers = { ...(init?.headers ?? {}), ...corsHeaders(request) } as Record<
    string,
    string
  >;
  return NextResponse.json(body, { ...init, headers });
}

export function error(request: Request, body: { error: string }, init?: ResponseInit): NextResponse {
  const headers = { ...(init?.headers ?? {}), ...corsHeaders(request) } as Record<
    string,
    string
  >;
  return NextResponse.json(body, { ...init, headers });
}

export function handleOptions(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
