import React, { useState } from "react";
import "./CustomSelect.scss";
import Options from "../Options/Options";
const CustomSelect = ({
  options,
  selectedOption,
  handleSelectOption,
  height = 35,
  optionName = "main category",
}) => {
  const [isOpenOptions, setIsOpenOptions] = useState(false);
  const toggleOptions = () => {
    setIsOpenOptions(!isOpenOptions);
  };
  return (
    <div className="customer-select" onClick={toggleOptions}>
      <div
        className="container"
        style={{
          height: `${height}px`,
        }}
      >
        <svg
          fill="#ccc"
          width="15px"
          height="15px"
          viewBox="-6.5 0 32 32"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          className="dropdown-icon"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0" />

          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <g id="SVGRepo_iconCarrier">
            {" "}
            <title>dropdown</title>{" "}
            <path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z" />{" "}
          </g>
        </svg>
        {/* <div className="place-holder">Product Category</div> */}
        <div className="current-option">
          {selectedOption?.name || `Select ${optionName || "option"}`}
        </div>
      </div>

      {isOpenOptions && (
        <Options
          handleSelect={handleSelectOption}
          options={options}
          optionName={optionName}
        />
      )}
    </div>
  );
};

export default CustomSelect;
