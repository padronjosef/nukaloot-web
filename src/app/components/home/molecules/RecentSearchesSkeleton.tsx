import { Skeleton } from "../../shared/atoms/Skeleton";

export const RecentSearchesSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
    <Skeleton className="h-7 w-44 mb-3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  </div>
);
