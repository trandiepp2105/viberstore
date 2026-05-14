import React, { useState, useEffect } from "react";
import "./CouponPopup.scss";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";

const CustomDatePicker = ({ label, value, onChange }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker
      label={label}
      value={value}
      onChange={onChange}
      renderInput={(params) => <TextField {...params} fullWidth />}
      sx={{
        width: "100%",
        height: "100%",
        "& .MuiFormControl-root": {
          height: "100%",
          width: "100%",
        },
        "& .MuiFormLabel-root": {
          display: "none",
        },
        "& .MuiInputBase-root": {
          paddingLeft: "10px",
          height: "100%",
          width: "100%",
        },
        "& .MuiInputBase-input": {
          padding: "0",
          height: "100%",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
      }}
    />
  </LocalizationProvider>
);

const CouponPopup = ({
  popupName = "Coupon",
  coupon,
  handleToggle,
  width = 500,
  handleSubmit,
  mainButtonText = "Create",
}) => {
  const couponTypes = [
    "percentage",
    "fixed",
    "buy one get one",
    "free shipping",
  ];
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(1, "month"));
  const [couponData, setCouponData] = useState(
    coupon || {
      code: "",
      type: "percentage",
      value: 0,
      start_date: dayjs(),
      end_date: dayjs().add(1, "month"),
      usage_limit_per_user: null,
      usage_limit_per_coupon: null,
      min_order_amount: null,
      max_discount_amount: null,
      description: "",
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCouponData((prevData) => ({
      ...prevData,
      [name]:
        [
          "usage_limit_per_user",
          "usage_limit_per_coupon",
          "min_order_amount",
          "max_discount_amount",
        ].includes(name) && value === ""
          ? null
          : value,
    }));
  };

  const [isOpenSelectType, setIsOpenSelectType] = useState(false);
  return (
    <div className="coupon-popup">
      <div className="container">
        <form
          className="popup-inner"
          onSubmit={(e) => {
            e.preventDefault();
            console.log("submit", couponData);
            handleSubmit(couponData);
          }}
          style={{ width: `${width}px` }}
        >
          <h3 className="title">{popupName}</h3>
          <div className="popup-content">
            <div className="input-container">
              <p className="input-title">Code</p>
              <div className="wrapper-input">
                <input
                  type="text"
                  name="code"
                  value={couponData.code}
                  onChange={handleInputChange}
                  placeholder="Enter coupon code"
                />
              </div>
            </div>
            <div className="input-container half-width">
              <p className="input-title ">Type</p>
              <div
                className="wrapper-input select-type"
                onClick={() => setIsOpenSelectType(!isOpenSelectType)}
              >
                <p>{couponData.type}</p>
                <svg
                  fill="#525151"
                  width="15px"
                  height="15px"
                  viewBox="-6.5 0 32 32"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#525151"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0" />

                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <title>dropdown</title>{" "}
                    <path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z" />{" "}
                  </g>
                </svg>
                {isOpenSelectType && (
                  <div className="options">
                    {couponTypes.map((type) => (
                      <div
                        key={type}
                        className={`option ${
                          couponData.type === type ? "active" : ""
                        }`}
                        onClick={() => {
                          setCouponData((prevData) => ({
                            ...prevData,
                            type: type,
                          }));
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="input-container half-width">
              <p className="input-title">Value</p>
              <div className="wrapper-input">
                <input
                  type="number"
                  name="value"
                  value={couponData.value}
                  onChange={handleInputChange}
                  placeholder="Enter value"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            <div className="input-container half-width">
              <p className="input-title">Start date</p>
              <div className="date-picker wrapper-input">
                <CustomDatePicker
                  label="Chọn ngày"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                />
              </div>
            </div>
            <div className="input-container half-width">
              <p className="input-title">End date</p>
              <div className="date-picker wrapper-input">
                <CustomDatePicker
                  label="Chọn ngày"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                />
              </div>
            </div>
            <div className="input-container half-width">
              <p className="input-title">Min order amount</p>
              <div className="wrapper-input">
                <input
                  type="number"
                  name="min_order_amount"
                  value={couponData.min_order_amount}
                  onChange={handleInputChange}
                  placeholder="Enter min order amount"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            <div className="input-container half-width">
              <p className="input-title">Max discount amount</p>
              <div className="wrapper-input">
                <input
                  type="number"
                  name="max_discount_amount"
                  value={couponData.max_discount_amount}
                  onChange={handleInputChange}
                  placeholder="Enter max discount amount"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="input-container half-width">
              <p className="input-title">Usage / user</p>
              <div className="wrapper-input">
                <input
                  type="number"
                  name="usage_limit_per_user"
                  value={couponData.usage_limit_per_user}
                  onChange={handleInputChange}
                  placeholder="Enter usage limit per user"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            <div className="input-container half-width">
              <p className="input-title">Usage / coupon</p>
              <div className="wrapper-input">
                <input
                  type="number"
                  name="usage_limit_per_coupon"
                  value={couponData.usage_limit_per_coupon}
                  onChange={handleInputChange}
                  placeholder="Enter usage limit per coupon"
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            <div className="input-container">
              <p className="input-title">Description</p>
              <div className="wrapper-input">
                <textarea
                  name="description"
                  id=""
                  rows={4}
                  value={couponData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  style={{ resize: "none" }}
                ></textarea>
              </div>
            </div>
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
                e.preventDefault();
                handleSubmit(couponData);
              }}
            >
              {mainButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponPopup;
