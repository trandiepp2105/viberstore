import React from "react";
import "./AccountButton.scss";
const AccountButton = ({
  className,
  children,
  type = "submit",
  handleClick,
}) => {
  return (
    <button
      className={`account-button ${className}`}
      type={type}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default AccountButton;
