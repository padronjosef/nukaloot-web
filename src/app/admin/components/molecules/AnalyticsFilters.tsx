"use client";

import { ChartColumn, ChartLine, RefreshCw } from "lucide-react";
import type { AnalyticsRange } from "@/shared/lib/analytics-types";
import { Button } from "@/shared/UI/Button";
import { cn } from "@/shared/lib/utils";
import type { ChartShape } from "./TimelineChart";

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "all", label: "All" },
];

const SHAPES: { value: ChartShape; label: string; icon: typeof ChartLine }[] = [
  { value: "line", label: "Line chart", icon: ChartLine },
  { value: "bars", label: "Bar chart", icon: ChartColumn },
];

/** One height for the whole row, so the controls read as a single band. */
const GROUP_CLASS =
  "flex h-9 cursor-pointer items-center rounded-lg border border-border bg-card p-1";

type AnalyticsFiltersProps = {
  range: AnalyticsRange;
  includeBots: boolean;
  shape: ChartShape;
  refreshing: boolean;
  onRangeChange: (range: AnalyticsRange) => void;
  onIncludeBotsChange: (includeBots: boolean) => void;
  onShapeChange: (shape: ChartShape) => void;
  onRefresh: () => void;
};

export const AnalyticsFilters = ({
  range,
  includeBots,
  shape,
  refreshing,
  onRangeChange,
  onIncludeBotsChange,
  onShapeChange,
  onRefresh,
}: AnalyticsFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <div
      role="group"
      aria-label="Time range"
      className={cn(GROUP_CLASS, "gap-0.5")}
    >
      {RANGES.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={range === option.value}
          onClick={() => onRangeChange(option.value)}
          className={cn(
            "flex h-full cursor-pointer items-center rounded-md px-2.5 text-xs font-medium transition-colors",
            range === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>

    <div
      role="group"
      aria-label="Chart shape"
      className={cn(GROUP_CLASS, "gap-0.5")}
    >
      {SHAPES.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          aria-label={option.label}
          aria-pressed={shape === option.value}
          onClick={() => onShapeChange(option.value)}
          className={cn(
            "flex h-full cursor-pointer items-center rounded-md px-2 transition-colors",
            shape === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <option.icon className="size-4" />
        </button>
      ))}
    </div>

    <label
      className={cn(GROUP_CLASS, "gap-2 px-3 text-xs text-muted-foreground")}
    >
      <input
        type="checkbox"
        checked={includeBots}
        onChange={(event) => onIncludeBotsChange(event.target.checked)}
        className="size-3.5 accent-[var(--primary)]"
      />
      Include bots
    </label>

    <Button
      variant="outline"
      onClick={onRefresh}
      disabled={refreshing}
      aria-label="Refresh"
      className="h-9 gap-1.5 px-3 text-xs"
    >
      <RefreshCw className={cn(refreshing && "animate-spin")} />
      Refresh
    </Button>
  </div>
);
