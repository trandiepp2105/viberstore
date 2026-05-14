import React, { useState, useEffect } from "react";
import "./OrderPage.scss";
import { Link, useLocation } from "react-router-dom";
import OrderItem from "../../components/OrderItem/OrderItem";
import orderService from "../../services/orderService";
// toastify
import { toast } from "react-toastify";
import AcceptancePopup from "../../components/AcceptancePopup/AcceptancePopup";

// navigate
import { useNavigate } from "react-router-dom";
const OrderPage = () => {
  const navigate = useNavigate();
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [sellectedOrderStatus, setSellectedOrderStatus] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isOpenCancelOrderPopup, setIsOpenCancelOrderPopup] = useState(false);
  const [isOpenDeleteOrderPopup, setIsOpenDeleteOrderPopup] = useState(false);
  const handleToggleCancelOrderPopup = () => {
    setIsOpenCancelOrderPopup(!isOpenCancelOrderPopup);
  };

  const handleToggleDeleteOrderPopup = () => {
    setIsOpenDeleteOrderPopup(!isOpenDeleteOrderPopup);
  };
  const location = useLocation();
  const currentType = new URLSearchParams(location.search).get("type");

  const getOrderStatus = async () => {
    try {
      const response = await orderService.getOrderStatus();
      console.log("Order Statuses:", response);
      setOrderStatuses(response);

      // Set sellectedOrderStatus based on URL
      const matchedStatus = response.find(
        (status) => status.status_name === currentType
      );
      setSellectedOrderStatus(matchedStatus || null);
    } catch (error) {
      console.error("Failed to fetch order statuses:", error);
    }
  };

  const getOrders = async () => {
    const params = sellectedOrderStatus
      ? { status: sellectedOrderStatus.id }
      : {};
    try {
      const response = await orderService.getOrders(params);
      console.log("Orders:", response);
      setOrders(response);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success("Order cancelled successfully!");
      // Navigate and update selected order status
      navigate("/account/order?type=Cancelled");
      const cancelledStatus = orderStatuses.find(
        (status) => status.status_name === "Cancelled"
      );
      setSellectedOrderStatus(cancelledStatus || null);
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      toast.success("Order deleted successfully!");
      // Optionally, refresh the orders after deletion
      getOrders();
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error("Failed to delete order. Please try again.");
    }
  };

  const [isOpenProcessOrderPopup, setIsOpenProcessOrderPopup] = useState(false);

  const handleToggleProcessOrderPopup = () => {
    setIsOpenProcessOrderPopup(!isOpenProcessOrderPopup);
  };

  const handleConfirmProcessOrder = async () => {
    try {
      await orderService.processOrder(selectedOrder.id);
      toast.success("Process order successfully");
      const deliveredStatus = orderStatuses.find(
        (status) => status.status_code === "DELIVERED"
      );

      setSellectedOrderStatus(deliveredStatus || null);
      handleToggleProcessOrderPopup();
      navigate("/account/order?type=Delivered");
      // fetchOrderDetail();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error deleting order");
    }
  };

  useEffect(() => {
    getOrderStatus();
    window.scrollTo(0, 0); // Scroll to the top of the page on component mount
  }, []);

  useEffect(() => {
    getOrders();
  }, [sellectedOrderStatus, location]);

  return (
    <div className="order-page">
      {isOpenCancelOrderPopup && (
        <AcceptancePopup
          handleClose={handleToggleCancelOrderPopup}
          description="Are you sure you want to cancel this order?"
          handleAccept={() => {
            handleCancelOrder(selectedOrder.id);
            handleToggleCancelOrderPopup();
          }}
        />
      )}
      {isOpenDeleteOrderPopup && (
        <AcceptancePopup
          handleClose={handleToggleDeleteOrderPopup}
          description="Are you sure you want to delete this order?"
          handleAccept={() => {
            handleDeleteOrder(selectedOrder.id);
            handleToggleDeleteOrderPopup();
          }}
        />
      )}

      {isOpenProcessOrderPopup && (
        <AcceptancePopup
          handleClose={handleToggleProcessOrderPopup}
          mainBtnText="Confirm"
          description="Confirm that you have received your order and paid in full"
          handleAccept={() => {
            handleConfirmProcessOrder(selectedOrder.id);
            handleToggleProcessOrderPopup();
          }}
        />
      )}
      <div className="filter-status-bar">
        <>
          <Link
            to={`/account/order?type=All`}
            className={`filter-status-link ${
              currentType === "All" ? "active" : ""
            }`}
            onClick={() => setSellectedOrderStatus(null)}
          >
            All
          </Link>
          {orderStatuses?.map((status) => (
            <Link
              key={status.id}
              to={`/account/order?type=${status.status_name}`}
              className={`filter-status-link ${
                currentType === status.status_name ? "active" : ""
              }`}
              onClick={() => setSellectedOrderStatus(status)}
            >
              {status.status_name}
            </Link>
          ))}
        </>
      </div>
      {orders?.length !== 0 && (
        <div className="search-bar">
          <svg width="19px" height="19px" viewBox="0 0 19 19">
            <g id="Search-New" stroke-width="1" fill="none" fill-rule="evenodd">
              <g
                id="my-purchase-copy-27"
                transform="translate(-399.000000, -221.000000)"
                stroke-width="2"
              >
                <g id="Group-32" transform="translate(400.000000, 222.000000)">
                  <circle id="Oval-27" cx="7" cy="7" r="7"></circle>
                  <path
                    d="M12,12 L16.9799555,16.919354"
                    id="Path-184"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
          <input type="text" placeholder="Search order" />
        </div>
      )}
      <div className="order-list">
        {orders?.length !== 0 ? (
          orders?.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              orderStatuses={orderStatuses}
              setSelectedOrder={setSelectedOrder}
              handleToggleCancelOrderPopup={handleToggleCancelOrderPopup}
              handleToggleDeleteOrderPopup={handleToggleDeleteOrderPopup}
              handleToggleProcessOrderPopup={handleToggleProcessOrderPopup}
            />
          ))
        ) : (
          <div className="empty-order">
            <div className="empty-order-inner">
              <img
                className="empty-order-image"
                src="/assets/images/empty-order.png"
                alt=""
              />
              <p>There are no orders at the moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
