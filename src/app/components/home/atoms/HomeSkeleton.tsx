import { RecentSearchesSkeleton } from "../molecules/RecentSearchesSkeleton";
import { FeaturedCarouselSkeleton } from "../organisms/FeaturedCarouselSkeleton";
import { TopSellersSkeleton } from "../organisms/TopSellersSkeleton";

export const HomeSkeleton = () => (
  <>
    <RecentSearchesSkeleton />
    <FeaturedCarouselSkeleton />
    <TopSellersSkeleton />
  </>
);
