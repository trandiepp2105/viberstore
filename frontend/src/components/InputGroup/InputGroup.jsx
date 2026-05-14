import React from "react";
import "./InputGroup.scss";
const InputGroup = ({
  id,
  type,
  value,
  onchange,
  placeholder,
  label,
  errorText = "Error text",
  errorDisplay = false,
  className,
}) => {
  return (
    <div className="input-group">
      <label htmlFor={id} className="input-label">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(event) => onchange(event.target.value)}
        className={`input-field ${className}`}
        placeholder={placeholder}
      />
      {errorDisplay && <span className="error-text">{errorText}</span>}
    </div>
  );
};

export default InputGroup;
