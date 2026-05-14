import React, { useState } from "react";
import "./PopupCreate.scss";

const PopupCreate = ({
  popupName = "shipping info",
  initData = {
    recipient_name: "Recipient name",
    phone_number: "Phone number",
    province_city: "Province / City",
    district: "District",
    ward_commune: "Ward / Commune",
    specific_address: "Specific address",
  }, // Default to an empty object to avoid errors
  handleToggle,
  width = 500,
  handleSubmit,
}) => {
  const [createData, setCreateData] = useState(
    Object.keys(initData).reduce((acc, key) => {
      acc[key] = null; // Set all values to empty strings
      return acc;
    }, {})
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCreateData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    handleSubmit(createData);
  };

  return (
    <div className="create-popup">
      <div className="container">
        <form
          className="popup-inner"
          onSubmit={handleSubmit}
          style={{ width: `${width}px` }}
        >
          <h3 className="title">Create {popupName}</h3>
          <div className="popup-content">
            {Object.entries(initData).map(([key, value]) => (
              <div className="input-container" key={key}>
                <p className="input-title">{value}</p>
                <input
                  type="text"
                  className="input-text"
                  name={key}
                  placeholder="Enter here..."
                  value={createData[key] || ""}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
          <div className="popup-service">
            <button
              type="button"
              className="popup-btn cancel-btn"
              onClick={handleToggle}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="popup-btn save-btn"
              onClick={(e) => {
                handleCreate(e);
                handleToggle();
              }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupCreate;
