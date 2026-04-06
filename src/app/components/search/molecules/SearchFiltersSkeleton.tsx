import { Skeleton } from "@/shared/UI/Skeleton";

export const SearchFiltersSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto px-4 relative z-10 mb-9 mt-6 md:mt-0">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-18" />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Skeleton className="h-8 w-22" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-22" />
      </div>
    </div>
  </div>
);
