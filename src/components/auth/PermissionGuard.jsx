import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

/**
 * PermissionGuard component - Conditionally renders children based on user permissions
 * 
 * @param {Object} props
 * @param {string|string[]} props.permission - Required permission(s) to access the content
 * @param {string} props.resource - Resource name for resource-based permission check
 * @param {string} props.action - Action name for resource-based permission check
 * @param {boolean} props.requireAll - If true, user must have ALL permissions (for array of permissions)
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission
 * @param {boolean} props.showFallback - Whether to show fallback content or nothing
 */
const PermissionGuard = ({ 
  permission, 
  resource, 
  action, 
  requireAll = false,
  children, 
  fallback = null,
  showFallback = false 
}) => {
  const { hasPermission, hasResourcePermission, loading } = usePermissions();

  // Show loading state while permissions are being fetched
  if (loading) {
    return null;
  }

  let hasAccess = false;

  // Check permission based on the provided props
  if (permission) {
    if (Array.isArray(permission)) {
      if (requireAll) {
        // User must have ALL permissions
        hasAccess = permission.every(perm => hasPermission(perm));
      } else {
        // User must have at least ONE permission
        hasAccess = permission.some(perm => hasPermission(perm));
      }
    } else {
      // Single permission check
      hasAccess = hasPermission(permission);
    }
  } else if (resource && action) {
    // Resource-action based permission check
    hasAccess = hasResourcePermission(resource, action);
  }

  // Render based on access
  if (hasAccess) {
    return children;
  }

  // Show fallback if specified, otherwise render nothing
  return showFallback ? fallback : null;
};

/**
 * Hook for conditional rendering based on permissions
 * 
 * @param {string|string[]} permission - Required permission(s)
 * @param {boolean} requireAll - If true, user must have ALL permissions
 * @returns {boolean} Whether user has the required permission(s)
 */
export const usePermissionCheck = (permission, requireAll = false) => {
  const { hasPermission } = usePermissions();

  if (!permission) return true;

  if (Array.isArray(permission)) {
    if (requireAll) {
      return permission.every(perm => hasPermission(perm));
    } else {
      return permission.some(perm => hasPermission(perm));
    }
  }

  return hasPermission(permission);
};

/**
 * Higher-order component for permission-based access control
 * 
 * @param {React.Component} Component - Component to wrap
 * @param {string|string[]} requiredPermission - Required permission(s)
 * @param {Object} options - Additional options
 * @returns {React.Component} Wrapped component with permission check
 */
export const withPermission = (Component, requiredPermission, options = {}) => {
  const { 
    requireAll = false, 
    fallback = null, 
    showFallback = false 
  } = options;

  return function PermissionWrappedComponent(props) {
    return (
      <PermissionGuard
        permission={requiredPermission}
        requireAll={requireAll}
        fallback={fallback}
        showFallback={showFallback}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
};

/**
 * Component for displaying access denied message
 */
export const AccessDenied = ({ 
  title = "Access Denied", 
  message = "You don't have permission to access this content.",
  showIcon = true 
}) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      {showIcon && (
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Removed duplicate PermissionButton - using the more comprehensive one below

/**
 * Link component with permission-based visibility
 */
export const PermissionLink = ({ 
  permission, 
  resource, 
  action, 
  children, 
  ...linkProps 
}) => {
  return (
    <PermissionGuard permission={permission} resource={resource} action={action}>
      <a {...linkProps}>
        {children}
      </a>
    </PermissionGuard>
  );
};

// Button wrapper that automatically handles permission-based styling
export const PermissionButton = ({
  permission,
  resource,
  action,
  onClick,
  children,
  className = '',
  disabledClassName = 'opacity-50 cursor-not-allowed',
  showTooltip = true,
  tooltipText,
  requireAll = false,
  ...props
}) => {
  const { hasPermission, hasResourcePermission, loading } = usePermissions();

  if (loading) {
    return (
      <button {...props} className={`${className} opacity-50`} disabled>
        {children}
      </button>
    );
  }

  let hasAccess = false;

  // Check permission based on the provided props
  if (permission) {
    if (Array.isArray(permission)) {
      if (requireAll) {
        hasAccess = permission.every(perm => hasPermission(perm));
      } else {
        hasAccess = permission.some(perm => hasPermission(perm));
      }
    } else {
      hasAccess = hasPermission(permission);
    }
  } else if (resource && action) {
    hasAccess = hasResourcePermission(resource, action);
  }

  if (!hasAccess) {
    const buttonElement = (
      <button
        {...props}
        className={`${className} ${disabledClassName}`}
        disabled={true}
        onClick={(e) => e.preventDefault()}
      >
        {children}
      </button>
    );

    if (showTooltip) {
      return (
        <div className="relative group">
          {buttonElement}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {tooltipText || "You don't have permission for this action"}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      );
    }

    return buttonElement;
  }

  return (
    <button
      {...props}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PermissionGuard;
