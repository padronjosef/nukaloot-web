import { Skeleton } from "@/app/components/shared/atoms/Skeleton";

export const GameNameFilterSkeleton = () => (
  <div className="flex gap-2 w-full mb-4">
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-8 w-28" />
    <Skeleton className="h-8 w-36" />
  </div>
);
