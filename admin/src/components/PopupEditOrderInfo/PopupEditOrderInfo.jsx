import React, { useState } from "react";
import "./PopupEditOrderInfo.scss";
import shippingInfoService from "../../services/shippingInfoService";

// toastify
import { toast } from "react-toastify";
const PopupEditOrderInfo = ({
  handleToggle,
  orderInfor = {},
  orderInfoName = "customer info",
  fetchParentData,
}) => {
  const [orderInforTemp, setOrderInforTemp] = useState(orderInfor);

  const handleChange = (e, key) => {
    setOrderInforTemp((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await shippingInfoService.updateShippingInfo(
        orderInforTemp.id,
        orderInforTemp
      );
      if (response) {
        toast.success("Update shipping info successfully");
      }
      fetchParentData();
      handleToggle();
    } catch (error) {
      toast.error("Error updating shipping info");
    }
  };

  return (
    <div className="update-shipping-popup">
      <div className="container">
        <form className="shipping-popup" onSubmit={handleSubmit}>
          <h3 className="title">Edit {orderInfoName}</h3>
          <div className="popup-content">
            {Object.entries(orderInforTemp)
              .filter(([key]) => key !== "id" && key !== "is_default") // Exclude "id" and "is_default"
              .map(([key, value]) => {
                const formattedKey = key
                  .replace(/_/g, " ") // Replace underscores with spaces
                  .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
                return (
                  <div className="input-container" key={key}>
                    <p className="input-title">{formattedKey}</p>
                    <input
                      type="text"
                      className="input-text"
                      value={value}
                      onChange={(e) => handleChange(e, key)}
                    />
                  </div>
                );
              })}
          </div>

          {/* Buttons */}
          <div className="popup-service">
            <button
              type="button"
              className="popup-btn cancel-btn"
              onClick={handleToggle}
            >
              Cancel
            </button>
            <button type="submit" className="popup-btn save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupEditOrderInfo;
