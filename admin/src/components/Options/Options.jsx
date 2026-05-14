import React from "react";
import "./Options.scss";
const Options = ({ options, handleSelect, selectedOption, optionName }) => {
  return (
    <div className="options">
      <div className="wrapper-search-option-bar">
        <div className="search-option-bar">
          <input
            type="text"
            placeholder={`Enter ${optionName}...`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
      </div>
      <div className="list-option">
        {options.map((option, index) => (
          <div
            className={`selection ${
              selectedOption?.id === option.id ? "selected" : ""
            }`}
            key={index}
            onClick={() => handleSelect(option)}
          >
            {option.name}
            {selectedOption?.id === option.id && (
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#733ab0"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <g id="Interface / Check">
                    {" "}
                    <path
                      id="Vector"
                      d="M6 12L10.2426 16.2426L18.727 7.75732"
                      stroke="#733ab0"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>{" "}
                  </g>{" "}
                </g>
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Options;
