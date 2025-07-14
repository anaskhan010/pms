import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { usePermissions } from '../../contexts/PermissionContext.jsx';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Unauthorized access component - Enhanced for permission-based access
const UnauthorizedAccess = ({ requiredRoles, requiredPermissions, userRole, reason }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        {reason || "You don't have permission to access this page."}
      </p>
      <div className="text-sm text-gray-500 mb-6">
        {requiredRoles && (
          <p>Required role(s): {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</p>
        )}
        {requiredPermissions && (
          <p>Required permission(s): {Array.isArray(requiredPermissions) ? requiredPermissions.join(', ') : requiredPermissions}</p>
        )}
        <p>Your role: {userRole || 'Unknown'}</p>
      </div>
      <button
        onClick={() => window.history.back()}
        className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
      >
        Go Back
      </button>
    </div>
  </div>
);

/**
 * Enhanced ProtectedRoute component with permission-based access control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Array<string>} props.requiredRoles - Array of roles that can access this route (legacy)
 * @param {Array<string>|string} props.requiredPermissions - Required permissions for access
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Where to redirect if not authenticated (default: '/')
 * @param {React.ReactNode} props.fallback - Custom fallback component for loading state
 * @param {React.ReactNode} props.unauthorizedFallback - Custom component for unauthorized access
 * @param {boolean} props.requireAll - If true, user must have ALL permissions (default: false)
 */
const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAuth = true,
  redirectTo = '/',
  fallback = null,
  unauthorizedFallback = null,
  requireAll = false,
}) => {
  const { isAuthenticated, isLoading, user, hasAnyRole } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const location = useLocation();

  // Show loading spinner while checking authentication or permissions
  if (isLoading || permissionsLoading) {
    return fallback || <LoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Permission-based access control (preferred method)
  if (requiredPermissions.length > 0 && isAuthenticated) {
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    let hasAccess = false;
    if (requireAll) {
      // User must have ALL permissions
      hasAccess = permissions.every(permission => hasPermission(permission));
    } else {
      // User must have at least ONE permission
      hasAccess = permissions.some(permission => hasPermission(permission));
    }

    if (!hasAccess) {
      return (
        unauthorizedFallback || (
          <UnauthorizedAccess
            requiredPermissions={permissions}
            userRole={user?.role}
            reason="You don't have the required permissions to access this page."
          />
        )
      );
    }
  }

  // Legacy role-based access control (fallback)
  if (requiredRoles.length > 0 && isAuthenticated && requiredPermissions.length === 0) {
    const hasRequiredRole = hasAnyRole(requiredRoles);

    if (!hasRequiredRole) {
      return (
        unauthorizedFallback || (
          <UnauthorizedAccess
            requiredRoles={requiredRoles}
            userRole={user?.role}
            reason="You don't have the required role to access this page."
          />
        )
      );
    }
  }

  // User is authenticated and authorized, render children
  return children;
};

/**
 * Higher-order component for protecting routes
 * @param {React.Component} Component - Component to protect
 * @param {Object} options - Protection options
 * @returns {React.Component} Protected component
 */
export const withAuth = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

/**
 * Enhanced hook for checking route access with permission support
 * @param {Array<string>} requiredRoles - Required roles for access (legacy)
 * @param {Array<string>|string} requiredPermissions - Required permissions for access
 * @param {boolean} requireAll - If true, user must have ALL permissions
 * @returns {Object} Access information
 */
export const useRouteAccess = (requiredRoles = [], requiredPermissions = [], requireAll = false) => {
  const { isAuthenticated, user, hasAnyRole } = useAuth();
  const { hasPermission } = usePermissions();

  let hasAccess = isAuthenticated;

  if (requiredPermissions.length > 0) {
    // Permission-based access check
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    if (requireAll) {
      hasAccess = hasAccess && permissions.every(permission => hasPermission(permission));
    } else {
      hasAccess = hasAccess && permissions.some(permission => hasPermission(permission));
    }
  } else if (requiredRoles.length > 0) {
    // Legacy role-based access check
    hasAccess = hasAccess && hasAnyRole(requiredRoles);
  }

  return {
    hasAccess,
    isAuthenticated,
    userRole: user?.role,
    requiredRoles,
    requiredPermissions,
  };
};

/**
 * Enhanced component for permission-based conditional rendering
 * @param {Object} props - Component props
 * @param {Array<string>} props.permissions - Required permissions
 * @param {boolean} props.requireAll - If true, user must have ALL permissions
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {React.ReactNode} props.fallback - Content to render if not authorized
 */
export const PermissionGuard = ({ permissions = [], requireAll = false, children, fallback = null }) => {
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) {
    return fallback;
  }

  if (permissions.length > 0) {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

    let hasAccess = false;
    if (requireAll) {
      hasAccess = permissionArray.every(permission => hasPermission(permission));
    } else {
      hasAccess = permissionArray.some(permission => hasPermission(permission));
    }

    if (!hasAccess) {
      return fallback;
    }
  }

  return children;
};

/**
 * Legacy component for role-based conditional rendering
 * @param {Object} props - Component props
 * @param {Array<string>} props.roles - Required roles
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {React.ReactNode} props.fallback - Content to render if not authorized
 */
export const RoleGuard = ({ roles = [], children, fallback = null }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return fallback;
  }

  return children;
};

/**
 * Enhanced component for admin-only content using permissions
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <PermissionGuard permissions={['permissions.view']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

/**
 * Component for super admin content (legacy role-based)
 */
export const SuperAdminOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={['admin', 'super_admin']} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Component for owner-level content
 */
export const OwnerOnly = ({ children, fallback = null }) => (
  <RoleGuard roles={['owner']} fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Component for admin and owner content
 */
export const AdminAndOwner = ({ children, fallback = null }) => (
  <RoleGuard roles={['admin', 'super_admin', 'owner']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export default ProtectedRoute;
