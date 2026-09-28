"use client";

import { useMemo } from "react";
import { Checkbox } from "@/app/components/shared/atoms/Checkbox";
import { Dropdown } from "@/app/components/shared/molecules/Dropdown";
import { PlatformMark } from "@/app/components/header/atoms/PlatformMark";
import { PLATFORMS, PLATFORM_LABELS } from "@/shared/lib/stores/types";
import { platformCounts } from "@/shared/stores/platformCounts";
import { useFilterStore } from "@/shared/stores/useFilterStore";
import { useSearchStore } from "@/shared/stores/useSearchStore";

/**
 * Every platform, every time — including the ones this search found nothing
 * for, greyed out and showing zero. Hiding the control whenever a search
 * happens to be PC-only is what makes it look like the site cannot filter by
 * platform at all, because most searches are PC-only.
 */
export const PlatformFilter = () => {
  const selected = useFilterStore((s) => s.selectedPlatforms);
  const toggle = useFilterStore((s) => s.togglePlatform);
  const results = useSearchStore((s) => s.results);

  const counts = useMemo(() => platformCounts(results?.prices), [results]);

  // Before the first search there is nothing to filter.
  if (!results) return null;

  const chosen = PLATFORMS.filter((platform) => selected.has(platform));
  const allChosen = chosen.length === PLATFORMS.length;

  return (
    <Dropdown
      active={!allChosen}
      panelClassName="py-1 min-w-56"
      trigger={
        <>
          <span className="flex items-center gap-1">
            {chosen.map((platform) => (
              <PlatformMark
                key={platform}
                platform={platform}
                className="size-3.5"
              />
            ))}
          </span>
          {chosen.length === 1 ? PLATFORM_LABELS[chosen[0]] : "Platforms"}
        </>
      }
    >
      {PLATFORMS.map((platform) => {
        const on = selected.has(platform);
        const count = counts[platform];
        const empty = count === 0;

        return (
          <button
            key={platform}
            type="button"
            disabled={empty}
            aria-pressed={on}
            onClick={() => toggle(platform)}
            title={
              empty ? `No ${PLATFORM_LABELS[platform]} keys for this search` : undefined
            }
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm ${
              empty
                ? "cursor-not-allowed text-muted-foreground/40"
                : "cursor-pointer hover:bg-border"
            }`}
          >
            <Checkbox checked={on} />
            <PlatformMark platform={platform} />
            <span className={empty ? "" : "text-foreground/90"}>
              {PLATFORM_LABELS[platform]}
            </span>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {count}
            </span>
          </button>
        );
      })}
    </Dropdown>
  );
};
