// Checkbox.jsx
import React from "react";
import "./CheckBox.scss";

const CheckBox = ({ name, checked, onChange, label }) => {
  return (
    <div className="custom-checkbox">
      <input name={name} type="radio" checked={checked} onChange={onChange} />
      <span className="checkmark"></span>
    </div>
  );
};

export default CheckBox;
