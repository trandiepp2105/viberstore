import React from "react";
import "./WaitingOverlay.scss";
const WaitingOverlay = () => {
  return (
    <div className="waiting-overlay">
      <div className="wrapper-assistant-logo">
        <img
          src="/assets/images/assistant-non-bg.png"
          alt=""
          className="assistant-logo"
        />
      </div>
      <p>Chờ một chút ...</p>
    </div>
  );
};

export default WaitingOverlay;
