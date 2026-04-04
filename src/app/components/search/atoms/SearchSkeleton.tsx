import { GameNameFilterSkeleton } from "@/app/components/header/molecules/GameNameFilterSkeleton";
import { PriceGridSkeleton } from "../organisms/PriceGridSkeleton";

export const SearchSkeleton = () => (
  <>
    <GameNameFilterSkeleton />
    <PriceGridSkeleton />
  </>
);
