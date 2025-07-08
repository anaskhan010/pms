import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized Select component with consistent styling
 */
const Select = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  size = 'default',
  variant = 'default',
  placeholder = 'Select an option...',
  options = [],
  className = '',
  containerClassName = '',
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  const variantClasses = {
    default: 'form-select',
    outlined: 'form-select border-2',
    filled: 'form-select bg-gray-50 border-transparent focus:bg-white focus:border-teal-500'
  };

  const selectClasses = [
    variantClasses[variant],
    sizeClasses[size],
    error ? 'form-input-error' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'cursor-wait' : '',
    className
  ].filter(Boolean).join(' ');

  const selectId = props.id || props.name;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          disabled={disabled || loading}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.length > 0 ? (
            options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <svg
              className="animate-spin h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${selectId}-error`} className="form-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'default', 'lg']),
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  children: PropTypes.node,
  id: PropTypes.string,
  name: PropTypes.string
};

export default Select;
