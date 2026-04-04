import { Skeleton } from "@/app/components/shared/atoms/Skeleton";

export const UpcomingGamesSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
    <Skeleton className="h-7 w-40 mb-3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-[190px]" />
      ))}
    </div>
  </div>
);
