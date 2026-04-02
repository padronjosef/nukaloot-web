const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:3002";

export async function GET() {
  const res = await fetch(`${INTERNAL_API_URL}/api/games/upcoming`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json({ items: [] }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
