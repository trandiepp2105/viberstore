import React, { useRef, useEffect, useState } from "react";
import "./UserInformationPage.scss";
import { Link, useParams } from "react-router-dom"; // Added useParams
import userService from "../../services/userService";
import shippingInfoService from "../../services/shippingInfoService";
const UserInformationPage = () => {
  const { id } = useParams(); // Extract id from URL
  const [userInfo, setUserInfo] = useState({});
  const [shippingInfo, setShippingInfo] = useState([]);
  const [orders, setOrders] = useState([]);
  const fetchUserInfo = async () => {
    try {
      const data = await userService.getUserById(id);
      setUserInfo(data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };
  const fetchShippingInfo = async () => {
    try {
      const data = await shippingInfoService.getShippingInfo(id);
      setShippingInfo(data);
    } catch (error) {
      console.error("Error fetching shipping info:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    fetchShippingInfo();
  }, [id]);
  return (
    <div className="category-detail-page">
      <div className="page-content">
        <div className="header">
          <div className="left-side">
            <div className="title">
              <Link to="/users" className="back-link">
                Users
              </Link>
              <span>
                <svg
                  width="25px"
                  height="25px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M10 7L15 12L10 17"
                      stroke="#5a5858"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </g>
                </svg>
              </span>
              <p className="user-email">user1@gmail.com</p>
            </div>
          </div>
        </div>
        <div className="user-info">
          <div className="user-info-item">
            <div className="user-info-item-title">
              <p>Persional Information</p>
              <button className="edit-btn disabled">
                Edit{" "}
                <svg
                  width="15px"
                  height="15px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M4 22H8M20 22H12"
                      stroke="#fff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M13.8881 3.66293L14.6296 2.92142C15.8581 1.69286 17.85 1.69286 19.0786 2.92142C20.3071 4.14999 20.3071 6.14188 19.0786 7.37044L18.3371 8.11195M13.8881 3.66293C13.8881 3.66293 13.9807 5.23862 15.3711 6.62894C16.7614 8.01926 18.3371 8.11195 18.3371 8.11195M13.8881 3.66293L7.07106 10.4799C6.60933 10.9416 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.25745 16.2417M18.3371 8.11195L14.9286 11.5204M11.5201 14.9289C11.0584 15.3907 10.8275 15.6215 10.5729 15.8201C10.2727 16.0543 9.94775 16.2551 9.60398 16.4189C9.31256 16.5578 9.00282 16.6611 8.38334 16.8675L5.75834 17.7426M5.75834 17.7426L5.11667 17.9564C4.81182 18.0581 4.47573 17.9787 4.2485 17.7515C4.02128 17.5243 3.94194 17.1882 4.04356 16.8833L4.25745 16.2417M5.75834 17.7426L4.25745 16.2417"
                      stroke="#fff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                  </g>
                </svg>
              </button>
            </div>
            <div className="user-info-item-content">
              <div className="subinfo-item">
                <p className="title">Name</p>
                <p className="value">{userInfo?.name}</p>
              </div>
              <div className="subinfo-item">
                <p className="title">Email Address</p>
                <p className="value">{userInfo?.email}</p>
              </div>
              <div className="subinfo-item">
                <p className="title">Phone Number</p>
                <p className="value">{userInfo?.phone_number}</p>
              </div>
              <div className="subinfo-item">
                <p className="title">Account status</p>
                <p className="value">
                  {userInfo?.active ? "active" : "inactive"}
                </p>
              </div>
              <div className="subinfo-item">
                <p className="title">Joining Date</p>
                <p className="value">{userInfo?.join_date}</p>
              </div>
              <div className="subinfo-item"></div>
            </div>
          </div>

          <div className="user-info-item">
            <div className="user-info-item-title">
              <p>Shipping Infomation</p>
              <button className="edit-btn disabled">
                Edit{" "}
                <svg
                  width="15px"
                  height="15px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M4 22H8M20 22H12"
                      stroke="#fff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                    <path
                      d="M13.8881 3.66293L14.6296 2.92142C15.8581 1.69286 17.85 1.69286 19.0786 2.92142C20.3071 4.14999 20.3071 6.14188 19.0786 7.37044L18.3371 8.11195M13.8881 3.66293C13.8881 3.66293 13.9807 5.23862 15.3711 6.62894C16.7614 8.01926 18.3371 8.11195 18.3371 8.11195M13.8881 3.66293L7.07106 10.4799C6.60933 10.9416 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.25745 16.2417M18.3371 8.11195L14.9286 11.5204M11.5201 14.9289C11.0584 15.3907 10.8275 15.6215 10.5729 15.8201C10.2727 16.0543 9.94775 16.2551 9.60398 16.4189C9.31256 16.5578 9.00282 16.6611 8.38334 16.8675L5.75834 17.7426M5.75834 17.7426L5.11667 17.9564C4.81182 18.0581 4.47573 17.9787 4.2485 17.7515C4.02128 17.5243 3.94194 17.1882 4.04356 16.8833L4.25745 16.2417M5.75834 17.7426L4.25745 16.2417"
                      stroke="#fff"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />{" "}
                  </g>
                </svg>
              </button>
            </div>
            <div className="user-info-item-content list-shipping-info">
              {shippingInfo.map((info, index) => (
                <div className="shipping-info-item">
                  <div className="subinfo-item">
                    <p className="title">Consignee</p>
                    <p className="value">{info?.recipient_name}</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Phone Number</p>
                    <p className="value">{info?.phone_number}</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Default</p>
                    <p className="value">
                      {info?.is_default ? "True" : "False"}
                    </p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Province / City</p>
                    <p className="value">{info?.province_city}</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">District</p>
                    <p className="value">{info?.district}</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Dard / Commune</p>
                    <p className="value">{info?.ward_commune}</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Specific Address</p>
                    <p className="value">{info?.specific_address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="user-info-item">
            <div className="user-info-item-title">
              <p>Orders</p>
            </div>
            <div className="user-info-item-content list-order-info">
              {orders.map((order, index) => (
                <div className="order-info-item">
                  <button className="edit-btn">
                    Edit{" "}
                    <svg
                      width="15px"
                      height="15px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0" />

                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />

                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M4 22H8M20 22H12"
                          stroke="#fff"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />{" "}
                        <path
                          d="M13.8881 3.66293L14.6296 2.92142C15.8581 1.69286 17.85 1.69286 19.0786 2.92142C20.3071 4.14999 20.3071 6.14188 19.0786 7.37044L18.3371 8.11195M13.8881 3.66293C13.8881 3.66293 13.9807 5.23862 15.3711 6.62894C16.7614 8.01926 18.3371 8.11195 18.3371 8.11195M13.8881 3.66293L7.07106 10.4799C6.60933 10.9416 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.25745 16.2417M18.3371 8.11195L14.9286 11.5204M11.5201 14.9289C11.0584 15.3907 10.8275 15.6215 10.5729 15.8201C10.2727 16.0543 9.94775 16.2551 9.60398 16.4189C9.31256 16.5578 9.00282 16.6611 8.38334 16.8675L5.75834 17.7426M5.75834 17.7426L5.11667 17.9564C4.81182 18.0581 4.47573 17.9787 4.2485 17.7515C4.02128 17.5243 3.94194 17.1882 4.04356 16.8833L4.25745 16.2417M5.75834 17.7426L4.25745 16.2417"
                          stroke="#fff"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />{" "}
                      </g>
                    </svg>
                  </button>
                  <div className="subinfo-item">
                    <p className="title">Order Date</p>
                    <p className="value">30/03/2025</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Total Order</p>
                    <p className="value">20.000.000 đ</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Status</p>
                    <p className="value">Delivered</p>
                  </div>
                  <div className="subinfo-item">
                    <p className="title">Item quantity</p>
                    <p className="value">5 items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInformationPage;
