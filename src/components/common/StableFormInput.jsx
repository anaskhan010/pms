import React, { useRef, useEffect } from "react";

/**
 * Stable Form Input - Uses refs to maintain stability across re-renders
 */
function StableFormInput({ name, value, onChange, label, type = "text", placeholder, error }) {
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  
  // Update onChange ref without causing re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Stable change handler that never changes reference
  const handleChange = (e) => {
    if (onChangeRef.current) {
      onChangeRef.current(e);
    }
  };
  
  // Update input value directly via ref to avoid re-render issues
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value || "";
    }
  }, [value]);

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
        </label>
      )}
      
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        defaultValue={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={`form-input ${error ? "form-input-error" : ""}`}
      />
      
      {error && (
        <p className="form-error">{error}</p>
      )}
      
      <p className="text-xs text-gray-400">Stable Input - Value: {value}</p>
    </div>
  );
}

export default StableFormInput;
