import { Skeleton } from "@/shared/UI/Skeleton";

export const StatTileSkeleton = () => (
  <div className="rounded-xl border border-border bg-card px-4 py-3.5">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-2 h-6 w-16" />
    <Skeleton className="mt-2 h-3 w-20" />
  </div>
);
