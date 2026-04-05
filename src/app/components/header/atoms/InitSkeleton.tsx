import { Skeleton } from "@/shared/UI/Skeleton";
import { SkeletonCard } from "@/app/components/shared/molecules/GameCard";

export const InitSkeleton = () => (
  <div className="flex flex-col min-h-screen relative">
    {/* Header skeleton */}
    <div className="z-500 flex flex-col items-center mb-6">
      {/* Desktop */}
      <div className="hidden md:flex w-full bg-background">
        <div className="w-full max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <div className="flex items-center gap-2 flex-1 max-w-150 min-w-0">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="size-10" />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden w-full flex flex-col bg-background">
        <div className="flex items-center justify-between px-4 pt-3 pb-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="size-10" />
        </div>
        <div className="bg-linear-to-b from-[#1a1a1a] to-[#111111] rounded-none! px-4 pt-4 pb-10 -mb-6">
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>

    {/* Recent searches */}
    <div className="w-full max-w-5xl mx-auto px-4 mb-6 mt-4 md:mt-0 relative z-10">
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

    {/* Featured carousel */}
    <div className="w-full relative z-10 mb-10 mx-auto max-w-5xl px-4">
      <div className="mb-5">
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col shrink-0 w-48 md:w-56">
            <Skeleton className="aspect-3/4 rounded-t-lg" />
            <div className="flex flex-col gap-1.5 bg-background rounded-b-lg border border-t-0 border-border/50 px-3 py-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Top sellers */}
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
  </div>
);
