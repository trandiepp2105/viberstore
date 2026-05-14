import React from "react";
import "./OrderItem.scss";
import formatCurrencyVN from "../../utils/formatCurrencyVN";
import orderService from "../../services/orderService";
const OrderItem = ({
  order,
  orderStatuses,
  setSelectedOrder,
  handleToggleCancelOrderPopup,
  handleToggleDeleteOrderPopup,
  handleToggleProcessOrderPopup,
}) => {
  const currentStatus = orderStatuses.find(
    (status) => status.id === order.current_status_details.id
  );

  const getStatusMessage = (statusCode) => {
    switch (statusCode) {
      case "PENDING":
        return "Order is being processed";
      case "PACKED":
        return "Order has been packed, waiting for shipment";
      case "DELIVERING":
        return "Order is in transit";
      case "DELIVERED":
        return "Order has been successfully delivered";
      case "CANCELLED":
        return "Order has been canceled";
      case "RETURNED":
        return "Order has been returned";
      case "REFUNDED":
        return "Order has been refunded";
      default:
        return "Unknown status";
    }
  };

  return (
    <div className="order-item">
      <div className="order-item-inner">
        <div className="order-status-display">
          <div
            className={`order-status ${currentStatus?.status_code?.toLowerCase()}-status`}
          >
            <svg
              enable-background="new 0 0 15 15"
              viewBox="0 0 15 15"
              x="0"
              y="0"
              className="shopee-svg-icon icon-free-shipping-line"
            >
              <g>
                <line
                  fill="none"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                  x1="8.6"
                  x2="4.2"
                  y1="9.8"
                  y2="9.8"
                ></line>
                <circle
                  cx="3"
                  cy="11.2"
                  fill="none"
                  r="2"
                  stroke-miterlimit="10"
                ></circle>
                <circle
                  cx="10"
                  cy="11.2"
                  fill="none"
                  r="2"
                  stroke-miterlimit="10"
                ></circle>
                <line
                  fill="none"
                  stroke-miterlimit="10"
                  x1="10.5"
                  x2="14.4"
                  y1="7.3"
                  y2="7.3"
                ></line>
                <polyline
                  fill="none"
                  points="1.5 9.8 .5 9.8 .5 1.8 10 1.8 10 9.1"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                ></polyline>
                <polyline
                  fill="none"
                  points="9.9 3.8 14 3.8 14.5 10.2 11.9 10.2"
                  stroke-linejoin="round"
                  stroke-miterlimit="10"
                ></polyline>
              </g>
            </svg>
            {getStatusMessage(currentStatus?.status_code)}
          </div>
        </div>
        <div className="list-product">
          {order?.order_items?.map((item) => (
            <div className="product-item">
              <img
                src={item?.variant_image}
                alt="Product"
                className="product-image"
              />
              <div className="product-info">
                <div className="left-side">
                  <p className="product-variant">
                    {item?.variant_details?.product_details?.name +
                      " - " +
                      item?.variant_details?.color_details?.name.toLowerCase() +
                      " - size: " +
                      item?.variant_details?.size_details?.name}
                  </p>
                  <p className="product-quantity">Quantity: {item?.quantity}</p>
                </div>
                <div className="right-side">
                  {item?.sale_price_at_purchase !== 0 &&
                    item?.sale_price_at_purchase !==
                      item?.price_at_purchase && (
                      <del>
                        {formatCurrencyVN(item?.sale_price_at_purchase)}
                      </del>
                    )}
                  <p className="product-price">
                    {formatCurrencyVN(item?.price_at_purchase || 0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="total-amount">
          Total amount: <span>{formatCurrencyVN(order.final_amount)}</span>
        </div>
        <div className="order-process-services">
          {(currentStatus?.status_code === "PENDING" ||
            currentStatus?.status_code === "PACKED") && (
            <button
              className="order-process-btn cancel-order-btn main"
              onClick={() => {
                setSelectedOrder(order);
                handleToggleCancelOrderPopup();
              }}
            >
              Cancel
            </button>
          )}
          {currentStatus?.status_code === "DELIVERED" && (
            <>
              <button className="order-process-btn return-order-btn">
                Return / Refund request
              </button>
              <button className="order-process-btn feedback-order-btn">
                Feedback
              </button>
              <button className="order-process-btn re-order-btn">
                Repurchase
              </button>
            </>
          )}
          {currentStatus?.status_code === "DELIVERING" && (
            <>
              <button
                className="order-process-btn confirm-delivered-btn main"
                onClick={() => {
                  setSelectedOrder(order);
                  handleToggleProcessOrderPopup();
                }}
              >
                Mark as Delivered
              </button>
            </>
          )}
          {currentStatus?.status_code === "CANCELLED" && (
            <>
              <button
                className="order-process-btn delete-order-btn main"
                onClick={() => {
                  setSelectedOrder(order);
                  handleToggleDeleteOrderPopup();
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItem;
