import { NextRequest } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:3002";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const cc = request.nextUrl.searchParams.get("cc") || "us";

  const upstream = await fetch(
    `${INTERNAL_API_URL}/api/search/stream?q=${encodeURIComponent(q)}&cc=${encodeURIComponent(cc)}`,
    {
      headers: { Accept: "text/event-stream" },
    }
  );

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
