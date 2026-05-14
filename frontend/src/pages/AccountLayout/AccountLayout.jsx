import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AccountLayout.scss";
import { Link, Outlet, useLocation } from "react-router-dom";
import LogoutPopup from "../../components/LogoutPopup/LogoutPopup";
import userService from "../../services/userService";
import { useContext } from "react";
import { AppContext } from "../../App";
// toast
import { toast } from "react-toastify";
const AccountLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  const { setIsUserLogin } = useContext(AppContext);

  const [isOpenLogoutPopup, setIsOpenLogoutPopup] = useState(false);
  const handleToggleLogoutPopup = () => {
    setIsOpenLogoutPopup(!isOpenLogoutPopup);
  };

  const handleLogout = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpenLogoutPopup(false);
    try {
      await userService.logout();

      setIsUserLogin(false);
      toast.success("Logout successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error while logging out", error);
      toast.error("Logout failed!");
    }
  };
  return (
    <div className="account-layout">
      {isOpenLogoutPopup && (
        <LogoutPopup
          handleLogout={handleLogout}
          handleClose={handleToggleLogoutPopup}
        />
      )}
      <div className="layout-container">
        <div className="side-bar">
          <div className="general-profile">
            <Link to="/account/profile" className="avatar-profile-link">
              <div className="avatar">
                <div className="avatar-placeholder">
                  <img src="/assets/images/profile.png" alt="" />
                  {/* <svg
                    enable-background="new 0 0 15 15"
                    viewBox="0 0 15 15"
                    x="0"
                    y="0"
                    class="shopee-svg-icon icon-headshot"
                  >
                    <g>
                      <circle
                        cx="7.5"
                        cy="4.5"
                        fill="none"
                        r="3.8"
                        stroke-miterlimit="10"
                      ></circle>
                      <path
                        d="m1.5 14.2c0-3.3 2.7-6 6-6s6 2.7 6 6"
                        fill="none"
                        stroke-linecap="round"
                        stroke-miterlimit="10"
                      ></path>
                    </g>
                  </svg> */}
                </div>
              </div>
            </Link>
            <div className="account-layout-name">
              <p className="account-name">Trần Văn Điệp</p>
              <Link to="/account/profile" className="edit-profile-link">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.54 0L6.987 1.56l3.46 3.48L12 3.48M0 8.52l.073 3.428L3.46 12l6.21-6.18-3.46-3.48"
                    fill="#9B9B9B"
                    fill-rule="evenodd"
                  ></path>
                </svg>
                <span>Edit profile</span>
              </Link>
            </div>
          </div>
          <div className="navigation">
            <Link
              to="/account/profile"
              className={`navigation-item ${
                isActive("/account/profile") ? "active" : ""
              }`}
            >
              <div className="wrapper-icon">
                <img src="/assets/images/profile.png" alt="" />
              </div>
              <p className="navigation-name">Profile</p>
            </Link>
            <Link
              to="/account/delivery-address"
              className={`navigation-item ${
                isActive("/account/delivery-address") ? "active" : ""
              }`}
            >
              <div className="wrapper-icon">
                <img src="/assets/images/delivery.png" alt="" />
              </div>
              <p className="navigation-name">Delivery address</p>
            </Link>
            <Link
              to="/account/order?type=All"
              className={`navigation-item ${
                isActive("/account/order") ? "active" : ""
              }`}
            >
              <div className="wrapper-icon">
                <img src="/assets/images/order.png" alt="" />
              </div>
              <p className="navigation-name">Order</p>
            </Link>
            <Link
              to="/account/recover-password"
              className={`navigation-item ${
                isActive("/account/recover-password") ? "active" : ""
              }`}
            >
              <div className="wrapper-icon">
                <img src="/assets/images/change-password.png" alt="" />
              </div>
              <p className="navigation-name">Change password</p>
            </Link>

            <button
              className={`navigation-item`}
              style={{ width: "100%" }}
              onClick={handleToggleLogoutPopup}
            >
              <div className="wrapper-icon">
                <img src="/assets/images/logout-1.png" alt="" />
              </div>
              <p className="navigation-name">Logout</p>
            </button>
            {/* frontend\public\assets\images\logout-1.png */}
          </div>
        </div>
        <div className="layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
