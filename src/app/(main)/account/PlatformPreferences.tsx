"use client";

import { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/shared/UI/Button";
import { PlatformMark } from "@/app/components/header/atoms/PlatformMark";
import { PLATFORMS, PLATFORM_LABELS } from "@/shared/lib/stores/types";
import type { Platform } from "@/shared/lib/stores/types";
import { cn } from "@/shared/lib/utils";

/**
 * Which machines this person owns. It decides which price their saved games
 * are quoted at, so getting it wrong means being shown a key that will not
 * run — which is why the form refuses to submit an empty selection rather
 * than treating it as "all".
 */
export const PlatformPreferences = ({
  initial,
}: {
  initial: Platform[];
}) => {
  const [selected, setSelected] = useState<Set<Platform>>(
    () => new Set(initial.length > 0 ? initial : (["pc"] as Platform[])),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggle = (platform: Platform) => {
    setSaved(false);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(platform)) {
        next.delete(platform);
      } else {
        next.add(platform);
      }
      // Never empty: no platform means no price on any saved game, which
      // looks like the tracker broke rather than like a setting.
      return next.size === 0 ? current : next;
    });
  };

  const save = async () => {
    setPending(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/account/platforms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: [...selected] }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not save platforms.");
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save platforms.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="text-sm font-medium text-foreground">Your platforms</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Saved games are priced on these only. A key for a machine you do not
          own cannot be refunded, so nothing else is shown.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => {
          const on = selected.has(platform);
          return (
            <button
              key={platform}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(platform)}
              className={cn(
                "flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <PlatformMark platform={platform} />
              {PLATFORM_LABELS[platform]}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="flex items-center gap-1.5 text-xs text-primary">
          <Check className="size-3.5" />
          Saved.
        </p>
      ) : null}

      <div>
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save platforms"}
        </Button>
      </div>
    </section>
  );
};
