"use client";

import { useState } from "react";
import type {
  AnalyticsRange,
  TimelinePoint,
  VisitorKind,
} from "@/shared/lib/analytics-types";
import { KIND_STYLE } from "@/shared/lib/analytics-types";
import { cn } from "@/shared/lib/utils";

export type ChartShape = "line" | "bars";

type TimelineChartProps = {
  title: string;
  points: TimelinePoint[];
  metric: "count" | "visitors";
  range: AnalyticsRange;
  shape: ChartShape;
  /** Bots are a line of their own, shown only when they are being counted. */
  showBots: boolean;
};

const HEIGHT = 120;
const TOP_GAP = 8;

const formatBucket = (bucket: string, range: AnalyticsRange) => {
  const date = new Date(bucket);
  return range === "24h"
    ? date.toLocaleTimeString([], { hour: "numeric" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
};

/** Where the tooltip sits, and which way it has to flip to stay clear. */
type Pointer = { x: number; y: number; flipX: boolean; flipY: boolean };

const CURSOR_GAP = 16;

export const TimelineChart = ({
  title,
  points,
  metric,
  range,
  shape,
  showBots,
}: TimelineChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pointer, setPointer] = useState<Pointer | null>(null);
  const [hidden, setHidden] = useState<VisitorKind[]>([]);

  const toggle = (kind: VisitorKind) =>
    setHidden((current) =>
      current.includes(kind)
        ? current.filter((k) => k !== kind)
        : [...current, kind],
    );

  // The tooltip follows the cursor instead of sitting in a fixed corner, and
  // flips side once it would run past an edge or cover what is being read.
  const trackPointer = (event: React.MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    setPointer({
      x,
      y,
      flipX: x > box.width * 0.6,
      flipY: y < box.height * 0.5,
    });
  };

  /** Everything the legend offers, whether or not it is currently drawn. */
  const offered: VisitorKind[] = showBots
    ? ["registered", "anonymous", "bots"]
    : ["registered", "anonymous"];
  const kinds = offered.filter((kind) => !hidden.includes(kind));

  if (points.length === 0) {
    return (
      <figure className="rounded-xl border border-border bg-card p-4">
        <figcaption className="text-sm font-medium text-foreground">
          {title}
        </figcaption>
        <div className="mt-6 flex h-[120px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-sm text-muted-foreground italic">No data yet</p>
        </div>
      </figure>
    );
  }

  // Defaulted because web and api restart independently: during a deploy this
  // can briefly receive the older payload shape, and a missing series should
  // draw as zero rather than blank the whole page.
  const valueAt = (index: number, kind: VisitorKind) =>
    points[index]?.[kind]?.[metric] ?? 0;

  const max = Math.max(
    ...points.flatMap((_, i) => kinds.map((k) => valueAt(i, k))),
    1,
  );
  const total = points.reduce(
    (sum, _, i) => sum + kinds.reduce((s, k) => s + valueAt(i, k), 0),
    0,
  );

  const slot = 100 / points.length;
  /** Centre of each slot, so lines and bars share an x for the same day. */
  const xOf = (index: number) => index * slot + slot / 2;
  const heightOf = (value: number) => (value / max) * (HEIGHT - TOP_GAP);
  const yOf = (value: number) => HEIGHT - heightOf(value);

  const barWidth = Math.max((slot * 0.75) / kinds.length, 0.25);

  return (
    <figure className="rounded-xl border border-border bg-card p-4">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="font-heading text-lg tabular-nums text-foreground">
          {total.toLocaleString()}
        </span>
      </figcaption>

      <div
        className="relative mt-3"
        onMouseMove={trackPointer}
        onMouseLeave={() => {
          setHovered(null);
          setPointer(null);
        }}
        role="img"
        aria-label={`${title}: ${total} across ${points.length} points`}
      >
        <svg
          viewBox={`0 0 100 ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-[120px] w-full overflow-visible"
        >
          <line
            x1="0"
            y1={HEIGHT}
            x2="100"
            y2={HEIGHT}
            stroke="var(--border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          {kinds.map((kind, kindIndex) => {
            const style = KIND_STYLE[kind];

            if (shape === "bars") {
              return points.map((point, index) => {
                const value = valueAt(index, kind);
                if (value === 0) return null;
                const height = heightOf(value);

                return (
                  <rect
                    key={`${kind}-${point.bucket}`}
                    x={
                      index * slot +
                      slot * 0.125 +
                      kindIndex * barWidth +
                      kindIndex * (barWidth * 0.08)
                    }
                    y={HEIGHT - height}
                    width={barWidth}
                    height={height}
                    fill={style.color}
                    opacity={hovered === null || hovered === index ? 1 : 0.45}
                  />
                );
              });
            }

            if (points.length < 2) return null;

            return (
              <polyline
                key={kind}
                points={points
                  .map((_, i) => `${xOf(i)},${yOf(valueAt(i, kind))}`)
                  .join(" ")}
                fill="none"
                stroke={style.color}
                strokeWidth="2"
                strokeDasharray={style.dashed ? "5 4" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
                // Without this the stroke stretches with the viewBox.
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Full-height hit targets: easier to reach than a 2px line. */}
          {points.map((point, index) => (
            <rect
              key={`hit-${point.bucket}`}
              x={index * slot}
              y={0}
              width={slot}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHovered(index)}
            />
          ))}

          {hovered !== null ? (
            <line
              x1={xOf(hovered)}
              y1={0}
              x2={xOf(hovered)}
              y2={HEIGHT}
              stroke="var(--muted-foreground)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
              opacity={0.5}
            />
          ) : null}
        </svg>

        {/* HTML dots rather than SVG circles: the stretched viewBox would
            squash a circle into an ellipse. */}
        {hovered !== null && shape === "line"
          ? kinds.map((kind) => (
              <span
                key={`dot-${kind}`}
                className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
                style={{
                  backgroundColor: KIND_STYLE[kind].color,
                  left: `${xOf(hovered)}%`,
                  top: `${yOf(valueAt(hovered, kind))}px`,
                }}
              />
            ))
          : null}

        {hovered !== null && pointer && kinds.length > 0 ? (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-popover px-2 py-1.5 text-xs whitespace-nowrap shadow-lg"
            style={{
              left: pointer.x + (pointer.flipX ? -CURSOR_GAP : CURSOR_GAP),
              top: pointer.y + (pointer.flipY ? CURSOR_GAP : -CURSOR_GAP),
              transform: `translate(${pointer.flipX ? "-100%" : "0"}, ${
                pointer.flipY ? "0" : "-100%"
              })`,
            }}
          >
            <p className="mb-1 text-muted-foreground">
              {formatBucket(points[hovered].bucket, range)}
            </p>
            {kinds.map((kind) => (
              <p key={kind} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: KIND_STYLE[kind].color }}
                />
                <span className="text-muted-foreground">
                  {KIND_STYLE[kind].label}
                </span>
                <span className="ml-auto pl-2 font-medium text-foreground tabular-nums">
                  {valueAt(hovered, kind).toLocaleString()}
                </span>
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatBucket(points[0].bucket, range)}</span>
        <span>{formatBucket(points[points.length - 1].bucket, range)}</span>
      </div>

      {/* Always present for more than one series, so identity is never colour
          alone for someone who cannot tell the hues apart. Each entry toggles
          its line, which is how you read one series without the others. */}
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-3">
        {offered.map((kind) => {
          const isHidden = hidden.includes(kind);
          const style = KIND_STYLE[kind];

          return (
            <li key={kind}>
              <button
                type="button"
                onClick={() => toggle(kind)}
                aria-pressed={!isHidden}
                title={isHidden ? `Show ${style.label}` : `Hide ${style.label}`}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-colors hover:bg-muted",
                  isHidden ? "text-muted-foreground/60" : "text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className="h-0.5 w-3 shrink-0 rounded-full"
                  style={{
                    backgroundColor: isHidden
                      ? "var(--muted-foreground)"
                      : style.color,
                    opacity: isHidden ? 0.4 : 1,
                  }}
                />
                <span className={cn(isHidden && "line-through")}>
                  {style.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </figure>
  );
};
