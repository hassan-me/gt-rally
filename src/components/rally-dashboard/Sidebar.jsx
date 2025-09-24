import { useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, selectUser } from "../../redux/slices/user.slice";
import { useDispatch, useSelector } from "react-redux";
import { User, LayoutDashboard, CalendarDays, Car, PlusSquare, LogOut } from "lucide-react";
import { getImage } from "@/utlis/helpers";

export default function Sidebar() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Function to open the dashboard
    const openDashboard = () => {
      document.querySelector(".sidebar-dashboard").classList.add("active");
      document.querySelector(".dashboard-overlay").classList.add("active");
    };

    // Function to close the dashboard
    const closeDashboard = () => {
      document.querySelector(".sidebar-dashboard").classList.remove("active");
      document.querySelector(".dashboard-overlay").classList.remove("active");
    };

    // Adding event listeners
    const openButton = document.querySelector(".dashboard-toggle");
    const overlay = document.querySelector(".dashboard-overlay");

    openButton?.addEventListener("click", openDashboard);
    overlay?.addEventListener("click", closeDashboard);

    // Cleanup: Remove event listeners on component unmount
    return () => {
      openButton?.removeEventListener("click", openDashboard);
      overlay?.removeEventListener("click", closeDashboard);
    };
  }, []);

  const { pathname } = useLocation();

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <div className="dashboard-overlay" />
      <aside className="sidebar-dashboard">
        <div s className="db-content db-logo pad-30">
          <Link to={`/`} title="autodecar">
            <img
              className="lazyload img-none"
              data-src="/assets/images/logo/logo@2x.png"
              alt=""
              width={225}
              height={40}
              src="/assets/images/logo/logo@2x.png"
            />
          </Link>
        </div>
        <div className="db-content db-author pad-30">
          <h6 className="db-title">Profile</h6>
          <div className="author">
            <div className="avatar">
              {user.profileImageUrl ? (
                <img
                  alt="profile"
                  src={getImage(user.profileImage)}
                  width={52}
                  height={52}
                />
              ) : (
                <User size={32} />
              )}
            </div>
            <div className="content">
              <div className="name">
                {user.firstName} {user.lastName}
              </div>
              <div className="author-email">{user.email}</div>
            </div>
          </div>
        </div>
        <div className="db-content db-list-menu">
          <h6 className="db-title">Menu</h6>
          <div className="db-dashboard-menu">
            <ul>
              <li>
                <Link
                  to={`/dashboard`}
                  className={`menu-index-1 ${
                    pathname == "/dashboard" ? "active" : ""
                  } `}
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to={`/public-events`}
                  className={`menu-index-2 ${
                    pathname == "/public-events" ? "active" : ""
                  } `}
                >
                  <CalendarDays size={20} />
                  Public Events
                </Link>
              </li>
              <li>
                <Link
                  to={`/my-garage`}
                  className={`menu-index-3 ${
                    pathname == "/my-garage" ? "active" : ""
                  } `}
                >
                  <Car size={20} />
                  My Garage
                </Link>
              </li>
              <li>
                <Link
                  to="/create-event"
                  state={{ forceCreateEvent: true }}
                  className={`menu-index-4 ${
                    pathname == "/message" ? "active" : ""
                  } `}
                >
                  <PlusSquare size={20} />
                  Create Event
                </Link>
              </li>
              {/* <li>
                <Link
                  to={`/my-review`}
                  className={`menu-index-4 ${
                    pathname == "/my-review" ? "active" : ""
                  } `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={22}
                    height={22}
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <g opacity="0.2">
                      <path
                        d="M16.5756 8.11328L12.5026 11.4252C11.7331 12.0357 10.6504 12.0357 9.88082 11.4252L5.77344 8.11328"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.6665 19.25C18.4544 19.2577 20.3333 16.9671 20.3333 14.1518V7.85584C20.3333 5.04059 18.4544 2.75 15.6665 2.75H6.66687C3.87897 2.75 2 5.04059 2 7.85584V14.1518C2 16.9671 3.87897 19.2577 6.66687 19.25H15.6665Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                  My Reviews
                </Link>
              </li> */}
              <li>
                <Link
                  to={`/my-profile`}
                  className={`menu-index-6 ${
                    pathname == "/my-profile" ? "active" : ""
                  } `}
                >
                  <User size={20} />
                  Profile
                </Link>
              </li>
              {/* <li>
                <Link
                  to={`/change-password`}
                  className={`menu-index-7 ${
                    pathname == "/change-password" ? "active" : ""
                  } `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={22}
                    height={22}
                    viewBox="0 0 22 22"
                    fill="none"
                  >
                    <g opacity="0.2">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.0674 6.98797L18.4969 5.99788C18.0142 5.16012 16.9445 4.87111 16.1056 5.35181V5.35181C15.7062 5.58705 15.2297 5.65379 14.7811 5.53732C14.3325 5.42084 13.9487 5.13071 13.7143 4.73091C13.5634 4.47679 13.4824 4.18735 13.4793 3.89186V3.89186C13.4929 3.41811 13.3142 2.95902 12.9838 2.61918C12.6535 2.27935 12.1996 2.0877 11.7257 2.08789H10.5762C10.1119 2.08789 9.66669 2.27291 9.33915 2.60202C9.01161 2.93113 8.82873 3.3772 8.83096 3.84151V3.84151C8.8172 4.80017 8.03609 5.57006 7.07733 5.56997C6.78184 5.5669 6.4924 5.48585 6.23828 5.33503V5.33503C5.39937 4.85433 4.32967 5.14334 3.84698 5.9811L3.23447 6.98797C2.75236 7.82468 3.03743 8.89371 3.87215 9.37927V9.37927C4.41473 9.69252 4.74897 10.2714 4.74897 10.898C4.74897 11.5245 4.41473 12.1034 3.87215 12.4166V12.4166C3.03849 12.8989 2.75311 13.9654 3.23447 14.7996V14.7996L3.81341 15.798C4.03958 16.2061 4.41904 16.5073 4.86783 16.6348C5.31662 16.7624 5.79774 16.7058 6.20472 16.4777V16.4777C6.60481 16.2442 7.08157 16.1803 7.52904 16.3C7.97652 16.4197 8.35761 16.7133 8.58763 17.1154C8.73845 17.3695 8.8195 17.6589 8.82257 17.9544V17.9544C8.82257 18.9229 9.60769 19.708 10.5762 19.708H11.7257C12.6909 19.708 13.4747 18.928 13.4793 17.9628V17.9628C13.4771 17.497 13.6611 17.0497 13.9905 16.7203C14.3198 16.391 14.7672 16.2069 15.2329 16.2092C15.5277 16.2171 15.816 16.2978 16.072 16.4441V16.4441C16.9087 16.9262 17.9777 16.6411 18.4633 15.8064V15.8064L19.0674 14.7996C19.3013 14.3982 19.3654 13.9202 19.2457 13.4713C19.1261 13.0225 18.8324 12.6399 18.4297 12.4083V12.4083C18.0271 12.1766 17.7334 11.794 17.6137 11.3452C17.494 10.8964 17.5582 10.4183 17.7921 10.017C17.9441 9.75146 18.1642 9.53133 18.4297 9.37927V9.37927C19.2594 8.89397 19.5439 7.83119 19.0674 6.99636V6.99636V6.98797Z"
                        stroke="#F1FAEE"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <ellipse
                        cx="11.1548"
                        cy="10.8989"
                        rx="2.41648"
                        ry="2.41648"
                        stroke="#F1FAEE"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                  Change passwords
                </Link>
              </li> */}
              <li>
                <Link to="/" className="menu-index-7" onClick={handleLogout}>
                  <LogOut size={20} />
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
