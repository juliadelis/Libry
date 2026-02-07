import { Link, useNavigate } from "react-router-dom";
import logo from "/img/libry_icon+typography.svg";
import { inject } from "../../modules/di";
import { usersService } from "../../services/users.service";
import { ImBooks, ImSearch } from "react-icons/im";
import { IoNotifications, IoPersonCircleOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

function NavBar() {
  const userService = inject(usersService);
  const user = userService.getCurrent();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  const navItems: Array<{
    title: string;
    color?: string;
    link: string;
    icon: React.ReactNode;
  }> = [
    {
      title: "My shelf",
      link: "/shelf",
      color: "#7B8D3B",
      icon: <ImBooks color="#7B8D3B" />,
    },
    {
      title: "Notifications",
      link: "/notifications",
      color: "#7B8D3B",
      icon: <IoNotifications color="#7B8D3B" />,
    },
    {
      title: "Profile",
      link: "/profile",
      color: "#7B8D3B",
      icon: <IoPersonCircleOutline size={19} color="#7B8D3B" />,
    },
    {
      title: "Search",
      link: "/search",
      color: "#7B8D3B",
      icon: <ImSearch stroke="#7B8D3B" color="#7B8D3B" />,
    },
  ];

  return (
    <>
      <div className="flex px-5 py-7 justify-between flex-col bg-white w-full h-full">
        <div className="flex flex-col gap-10">
          <div>
            <img src={logo} alt="Libry Logo" height={55} width={172} />
          </div>
          <div>
            <h3 className="text-left font-family-koh font-bold text-[18px] text-[#1F1F1F]">
              Hi, <span>{user?.name}</span>!
            </h3>
          </div>
          {user?.photoUrl && (
            <div>
              <img
                src={user.photoUrl}
                alt={`${user.name}'s profile`}
                className="rounded-l-2xl w-56.5 h-48.5 object-cover"
              />
            </div>
          )}
          <nav>
            <ul className="flex flex-col gap-3">
              {navItems.map((item) => (
                <li key={item.link}>
                  <Link
                    className={`flex items-center font-bold text-[16px] gap-2 text-[${item.color}]`}
                    to={item.link}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div>
          <button
            className="flex items-center font-bold text-[16px] gap-2 text-[#7B8D3B] cursor-pointer"
            type="button"
            onClick={handleLogout}>
            <FiLogOut color="#7B8D3B" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default NavBar;
