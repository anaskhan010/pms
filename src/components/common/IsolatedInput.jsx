import React, { useState, useEffect } from "react";

/**
 * Completely isolated input component that manages its own state
 * and only communicates with parent when needed
 */
function IsolatedInput({ 
  label, 
  name, 
  initialValue = "", 
  onValueChange, 
  placeholder, 
  type = "text",
  error,
  required = false,
  ...props 
}) {
  const [value, setValue] = useState(initialValue);

  // Update internal state when initialValue changes (for form reset)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle input change
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
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
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

export default IsolatedInput;
