"use client";

import { useEffect, useState } from "react";
import { Radiation } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import pkg from "../../../../../package.json";

type BrandMarkProps = {
  size?: "sm" | "md";
  className?: string;
};

/**
 * The wordmark with both versions under it. The API's version is fetched
 * rather than built in, so it reports what is actually answering.
 */
export const BrandMark = ({ size = "md", className }: BrandMarkProps) => {
  const [apiVersion, setApiVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/version")
      .then((r) => r.json())
      .then((d: { version?: string }) => setApiVersion(d.version ?? null))
      .catch(() => {});
  }, []);

  const small = size === "sm";

  return (
    <span className={cn("flex flex-col", className)}>
      <span
        className={cn(
          "flex items-center font-bold italic text-primary",
          small ? "gap-1.5 text-base" : "gap-2 text-xl",
        )}
      >
        <Radiation className={small ? "size-5" : "size-6"} />
        Nukaloot
      </span>
      <span
        className={cn(
          "-mt-1 text-[9px] text-muted-foreground",
          small ? "ml-6.5" : "ml-8",
        )}
      >
        v{pkg.version}
        {apiVersion ? ` / api v${apiVersion}` : ""}
      </span>
    </span>
  );
};
