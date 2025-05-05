import React from "react";
import "./WarningPopup.scss";
const WarningPopup = ({
  message = "Bạn vui lòng chọn sản phẩm trước khi chọn gói bảo hành.",
  handleClose,
}) => {
  return (
    <div className="warning-popup">
      <div className="warning-popup-inner">
        <div className="warning-popup__header">
          <div className="warning-popup__title">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              xmlns="http://www.w3.org/2000/svg"
              fill="var(--red-red-7)"
              class="h-5 w-5 fill-yellow-yellow-7"
            >
              <g clip-path="url(#clip0_1505_49849)">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M0.625 6C0.625 8.96853 3.03147 11.375 6 11.375C8.96853 11.375 11.375 8.96853 11.375 6C11.375 3.03147 8.96853 0.625 6 0.625C3.03147 0.625 0.625 3.03147 0.625 6ZM5.84094 5.51363C5.96446 5.53024 6.13533 5.57469 6.28033 5.71969C6.42533 5.86468 6.46978 6.03555 6.48639 6.15908C6.50015 6.2614 6.50007 6.38039 6.50001 6.48032L6.5 6.50002V8.50002C6.5 8.77616 6.27614 9.00002 6 9.00002C5.72386 9.00002 5.5 8.77616 5.5 8.50002V6.50002C5.22386 6.50002 5 6.27616 5 6.00002C5 5.72387 5.22386 5.50002 5.5 5.50002L5.51969 5.50001C5.61963 5.49995 5.73861 5.49987 5.84094 5.51363ZM5.99772 3.5C5.72281 3.5 5.49996 3.72386 5.49996 4C5.49996 4.27614 5.72281 4.5 5.99772 4.5H6.00219C6.2771 4.5 6.49996 4.27614 6.49996 4C6.49996 3.72386 6.2771 3.5 6.00219 3.5H5.99772Z"
                  fill=""
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_1505_49849">
                  <rect width="12" height="12" fill="white"></rect>
                </clipPath>
              </defs>
            </svg>
            <p>Warning</p>
          </div>

          <button className="close-btn" onClick={handleClose}>
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
                  opacity="0.4"
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="#292D32"
                />{" "}
                <path
                  d="M13.0594 12.0001L15.3594 9.70011C15.6494 9.41011 15.6494 8.93011 15.3594 8.64011C15.0694 8.35011 14.5894 8.35011 14.2994 8.64011L11.9994 10.9401L9.69937 8.64011C9.40937 8.35011 8.92937 8.35011 8.63938 8.64011C8.34938 8.93011 8.34938 9.41011 8.63938 9.70011L10.9394 12.0001L8.63938 14.3001C8.34938 14.5901 8.34938 15.0701 8.63938 15.3601C8.78938 15.5101 8.97937 15.5801 9.16937 15.5801C9.35937 15.5801 9.54937 15.5101 9.69937 15.3601L11.9994 13.0601L14.2994 15.3601C14.4494 15.5101 14.6394 15.5801 14.8294 15.5801C15.0194 15.5801 15.2094 15.5101 15.3594 15.3601C15.6494 15.0701 15.6494 14.5901 15.3594 14.3001L13.0594 12.0001Z"
                  fill="#292D32"
                />{" "}
              </g>
            </svg>
          </button>
        </div>
        <p className="description">{message}</p>
      </div>
    </div>
  );
};

export default WarningPopup;
