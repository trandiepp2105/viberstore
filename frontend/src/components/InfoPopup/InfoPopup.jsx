import React from "react";
import "./InfoPopup.scss";
const InfoPopup = ({ handleClose, column = 1 }) => {
  return (
    <div className="info-popup">
      <div className="info-container">
        <div className="title">
          <h4>Create new shipping address</h4>
        </div>
        <div className={`info-content ${column ? `column-${column}` : ""}`}>
          <div className="info-item">
            <div className="info-item__title">Consignee</div>
            <input type="text" placeholder="Enter consignee..." />
          </div>
          <div className="info-item">
            <div className="info-item__title">Phone number</div>
            <input type="text" placeholder="Enter consignee..." />
          </div>
          <div className="info-item">
            <div className="info-item__title">Province / City</div>
            <input type="text" placeholder="Enter your province or city..." />
          </div>
          <div className="info-item">
            <div className="info-item__title">District</div>
            <input type="text" placeholder="Enter your district..." />
          </div>
          <div className="info-item">
            <div className="info-item__title">ward / Commune</div>
            <input type="text" placeholder="Enter your ward / commune..." />
          </div>
          <div className="info-item">
            <div className="info-item__title">Specific addresss</div>
            <input type="text" placeholder="Enter your specific address..." />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={handleClose}>
            CANCEL
          </button>
          <button className="btn create-btn">CREATE</button>
        </div>
      </div>
    </div>
  );
};

export default InfoPopup;
