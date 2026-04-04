import { Skeleton } from "@/app/components/shared/atoms/Skeleton";

export const InitSkeleton = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Sticky header skeleton */}
      <div className="sticky top-0 z-500 pt-4 pb-4 flex justify-center bg-zinc-950">
        <div className="w-full max-w-5xl px-4 flex flex-col items-center">
          {/* Desktop header */}
          <div className="hidden md:flex w-full text-center mb-4 relative flex-col items-center rounded-lg px-5 py-3">
            <div className="absolute top-2 right-2">
              <Skeleton className="w-20 h-10 rounded-full" />
            </div>

            <Skeleton className="h-8 w-64 mb-1" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Mobile header bar */}
          <div className="md:hidden w-full mb-3 flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5">
            <Skeleton className="w-8.5 h-8.5 rounded-lg" />
            <div className="flex-1 flex justify-center">
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="w-8.5 h-8.5" />
          </div>

          {/* Desktop filter row */}
          <div className="hidden md:flex gap-2 w-full mb-4 items-center">
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="ml-auto h-9 w-32" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>

          {/* Mobile type filters */}
          <div className="md:hidden flex gap-2 w-full mb-3">
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-9 w-20" />
          </div>

          {/* Desktop search bar */}
          <Skeleton className="hidden md:block w-full h-12 mb-5" />

          {/* Mobile search bar */}
          <Skeleton className="md:hidden w-full h-11 mb-4" />
        </div>
      </div>

      {/* Recent searches skeleton */}
      <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
        <Skeleton className="h-7 w-44 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>

      {/* Featured carousel skeleton */}
      <div
        className="w-full relative z-10 mb-10 mx-auto"
        style={{ maxWidth: 1400 }}
      >
        <div className="max-w-5xl mx-auto px-4 mb-3">
          <Skeleton className="h-7 w-44" />
        </div>
        <div className="flex gap-3 px-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="shrink-0 w-65 md:w-100 aspect-video" />
          ))}
        </div>
      </div>

      {/* Upcoming games skeleton */}
      <div className="w-full max-w-5xl mx-auto px-4 mb-6 relative z-10">
        <Skeleton className="h-7 w-40 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-47.5" />
          ))}
        </div>
      </div>
    </div>
  );
};
