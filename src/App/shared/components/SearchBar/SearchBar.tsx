import { ImSearch } from "react-icons/im";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { useMemo, useState } from "react";
import { Filter } from "../../models/search.model";
import "./SearchBar.css";

const filterOptionsMap: Record<Filter, { label: string; value: Filter }> = {
  [Filter.Title]: { label: "Title", value: Filter.Title },
  [Filter.Author]: { label: "Author", value: Filter.Author },
  [Filter.Genre]: { label: "Genre", value: Filter.Genre },
};

function SearchBar() {
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);

  return (
    <>
      <div className="flex gap-4 items-center">
        <div className="w-full h-11 bg-[#AEAEAE] rounded-full flex items-center px-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-full bg-transparent outline-none text-[#000000] text-[14px]"
          />
          <ImSearch stroke="#7B8D3B" color="#7B8D3B" />
        </div>
        <div className="text-black">
          <Dropdown
            inputId="filter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.value)}
            options={Object.values(filterOptionsMap)}
            optionLabel="label"
            placeholder="Filter"
            className="searchbar-dropdown w-[130px] py-2 bg-[#AEAEAE]"
          />
        </div>
      </div>
    </>
  );
}

export default SearchBar;
