import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized Input component with consistent styling and validation
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  type = 'text',
  size = 'default',
  variant = 'default',
  icon,
  iconPosition = 'left',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  };

  const variantClasses = {
    default: 'form-input',
    outlined: 'form-input border-2',
    filled: 'form-input bg-gray-50 border-transparent focus:bg-white focus:border-teal-500'
  };

  const inputClasses = [
    variantClasses[variant],
    sizeClasses[size],
    error ? 'form-input-error' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'cursor-wait' : '',
    icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    className
  ].filter(Boolean).join(' ');

  const inputId = props.id || props.name;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled || loading}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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
        <p id={`${inputId}-error`} className="form-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'default', 'lg']),
  variant: PropTypes.oneOf(['default', 'outlined', 'filled']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string
};

export default Input;
