"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  AnalyticsRange,
  AnalyticsSummary,
  SearchLogRow,
} from "@/shared/lib/analytics-types";
import { RANGE_LABELS } from "@/shared/lib/analytics-types";
import { StatTile } from "../atoms/StatTile";
import { StatTileSkeleton } from "../atoms/StatTileSkeleton";
import { AnalyticsFilters } from "../molecules/AnalyticsFilters";
import { TimelineChart, type ChartShape } from "../molecules/TimelineChart";
import { TopQueriesTable } from "../molecules/TopQueriesTable";
import { CountriesTable } from "../molecules/CountriesTable";
import { VisitorsTable } from "../molecules/VisitorsTable";
import { RecentSearchesTable } from "../molecules/RecentSearchesTable";
import { percent } from "../../lib/format";

type Payload = { summary: AnalyticsSummary; recent: SearchLogRow[] };

export const AnalyticsDashboard = () => {
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const [includeBots, setIncludeBots] = useState(false);
  const [shape, setShape] = useState<ChartShape>("line");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);

  // Remembered per browser only — a preference, not something worth a round
  // trip. Reading it can throw in a private window, so it never blocks render.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("analytics_chart_shape");
      if (saved === "line" || saved === "bars") setShape(saved);
    } catch {
      // Keeps the default.
    }
  }, []);

  const chooseShape = (next: ChartShape) => {
    setShape(next);
    try {
      localStorage.setItem("analytics_chart_shape", next);
    } catch {
      // The choice still applies for this visit.
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/analytics?range=${range}&bots=${includeBots}`,
        { cache: "no-store" },
      );
      const body = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not load analytics.");
      setData(body);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, [range, includeBots]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = data?.summary;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            What people search for on Nuka Loot, and where from.{" "}
            {RANGE_LABELS[range]}.
          </p>
        </div>
        <AnalyticsFilters
          range={range}
          includeBots={includeBots}
          shape={shape}
          refreshing={loading}
          onRangeChange={setRange}
          onIncludeBotsChange={setIncludeBots}
          onShapeChange={chooseShape}
          onRefresh={() => void load()}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {!summary
          ? Array.from({ length: 6 }, (_, index) => (
              <StatTileSkeleton key={index} />
            ))
          : [
              {
                label: "Searches",
                value: summary.overview.searches.toLocaleString(),
                hint: `${summary.overview.uniqueQueries.toLocaleString()} different games`,
              },
              {
                label: "Visitors",
                value: summary.overview.visitors.toLocaleString(),
                hint: `${summary.overview.ips.toLocaleString()} IPs`,
              },
              {
                label: "Countries",
                value: summary.overview.countries.toLocaleString(),
              },
              {
                label: "Signed in",
                // Defaulted: web and api are separate containers, so during a
                // deploy this can briefly read a payload from the older one,
                // and a missing number should not blank the whole page.
                value: (summary.overview.signedInUsers ?? 0).toLocaleString(),
                hint: `${(summary.overview.signedInSearches ?? 0).toLocaleString()} searches`,
              },
              {
                label: "Served from cache",
                value: percent(summary.overview.cacheHitRate),
                hint: `${summary.overview.cacheHits.toLocaleString()} searches`,
              },
              {
                label: "Bot searches",
                value: summary.overview.botSearches.toLocaleString(),
                hint: includeBots ? "counted above" : "excluded above",
              },
            ].map((tile) => <StatTile key={tile.label} {...tile} />)}
      </div>

      {summary ? (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <TimelineChart
              title="Searches over time"
              points={summary.timeline}
              metric="count"
              range={range}
              shape={shape}
              showBots={includeBots}
            />
            <TimelineChart
              title="Visitors over time"
              points={summary.timeline}
              metric="visitors"
              range={range}
              shape={shape}
              showBots={includeBots}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <TopQueriesTable rows={summary.topQueries} />
            <CountriesTable rows={summary.byCountry} />
          </div>

          <VisitorsTable rows={summary.topVisitors} />
          <RecentSearchesTable rows={data.recent} />
        </>
      ) : null}
    </div>
  );
};
