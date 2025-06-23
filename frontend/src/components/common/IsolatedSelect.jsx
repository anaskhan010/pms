import React, { useState, useEffect } from "react";

/**
 * Completely isolated select component that manages its own state
 */
function IsolatedSelect({ 
  label, 
  name, 
  initialValue = "", 
  onValueChange, 
  options = [],
  error,
  required = false,
  placeholder = "Select an option",
  ...props 
}) {
  const [value, setValue] = useState(initialValue);

  // Update internal state when initialValue changes (for form reset)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle select change
  function handleChange(e) {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Notify parent of change
    if (onValueChange) {
      onValueChange(name, newValue);
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        className={`form-select ${error ? "form-select-error" : ""}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
}

export default IsolatedSelect;
