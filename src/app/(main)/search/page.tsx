import { Suspense } from "react";
import { SearchTemplate } from "@/app/components/search/templates/SearchTemplate";
import { SearchSkeleton } from "@/app/components/search/atoms/SearchSkeleton";

const SearchPage = () => {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchTemplate />
    </Suspense>
  );
};

export default SearchPage;
