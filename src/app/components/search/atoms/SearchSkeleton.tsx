import { GameNameFilterSkeleton } from "../../header/molecules/GameNameFilterSkeleton";
import { PriceGridSkeleton } from "../organisms/PriceGridSkeleton";

export const SearchSkeleton = () => (
  <div className="flex-1 pb-4 relative z-10">
    <div className="max-w-5xl mx-auto px-4">
      <GameNameFilterSkeleton />
      <PriceGridSkeleton />
    </div>
  </div>
);
