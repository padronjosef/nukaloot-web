import { RecentSearchesSkeleton } from "../molecules/RecentSearchesSkeleton";
import { FeaturedCarouselSkeleton } from "../organisms/FeaturedCarouselSkeleton";
import { UpcomingGamesSkeleton } from "../organisms/UpcomingGamesSkeleton";

export const HomeSkeleton = () => (
  <>
    <RecentSearchesSkeleton />
    <FeaturedCarouselSkeleton />
    <UpcomingGamesSkeleton />
  </>
);
