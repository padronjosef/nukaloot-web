import { Skeleton } from "@/shared/UI/Skeleton";

export const RecentSearchesSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
    <div className="mb-5">
      <Skeleton className="h-8 w-52 mb-1" />
      <Skeleton className="h-4 w-44" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-background border border-border/50 rounded-lg">
          <Skeleton className="size-10 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-24 mb-1.5" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
