import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import "./OrderDetailPage.scss";
import CartItem from "../../components/CartItem/CartItem";
import PopupEditOrderInfo from "../../components/PopupEditOrderInfo/PopupEditOrderInfo";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";
import orderService from "../../services/orderService";
// navigate
import { useNavigate } from "react-router-dom"; // Import useNavigate
import formatCurrencyVN from "../../utils/formatCurrencyVN";
// toastify
import { toast } from "react-toastify";
import { format } from "date-fns"; // Import date-fns for formatting
import { vi } from "date-fns/locale"; // Import Vietnamese locale for date-fns

const OrderDetailPage = () => {
  const { id } = useParams(); // Extract id from URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [showListOrderItem, setShowListOrderItem] = useState(true);
  const [showInvoice, setShowInvoice] = useState(true);
  const [showHistoryOrderStatus, setShowHistoryOrderStatus] = useState(true);
  const [orderDetail, setOrderDetail] = useState({});
  const [orderHistory, setOrderHistory] = useState([]);

  const getOrderHistory = async () => {
    try {
      const response = await orderService.getOrderHistory(id);
      if (response) {
        setOrderHistory(response);
      }
      console.log("Order history:", response);
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  const fetchOrderDetail = async () => {
    try {
      const response = await orderService.getOrder(id);
      if (response) {
        setOrderDetail(response);
      }
      console.log("Order detail:", response);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    }
  };

  // Fetch order detail when the component mounts
  useEffect(() => {
    fetchOrderDetail();
    getOrderHistory();
  }, [id]);

  const toggleListOrderItem = () => {
    setShowListOrderItem(!showListOrderItem);
  };
  const toggleInvoice = () => {
    setShowInvoice(!showInvoice);
  };
  const toggleHistoryOrderStatus = () => {
    setShowHistoryOrderStatus(!showHistoryOrderStatus);
  };

  const [isOpenEditOrderInfoPopup, setIsOpenEditOrderInfoPopup] =
    useState(false);

  const handleToggleEditOrderInfoPopup = () => {
    setIsOpenEditOrderInfoPopup(!isOpenEditOrderInfoPopup);
  };

  const [isOpenCancelOrderPopup, setIsOpenCancelOrderPopup] = useState(false);

  const handleToggleCancelOrderPopup = () => {
    setIsOpenCancelOrderPopup(!isOpenCancelOrderPopup);
  };

  const handleConfirmCancelOrder = async () => {
    try {
      await orderService.cancelOrder(id);
      toast.success("Cancel order successfully");
      navigate("/orders");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    }
  };

  const [isOpenDeleteOrderPopup, setIsOpenDeleteOrderPopup] = useState(false);

  const handleToggleDeleteOrderPopup = () => {
    setIsOpenDeleteOrderPopup(!isOpenDeleteOrderPopup);
  };

  const handleConfirmDeleteOrder = async () => {
    try {
      await orderService.deleteOrder(id);
      toast.success("Delete order successfully");
      navigate("/orders");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    }
  };

  const [isOpenProcessOrderPopup, setIsOpenProcessOrderPopup] = useState(false);

  const handleToggleProcessOrderPopup = () => {
    setIsOpenProcessOrderPopup(!isOpenProcessOrderPopup);
  };

  const handleConfirmProcessOrder = async () => {
    try {
      await orderService.processOrder(id);
      toast.success("Process order successfully");
      handleToggleProcessOrderPopup();
      getOrderHistory();
      fetchOrderDetail();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    }
  };
  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy, hh:mm a", { locale: vi });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp;
    }
  };

  return (
    <div className="page order-detail-page">
      {isOpenEditOrderInfoPopup && (
        <PopupEditOrderInfo
          orderInfor={orderDetail.shipping_info}
          handleToggle={handleToggleEditOrderInfoPopup}
          fetchParentData={fetchOrderDetail}
        />
      )}
      {isOpenCancelOrderPopup && (
        <AcceptancePopup
          description="Are you sure you want to cancel this order?"
          acceptBtnText="Cancel"
          handleClose={handleToggleCancelOrderPopup}
          handleAccept={handleConfirmCancelOrder}
        />
      )}

      {isOpenDeleteOrderPopup && (
        <AcceptancePopup
          description="Are you sure you want to delete this order?"
          acceptBtnText="Delete"
          handleClose={handleToggleDeleteOrderPopup}
          handleAccept={handleConfirmDeleteOrder}
        />
      )}

      {isOpenProcessOrderPopup && (
        <AcceptancePopup
          description="Are you sure you want to process this order?"
          acceptBtnText="Confirm"
          handleClose={handleToggleProcessOrderPopup}
          handleAccept={handleConfirmProcessOrder}
        />
      )}
      <div className="page-content">
        <div className="header">
          <div className="left-side">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0" />

                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <g id="SVGRepo_iconCarrier">
                  <path
                    fill="#000000"
                    d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
                  />

                  <path
                    fill="#000000"
                    d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                  />
                </g>
              </svg>
            </button>
            <div className="title">
              <h5 className="back-description">Back to list</h5>
              <div className="order-summmary-info">
                <h2>Order ID: {id}</h2> {/* Display the extracted id */}
                <div className="list-status">
                  <span className="status-item order-status">
                    {orderDetail?.current_status_details?.status_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="right-side">
            {(orderDetail?.current_status_details?.status_code === "PENDING" ||
              orderDetail?.current_status_details?.status_code ===
                "PACKED") && (
              <button
                className="confirm-btn"
                onClick={handleToggleProcessOrderPopup}
              >
                {orderDetail?.current_status_details?.status_code === "PENDING"
                  ? "Mark as Packed"
                  : "Courier Received"}
              </button>
            )}
            {(orderDetail?.current_status_details?.status_code === "PENDING" ||
              orderDetail?.current_status_details?.status_code ===
                "PACKED") && (
              <button
                className="delete-btn"
                onClick={handleToggleCancelOrderPopup}
              >
                CANCEL
              </button>
            )}
            {orderDetail?.current_status_details?.status_code ===
              "CANCELLED" && (
              <button
                className="delete-btn"
                onClick={handleToggleDeleteOrderPopup}
              >
                DELETE
              </button>
            )}
          </div>
        </div>
        <div className="wrapper-order-info">
          <div className="left-side">
            <div className="wrapper-info-item wrapper-order-item">
              <h4 className="container-title">
                Order Items
                <button
                  className="hidden-order-item-btn"
                  onClick={toggleListOrderItem}
                >
                  <svg
                    width="25px"
                    height="25px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`hidden-order-item-icon ${
                      showListOrderItem ? "rotate" : ""
                    }`}
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
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                        fill="#878282"
                      />{" "}
                    </g>
                  </svg>
                </button>
              </h4>
              {orderDetail?.order_items && (
                <div className="list-order-item">
                  {orderDetail?.order_items.map((item, index) => (
                    <CartItem key={index} orderItem={item} />
                  ))}
                </div>
              )}
            </div>
            <div className="wrapper-info-item wrapper-order-summary">
              <h4 className="container-title">
                Order Summary
                <button
                  className="hidden-order-item-btn"
                  onClick={toggleInvoice}
                >
                  <svg
                    width="25px"
                    height="25px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`hidden-order-item-icon ${
                      showInvoice ? "rotate" : ""
                    }`}
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
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                        fill="#878282"
                      />{" "}
                    </g>
                  </svg>
                </button>
              </h4>
              <div className="list-status">
                <span className="status-item order-status">
                  {orderDetail?.current_status_details?.status_name}
                </span>
              </div>
              {showInvoice && (
                <div className="invoice">
                  <div className="list-invoice-item">
                    <div className="invoice-item">
                      <div className="general-info">
                        <div className="invoice-item__name">
                          <p>Subtotal</p>
                        </div>
                        <div className="invoice-item__description">
                          <p>{}</p>
                        </div>
                        <div className="invoice-item__value">
                          {formatCurrencyVN(orderDetail.total_amount)}
                        </div>
                      </div>
                    </div>
                    <div className="invoice-item discount">
                      <div className="general-info">
                        <div className="invoice-item__name">
                          <p>Total Discount</p>
                        </div>
                        <div className="invoice-item__description">
                          {/* <p>2 Vouchers</p> */}
                        </div>
                        <div className="invoice-item__value">
                          {formatCurrencyVN(
                            orderDetail.total_amount - orderDetail.final_amount
                          )}
                        </div>
                      </div>
                      {/* <div className="detail-discount">
                        <div className="discount-item">
                          <div className="discount-item__name">Sale</div>
                          <div className="discount-item__value">0 đ</div>
                        </div>
                        <div className="discount-item">
                          <div className="discount-item__name">
                            New Customer
                          </div>
                          <div className="discount-item__value">0 đ</div>
                        </div>
                      </div> */}
                    </div>
                    <div className="invoice-item">
                      <div className="general-info">
                        <div className="invoice-item__name">
                          <p>Shipping</p>
                        </div>
                        <div className="invoice-item__description">
                          <p>Free Shipping</p>
                        </div>
                        <div className="invoice-item__value">0 đ</div>
                      </div>
                    </div>
                    <div className="invoice-item total">
                      <div className="general-info">
                        <div className="invoice-item__name">
                          <p>Total</p>
                        </div>

                        <div className="invoice-item__value">
                          {formatCurrencyVN(orderDetail.final_amount)}
                        </div>
                      </div>
                    </div>
                    <div className="invoice-item paid-by-customer">
                      <div className="general-info">
                        <div className="invoice-item__name">
                          <p>Paid by customer</p>
                        </div>
                        <div className="invoice-item__description">
                          <p>{orderDetail?.payment_method_details?.code}</p>
                        </div>
                        <div className="invoice-item__value">0 đ</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="wrapper-info-item wrapper-history-order-status">
              <h4 className="container-title">
                History
                <button
                  className="hidden-order-item-btn"
                  onClick={toggleHistoryOrderStatus}
                >
                  <svg
                    width="25px"
                    height="25px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`hidden-order-item-icon ${
                      showHistoryOrderStatus ? "rotate" : ""
                    }`}
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
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12.7071 14.7071C12.3166 15.0976 11.6834 15.0976 11.2929 14.7071L6.29289 9.70711C5.90237 9.31658 5.90237 8.68342 6.29289 8.29289C6.68342 7.90237 7.31658 7.90237 7.70711 8.29289L12 12.5858L16.2929 8.29289C16.6834 7.90237 17.3166 7.90237 17.7071 8.29289C18.0976 8.68342 18.0976 9.31658 17.7071 9.70711L12.7071 14.7071Z"
                        fill="#878282"
                      />{" "}
                    </g>
                  </svg>
                </button>
              </h4>
              {showHistoryOrderStatus && (
                <div className="wrapper-order-status-history">
                  {orderHistory?.map((item, index) => (
                    <div className="order-status-history-item" key={index}>
                      <p className="order-status-name">
                        Order {item?.status_details?.status_name}
                      </p>
                      <span className="timestamp">
                        {formatTimestamp(item?.changed_at)}
                      </span>
                      <div className="responsible-staff">
                        <div className="staff-name">
                          Responsible staff:{" "}
                          <span>{item?.staff_in_charge_details?.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="right-side">
            <div className="container">
              <div className="order-detail-item">
                <div className="order-detail-item__title">
                  <p>Staff Notes</p>
                  <button
                    className="edit-btn"
                    onClick={handleToggleEditOrderInfoPopup}
                  >
                    <svg
                      width="20px"
                      height="20px"
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
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />{" "}
                        <path
                          d="M13.8881 3.66293L14.6296 2.92142C15.8581 1.69286 17.85 1.69286 19.0786 2.92142C20.3071 4.14999 20.3071 6.14188 19.0786 7.37044L18.3371 8.11195M13.8881 3.66293C13.8881 3.66293 13.9807 5.23862 15.3711 6.62894C16.7614 8.01926 18.3371 8.11195 18.3371 8.11195M13.8881 3.66293L7.07106 10.4799C6.60933 10.9416 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.25745 16.2417M18.3371 8.11195L14.9286 11.5204M11.5201 14.9289C11.0584 15.3907 10.8275 15.6215 10.5729 15.8201C10.2727 16.0543 9.94775 16.2551 9.60398 16.4189C9.31256 16.5578 9.00282 16.6611 8.38334 16.8675L5.75834 17.7426M5.75834 17.7426L5.11667 17.9564C4.81182 18.0581 4.47573 17.9787 4.2485 17.7515C4.02128 17.5243 3.94194 17.1882 4.04356 16.8833L4.25745 16.2417M5.75834 17.7426L4.25745 16.2417"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />{" "}
                      </g>
                    </svg>
                  </button>
                </div>
                <div className="order-detail-item__content">
                  <div className="info-item">
                    <p>Here are user notes on the order</p>
                  </div>
                </div>
              </div>
              <div className="order-detail-item">
                <div className="order-detail-item__title">
                  <p>Customer Notes</p>
                  <button
                    className="edit-btn"
                    onClick={handleToggleEditOrderInfoPopup}
                  >
                    <svg
                      width="20px"
                      height="20px"
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
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />{" "}
                        <path
                          d="M13.8881 3.66293L14.6296 2.92142C15.8581 1.69286 17.85 1.69286 19.0786 2.92142C20.3071 4.14999 20.3071 6.14188 19.0786 7.37044L18.3371 8.11195M13.8881 3.66293C13.8881 3.66293 13.9807 5.23862 15.3711 6.62894C16.7614 8.01926 18.3371 8.11195 18.3371 8.11195M13.8881 3.66293L7.07106 10.4799C6.60933 10.9416 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.25745 16.2417M18.3371 8.11195L14.9286 11.5204M11.5201 14.9289C11.0584 15.3907 10.8275 15.6215 10.5729 15.8201C10.2727 16.0543 9.94775 16.2551 9.60398 16.4189C9.31256 16.5578 9.00282 16.6611 8.38334 16.8675L5.75834 17.7426M5.75834 17.7426L5.11667 17.9564C4.81182 18.0581 4.47573 17.9787 4.2485 17.7515C4.02128 17.5243 3.94194 17.1882 4.04356 16.8833L4.25745 16.2417M5.75834 17.7426L4.25745 16.2417"
                          stroke="#1C274C"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />{" "}
                      </g>
                    </svg>
                  </button>
                </div>
                <div className="order-detail-item__content">
                  <div className="info-item">
                    <p>Here are user notes on the order</p>
                  </div>
                </div>
              </div>

              {orderDetail?.delivery_address && (
                <div className="order-detail-item">
                  <div className="order-detail-item__title">
                    <p>Delivery information</p>
                    <button
                      className="edit-btn"
                      onClick={handleToggleEditOrderInfoPopup}
                    >
                      <svg
                        width="20px"
                        height="20px"
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
                            stroke="#1C274C"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />{" "}
                          <path
                            d="M13.8881 3.66293L14.6296 2.92142C15.8581 1.69286 17.85 1.69286 19.0786 2.92142C20.3071 4.14999 20.3071 6.14188 19.0786 7.37044L18.3371 8.11195M13.8881 3.66293C13.8881 3.66293 13.9807 5.23862 15.3711 6.62894C16.7614 8.01926 18.3371 8.11195 18.3371 8.11195M13.8881 3.66293L7.07106 10.4799C6.60933 10.9416 6.37846 11.1725 6.17992 11.4271C5.94571 11.7273 5.74491 12.0522 5.58107 12.396C5.44219 12.6874 5.33894 12.9972 5.13245 13.6167L4.25745 16.2417M18.3371 8.11195L14.9286 11.5204M11.5201 14.9289C11.0584 15.3907 10.8275 15.6215 10.5729 15.8201C10.2727 16.0543 9.94775 16.2551 9.60398 16.4189C9.31256 16.5578 9.00282 16.6611 8.38334 16.8675L5.75834 17.7426M5.75834 17.7426L5.11667 17.9564C4.81182 18.0581 4.47573 17.9787 4.2485 17.7515C4.02128 17.5243 3.94194 17.1882 4.04356 16.8833L4.25745 16.2417M5.75834 17.7426L4.25745 16.2417"
                            stroke="#1C274C"
                            stroke-width="1.5"
                            stroke-linecap="round"
                          />{" "}
                        </g>
                      </svg>
                    </button>
                  </div>
                  <div className="order-detail-item__content">
                    <div className="info-item">
                      <svg
                        width="10px"
                        height="10px"
                        viewBox="0 0 64 64"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke-width="3"
                        stroke="#000000"
                        fill="none"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0" />

                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />

                        <g id="SVGRepo_iconCarrier">
                          <circle cx="32" cy="18.14" r="11.14" />

                          <path d="M54.55,56.85A22.55,22.55,0,0,0,32,34.3h0A22.55,22.55,0,0,0,9.45,56.85Z" />
                        </g>
                      </svg>
                      <p>
                        {orderDetail?.delivery_address_details?.recipient_name}
                      </p>
                    </div>
                    <div className="info-item">
                      <svg
                        width="10px"
                        height="10px"
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
                            d="M5.13641 12.764L8.15456 9.08664C8.46255 8.69065 8.61655 8.49264 8.69726 8.27058C8.76867 8.07409 8.79821 7.86484 8.784 7.65625C8.76793 7.42053 8.67477 7.18763 8.48846 6.72184L7.77776 4.9451C7.50204 4.25579 7.36417 3.91113 7.12635 3.68522C6.91678 3.48615 6.65417 3.35188 6.37009 3.29854C6.0477 3.238 5.68758 3.32804 4.96733 3.5081L3 4C3 14 9.99969 21 20 21L20.4916 19.0324C20.6717 18.3121 20.7617 17.952 20.7012 17.6296C20.6478 17.3456 20.5136 17.0829 20.3145 16.8734C20.0886 16.6355 19.7439 16.4977 19.0546 16.222L17.4691 15.5877C16.9377 15.3752 16.672 15.2689 16.4071 15.2608C16.1729 15.2536 15.9404 15.3013 15.728 15.4001C15.4877 15.512 15.2854 15.7143 14.8807 16.119L11.8274 19.1733M12.9997 7C13.9765 7.19057 14.8741 7.66826 15.5778 8.37194C16.2815 9.07561 16.7592 9.97326 16.9497 10.95M12.9997 3C15.029 3.22544 16.9213 4.13417 18.366 5.57701C19.8106 7.01984 20.7217 8.91101 20.9497 10.94"
                            stroke="#000000"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />{" "}
                        </g>
                      </svg>
                      <p>
                        {orderDetail?.delivery_address_details?.phone_number}
                      </p>
                    </div>
                    <div className="info-item">
                      <p>
                        {
                          orderDetail?.delivery_address_details
                            ?.ward_commune_details?.name
                        }
                      </p>
                    </div>
                    <div className="info-item">
                      <p>
                        {
                          orderDetail?.delivery_address_details
                            ?.district_details?.name
                        }
                      </p>
                    </div>
                    <div className="info-item">
                      <p>
                        {
                          orderDetail?.delivery_address_details
                            ?.province_city_details?.name
                        }
                      </p>
                    </div>
                    <div className="info-item">
                      <p>
                        {
                          orderDetail?.delivery_address_details
                            ?.specific_address
                        }
                      </p>
                    </div>
                    <div className="info-item info-item--map">
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
                            d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
                            stroke="#728ce1"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />{" "}
                        </g>
                      </svg>
                      <p>View map</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
