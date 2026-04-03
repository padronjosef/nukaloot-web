import { Skeleton } from "../../shared/atoms/Skeleton";

export const FeaturedCarouselSkeleton = () => (
  <div className="w-full relative z-10 mb-10 mx-auto" style={{ maxWidth: 1400 }}>
    <div className="max-w-5xl mx-auto px-4 mb-3">
      <Skeleton className="h-7 w-44" />
    </div>
    <div className="flex gap-3 px-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="shrink-0 w-65 md:w-100 aspect-video" />
      ))}
    </div>
  </div>
);
