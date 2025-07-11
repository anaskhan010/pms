import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import adminApiService from '../services/adminApiService';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user permissions when user changes
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      fetchUserPermissions();
    } else {
      setPermissions([]);
    }
  }, [isAuthenticated, user?.userId]);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApiService.getMyPermissions();

      if (response.success) {
        setPermissions(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch permissions');
        // Set basic permissions based on role as fallback
        setBasicPermissionsFallback();
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setError('Failed to fetch permissions');
      // Set basic permissions based on role as fallback
      setBasicPermissionsFallback();
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to set basic permissions based on user role
  const setBasicPermissionsFallback = () => {
    if (user?.role === 'admin') {
      // Give admin basic permissions
      setPermissions([
        { permissionName: 'dashboard.view', resource: 'dashboard', action: 'view' },
        { permissionName: 'villas.view', resource: 'villas', action: 'view' },
        { permissionName: 'buildings.view', resource: 'buildings', action: 'view' },
        { permissionName: 'tenants.view', resource: 'tenants', action: 'view' },
        { permissionName: 'users.view', resource: 'users', action: 'view' },
        { permissionName: 'permissions.view', resource: 'permissions', action: 'view' },
        { permissionName: 'messages.view', resource: 'messages', action: 'view' },
        { permissionName: 'vendors.view', resource: 'vendors', action: 'view' },
        { permissionName: 'transactions.view', resource: 'transactions', action: 'view' }
      ]);
    } else if (user?.role === 'owner') {
      // Give owner basic permissions
      setPermissions([
        { permissionName: 'dashboard.view', resource: 'dashboard', action: 'view' },
        { permissionName: 'villas.view_own', resource: 'villas', action: 'view_own' },
        { permissionName: 'buildings.view_own', resource: 'buildings', action: 'view_own' },
        { permissionName: 'tenants.view_own', resource: 'tenants', action: 'view_own' },
        { permissionName: 'messages.view', resource: 'messages', action: 'view' }
      ]);
    } else {
      // Basic dashboard access for other roles
      setPermissions([
        { permissionName: 'dashboard.view', resource: 'dashboard', action: 'view' }
      ]);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permissionName) => {
    if (!permissionName || !permissions.length) return false;
    return permissions.some(permission => permission.permissionName === permissionName);
  };

  // Check if user has permission for a resource and action
  const hasResourcePermission = (resource, action) => {
    if (!resource || !action || !permissions.length) return false;
    return permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  };

  // Check if user has any permission for a resource
  const hasAnyResourcePermission = (resource) => {
    if (!resource || !permissions.length) return false;
    return permissions.some(permission => permission.resource === resource);
  };

  // Get all permissions for a specific resource
  const getResourcePermissions = (resource) => {
    if (!resource || !permissions.length) return [];
    return permissions.filter(permission => permission.resource === resource);
  };

  // Check if user can access a menu item based on permissions
  const canAccessMenuItem = (menuItem) => {
    if (!menuItem.requiredPermission) return true;
    
    // If it's an array of permissions, user needs at least one
    if (Array.isArray(menuItem.requiredPermission)) {
      return menuItem.requiredPermission.some(permission => hasPermission(permission));
    }
    
    // Single permission check
    return hasPermission(menuItem.requiredPermission);
  };

  // Get filtered menu items based on permissions
  const getFilteredMenuItems = (menuItems) => {
    return menuItems.filter(item => canAccessMenuItem(item));
  };

  // Check if user is admin (has all permissions)
  const isAdmin = () => {
    return user?.role === 'admin' || hasPermission('permissions.view');
  };

  // Check if user is owner
  const isOwner = () => {
    return user?.role === 'owner';
  };

  // Refresh permissions (useful after role changes)
  const refreshPermissions = () => {
    if (isAuthenticated && user?.userId) {
      fetchUserPermissions();
    }
  };

  const value = {
    permissions,
    loading,
    error,
    hasPermission,
    hasResourcePermission,
    hasAnyResourcePermission,
    getResourcePermissions,
    canAccessMenuItem,
    getFilteredMenuItems,
    isAdmin,
    isOwner,
    refreshPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
