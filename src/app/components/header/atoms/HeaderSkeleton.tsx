import { Skeleton } from "@/app/components/shared/atoms/Skeleton";

export const HeaderSkeleton = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen relative">
    <div className="sticky top-0 z-500 pt-4 pb-4 flex justify-center bg-zinc-950">
      <div className="w-full max-w-5xl px-4 flex flex-col items-center">
        {/* Desktop header */}
        <div className="hidden md:flex w-full text-center mb-4 relative flex-col items-center bg-zinc-800 rounded-lg px-5 py-3 animate-pulse">
          <div className="absolute top-2 right-2">
            <div className="w-20 h-10 rounded-full bg-zinc-700" />
          </div>
          <div className="h-8 w-64 mb-1 bg-zinc-700 rounded-lg" />
          <div className="h-5 w-72 bg-zinc-700 rounded-lg" />
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

    {children}
  </div>
);
