import { Skeleton } from "../../shared/atoms/Skeleton";

export const SearchSkeleton = () => (
  <div className="flex-1 pb-4 relative z-10">
    <div className="max-w-5xl mx-auto px-4">
      {/* Game name filters skeleton */}
      <div className="flex gap-2 w-full mb-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-36" />
      </div>

      {/* Section title skeleton */}
      <Skeleton className="h-7 w-32 mb-3" />

      {/* Results grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} className="h-[190px]" />
        ))}
      </div>
    </div>
  </div>
);
