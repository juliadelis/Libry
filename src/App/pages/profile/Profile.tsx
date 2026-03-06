import { inject } from "../../shared/modules/di";
import SearchBar from "../../shared/components/SearchBar/SearchBar";
import { usersService } from "../../shared/services/users.service";
import { Button } from "primereact/button";
import ReadGraph from "./Graph/Graph";
import GoalCarousel from "./GoalCarousel/GoalCarousel";

function Profile() {
  const userService = inject(usersService);
  const user = userService.getCurrent();

  return (
    <div className="flex flex-col py-4 px-6 gap-6 h-full w-full">
      <div className="w-fit">
        <SearchBar />
      </div>

      <div className=" gap-5 grid grid-cols-1 lg:grid-cols-12">
        <div className="col-span-3 flex items-end">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="Profile"
              className="w-65 h-65 rounded-3xl object-cover"
            />
          ) : (
            <div className="w-65 h-65 rounded-3xl bg-[#0E2310] flex items-center justify-center">
              <span className="font-family-koh text-white  text-6xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
          )}
        </div>
        <div className="col-span-6">
          <div className="flex flex-col gap-2 text-left mt-4">
            <div>
              <h2 className="font-family-koh text-[18px] font-bold">
                {user?.name}
              </h2>
              <p className="text-gray-600 text-[14px]">{user?.email}</p>
            </div>

            <div className="flex items-center gap-2.5 text-[14px]">
              <p>21 Followers</p>
              <span className="inline-block w-px h-4 bg-[#3B5219]" />
              <p>23 Following</p>
            </div>

            <div className="flex items-center gap-2.5 text-[14px]">
              <p>{user?.bio}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 mid:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3">
              <div className="bg-[#0E2310] flex flex-col gap-6 h-full rounded-xl px-3 py-4 text-white ">
                <p className="font bold font-family-koh">Shelf</p>
                <div>
                  <span className="font-bold text-4xl">74</span>
                  <p>books</p>
                </div>
              </div>
              <div className="bg-[#0E2310] flex flex-col gap-6 h-full rounded-xl px-3 py-4 text-white ">
                <p className="font bold font-family-koh">Reading</p>
                <div>
                  <span className="font-bold text-4xl">2</span>
                  <p>books</p>
                </div>
              </div>
              <div className="bg-[#0E2310] flex flex-col gap-6 h-full rounded-xl px-3 py-4 text-white ">
                <p className="font bold font-family-koh">Read</p>
                <div>
                  <span className="font-bold text-4xl">58</span>
                  <p>books</p>
                </div>
              </div>
              <div className="bg-[#0E2310] flex flex-col gap-5 h-full rounded-xl px-3 py-4 text-white ">
                <div>
                  <span className="font-family-koh">Most liked author</span>
                  <p className="font-bold">Freida McFaden</p>
                </div>
                <div>
                  <span className=" font-family-koh">Most liked genre</span>
                  <p className="font-bold">Suspense</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-3 flex">
          <div className="flex flex-col gap-3 justify-end">
            <div>
              <Button
                className="bg-[#7B8D3B] px-4 w-full py-1 gap-2 text-white rounded-full"
                label="Edit profile"
              />
            </div>
            <div>
              <Button
                className="bg-[#7B8D3B] w-full px-4 py-1 items-center text-white rounded-full"
                label="Add book"
                icon="pi pi-plus"
              />
            </div>
            <div>
              <Button
                className="bg-[#0E2310] w-full px-4 py-1 gap-2 text-white rounded-full"
                label="Add reading history"
                icon="pi pi-plus"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1  lg:grid-cols-2 gap-4">
        <ReadGraph />

        <div>
          <GoalCarousel />
        </div>
      </div>
    </div>
  );
}

export default Profile;
