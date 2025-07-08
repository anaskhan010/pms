import React from "react";

/**
 * Ultra basic input with minimal styling - no form-input class
 */
function BasicInput({ label, name, value, onChange, placeholder }) {
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
        id={name}
        name={name}
        type="text"
        value={value || ""}
        onChange={onChange}
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

export default BasicInput;
