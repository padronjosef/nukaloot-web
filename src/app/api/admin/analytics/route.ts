import { NextRequest, NextResponse } from "next/server";
import {
  AdminApiError,
  callApi,
  requirePermission,
} from "@/shared/lib/admin-api";
import type {
  AnalyticsSummary,
  SearchLogRow,
} from "@/shared/lib/analytics-types";

export const GET = async (request: NextRequest) => {
  try {
    await requirePermission("VIEW_ANALYTICS");

    const range = request.nextUrl.searchParams.get("range") ?? "7d";
    const bots = request.nextUrl.searchParams.get("bots") === "true";
    const query = `range=${encodeURIComponent(range)}&bots=${bots}`;

    const [summary, recent] = await Promise.all([
      callApi<AnalyticsSummary>(`/analytics/summary?${query}`),
      callApi<SearchLogRow[]>(`/analytics/recent?${query}&limit=200`),
    ]);

    return NextResponse.json({ summary, recent });
  } catch (error) {
    const status = error instanceof AdminApiError ? error.status || 502 : 500;
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load analytics.",
      },
      { status },
    );
  }
};
