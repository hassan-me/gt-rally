import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart2,
  FileText,
  Heart,
  MessageCircle,
  Star,
  User,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
} from "lucide-react";
import Nav from "./Nav";
import MobileNav from "./MobileNav";
import { selectUser, logout } from "../../redux/slices/user.slice";
import { getImage } from "@/utlis/helpers";

export default function Header4() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Get user info from Redux store
  const user = useSelector(selectUser);
  const isLoggedIn = user && user.id;

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="main-header">
      {/* Header Lower */}
      <div className="header-lower">
        <div className="container2">
          <div className="row">
            <div className="col-lg-12">
              <div className="inner-container flex justify-space align-center">
                {/* Logo Box */}
                <div className="logo-box flex">
                  <div className="logo">
                    <Link to="/">
                      <img
                        alt=""
                        width={225}
                        height={40}
                        src="/assets/images/logo/logo.png"
                      />
                    </Link>
                  </div>
                </div>
                <div className="nav-outer flex align-center">
                  {/* Main Menu */}
                  <nav className="main-menu show navbar-expand-md">
                    <div
                      className="navbar-collapse collapse clearfix"
                      id="navbarSupportedContent"
                    >
                      <ul className="navigation clearfix">
                        <Nav />
                      </ul>
                    </div>
                  </nav>
                  {/* Main Menu End*/}
                </div>
                <div className="header-account flex align-center">
                  {isLoggedIn ? (
                    <a
                      href="#"
                      className="box-avatar dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      <div className="avatar avt-40 round dashboard-header-profle">
                        {user.profileImage ? (
                          <img
                            alt="profile"
                            src={getImage(user.profileImage)}
                            width={80}
                            height={80}
                          />
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <p className="name">
                        {user.firstName || user.username}{" "}
                        <ChevronDown size={14} />
                      </p>
                    </a>
                  ) : (
                    <Link to="/login" className="box-avatar">
                      <div className="avatar avt-40 round dashboard-header-profle">
                        <User size={24} />
                      </div>
                      <p className="name">Login</p>
                    </Link>
                  )}

                  {isLoggedIn && (
                    <div className="dropdown-menu dashboard-menu mt-3">
                      <Link className="dropdown-item" to="/dashboard">
                        <BarChart2 size={20} />
                        Dashboard
                      </Link>
                      <Link className="dropdown-item" to="/my-listing">
                        <FileText size={20} />
                        My Listing
                      </Link>
                      <Link className="dropdown-item" to="/my-favorites">
                        <Heart size={20} />
                        My Favorites
                      </Link>
                      <Link className="dropdown-item" to="/message">
                        <MessageCircle size={20} />
                        Message
                      </Link>
                      <Link className="dropdown-item" to="/my-review">
                        <Star size={20} />
                        My Reviews
                      </Link>
                      <Link className="dropdown-item" to="/my-profile">
                        <User size={20} />
                        Profile
                      </Link>
                      <Link className="dropdown-item" to="/change-password">
                        <Settings size={20} />
                        Change passwords
                      </Link>
                      <a
                        className="dropdown-item"
                        href="#"
                        onClick={handleLogout}
                      >
                        <LogOut size={20} />
                        Logout
                      </a>
                    </div>
                  )}
                  <div className="flat-bt-top">
                    <Link className="sc-button" to="/add-listing">
                      <Plus size={20} />
                      <span>Add listing</span>
                    </Link>
                  </div>
                </div>
                <div
                  className="mobile-nav-toggler mobile-button"
                  onClick={() =>
                    document.body.classList.add("mobile-menu-visible")
                  }
                >
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Header Lower */}
      {/* Mobile Menu  */}
      <div
        className="close-btn"
        onClick={() => document.body.classList.remove("mobile-menu-visible")}
      >
        <span className="icon flaticon-cancel-1" />
      </div>
      <div className="mobile-menu">
        <div
          className="menu-backdrop"
          onClick={() => document.body.classList.remove("mobile-menu-visible")}
        />
        <nav className="menu-box">
          <div className="nav-logo">
            <Link to="/">
              <img
                alt=""
                width={197}
                height={48}
                src="/assets/images/logo/logo@2x.png"
              />
            </Link>
          </div>
          <div className="bottom-canvas">
            <div className="login-box flex align-center">
              <User size={20} />
              {isLoggedIn ? (
                <span className="fw-7 font-2">
                  {user.firstName || user.username}
                </span>
              ) : (
                <a
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#popup_bid"
                  className="fw-7 font-2"
                >
                  Login
                </a>
              )}
            </div>
            <MobileNav />
            <div className="button-mobi-sell">
              <Link className="sc-button btn-icon center" to="/add-listing">
                <Plus size={20} />
                <span>Add listing</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>
      {/* End Mobile Menu */}
    </header>
  );
}
