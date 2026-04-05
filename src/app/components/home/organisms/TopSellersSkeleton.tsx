import { Skeleton } from "@/shared/UI/Skeleton";
import { SkeletonCard } from "@/app/components/shared/molecules/GameCard";

export const TopSellersSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
    <div className="mb-5">
      <Skeleton className="h-8 w-36 mb-1" />
      <Skeleton className="h-4 w-52" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {[...Array(6)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);
