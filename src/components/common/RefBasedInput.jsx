import React, { useRef, useEffect } from "react";

/**
 * Ref-based input that completely avoids React's controlled component re-render issues
 */
function RefBasedInput({ label, name, value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  
  // Update onChange ref without causing re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Update input value directly via DOM when value prop changes
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== (value || "")) {
      inputRef.current.value = value || "";
    }
  }, [value]);
  
  // Completely stable change handler
  const handleChange = (e) => {
    if (onChangeRef.current) {
      onChangeRef.current(e);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label 
          htmlFor={name} 
          style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontWeight: 'bold' 
          }}
        >
          {label}
        </label>
      )}
      
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="text"
        defaultValue={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />
    </div>
  );
}

export default RefBasedInput;
