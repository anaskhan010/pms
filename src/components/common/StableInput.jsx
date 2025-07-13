import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

/**
 * StableInput - A wrapper around Input that prevents focus loss
 * by maintaining stable references and avoiding unnecessary re-renders
 */
const StableInput = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  step,
  className = "",
  ...props
}) => {
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);

  // Update the onChange ref without causing re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Stable change handler that never changes
  const handleChange = (e) => {
    if (onChangeRef.current) {
      onChangeRef.current(e);
    }
  };

  const inputId = props.id || name;

  const inputClasses = [
    "form-input",
    error ? "form-input-error" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type={type}
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={inputClasses}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}
    </div>
  );
};

StableInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default StableInput;
