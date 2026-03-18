import SearchBar from "../../shared/components/SearchBar/SearchBar";
import CurrentBookCarousel from "./CurrentBookCarousel/CurrentBookCarousel";
import BookStreak from "./BookStreak/BookStreak";

function Home() {
  return (
    <>
      <div className="flex flex-col py-4 px-6 gap-6 h-full w-full">
        <div className="w-fit">
          <SearchBar />
        </div>

        <div className=" gap-5 grid grid-cols-1 lg:grid-cols-12">
          <div className="col-span-8 flex gap-5 ">
            <CurrentBookCarousel />
          </div>
          <div className="col-span-4 flex gap-5">
            <BookStreak />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
