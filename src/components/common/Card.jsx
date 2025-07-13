import React from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized Card component with consistent styling
 * Supports different variants, sizes, and interactive states
 */
const Card = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  interactive = false,
  loading = false,
  header,
  footer,
  onClick,
  ...props
}) => {
  const baseClasses = 'card transition-smooth';
  
  const variantClasses = {
    default: 'shadow-md hover:shadow-lg',
    elevated: 'shadow-lg hover:shadow-xl',
    outlined: 'border-2 border-gray-200 shadow-sm hover:border-gray-300',
    flat: 'shadow-none border border-gray-100'
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    default: '',
    lg: 'text-lg'
  };
  
  const interactiveClasses = interactive || onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : '';
  
  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    interactiveClasses,
    loading ? 'loading-pulse' : '',
    className
  ].filter(Boolean).join(' ');

  const CardContent = () => (
    <>
      {header && (
        <div className="card-header">
          {typeof header === 'string' ? (
            <h3 className="text-lg font-semibold text-gray-800">{header}</h3>
          ) : (
            header
          )}
        </div>
      )}
      
      <div className="card-body">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        className={cardClasses}
        onClick={onClick}
        disabled={loading}
        {...props}
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      <CardContent />
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'elevated', 'outlined', 'flat']),
  size: PropTypes.oneOf(['sm', 'default', 'lg']),
  interactive: PropTypes.bool,
  loading: PropTypes.bool,
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  footer: PropTypes.node,
  onClick: PropTypes.func
};

export default Card;
