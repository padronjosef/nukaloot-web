import { Skeleton } from "@/shared/UI/Skeleton";

export const FeaturedCarouselSkeleton = () => (
  <div className="w-full relative z-10 mb-10 mx-auto max-w-5xl px-4">
    <div className="mb-5">
      <Skeleton className="h-8 w-48 mb-1" />
      <Skeleton className="h-4 w-52" />
    </div>
    <div className="flex gap-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col shrink-0 w-48 md:w-56">
          <Skeleton className="aspect-[3/4] rounded-t-lg" />
          <div className="flex flex-col gap-1.5 bg-background rounded-b-lg border border-t-0 border-border/50 px-3 py-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
