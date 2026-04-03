import { Skeleton } from "../../shared/atoms/Skeleton";

export const PriceGridSkeleton = () => (
  <>
    <Skeleton className="h-7 w-32 mb-3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {[...Array(9)].map((_, i) => (
        <Skeleton key={i} className="h-[190px]" />
      ))}
    </div>
  </>
);
