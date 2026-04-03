import { Suspense } from "react";
import { SearchTemplate } from "../../components/search/templates/SearchTemplate";

const SearchPage = () => {
  return (
    <Suspense>
      <SearchTemplate />
    </Suspense>
  );
};

export default SearchPage;
