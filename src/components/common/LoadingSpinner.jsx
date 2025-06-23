import React from 'react';

/**
 * Loading spinner component with different sizes and styles
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner: 'sm', 'md', 'lg', 'xl'
 * @param {string} props.color - Color theme: 'teal', 'blue', 'gray', 'white'
 * @param {string} props.text - Loading text to display
 * @param {boolean} props.fullScreen - Whether to show as full screen overlay
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'teal', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Color configurations
  const colorClasses = {
    teal: 'border-teal-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  // Text size based on spinner size
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2 border-gray-200 
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    ${className}
  `;

  const textClasses = `
    mt-4 text-gray-600 font-medium
    ${textSizeClasses[size]}
  `;

  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses}></div>
      {text && <p className={textClasses}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Inline loading spinner for buttons and small spaces
 */
export const InlineSpinner = ({ size = 'sm', color = 'white', className = '' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  const colorClasses = {
    white: 'border-white',
    teal: 'border-teal-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600'
  };

  return (
    <div 
      className={`
        animate-spin rounded-full border-2 border-gray-200 border-opacity-25
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        ${className}
      `}
    >
      <div className="sr-only">Loading...</div>
    </div>
  );
};

/**
 * Loading overlay for specific components
 */
export const LoadingOverlay = ({ isLoading, children, text = 'Loading...' }) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <LoadingSpinner text={text} />
      </div>
    </div>
  );
};

/**
 * Skeleton loader for content placeholders
 */
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 rounded h-4 mb-3 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

/**
 * Card skeleton loader
 */
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
};

/**
 * Table skeleton loader
 */
export const TableSkeleton = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Header */}
      <div className="flex space-x-4 mb-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="flex-1 h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={`flex-1 h-4 bg-gray-200 rounded ${
                colIndex === 0 ? 'w-1/4' : colIndex === columns - 1 ? 'w-1/6' : ''
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
