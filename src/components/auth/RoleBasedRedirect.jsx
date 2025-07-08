import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Component that redirects users to their role-appropriate dashboard
 */
const RoleBasedRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role - Only admin access allowed
  switch (user?.role) {
    case "admin":
    case "super_admin":
      return <Navigate to="/admin/dashboard" replace />;

    default:
      // Only admin roles are allowed, redirect others to login
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;
