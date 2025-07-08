import React from "react";

/**
 * Super Simple Input - No optimizations, no memo, no useCallback
 * Just a basic input that should never lose focus
 */
function SimpleInput({ label, name, value, onChange, error, type = "text", placeholder, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? "form-input-error" : ""}`}
        {...props}
      />
      
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
}

export default SimpleInput;
