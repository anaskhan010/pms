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
        // Debug logging for owner users
        if (user?.role === 'owner') {
          console.log('🔍 Owner Permissions Debug:', {
            userRole: user?.role,
            permissionsCount: response.data?.length || 0,
            permissions: response.data?.map(p => p.permissionName) || [],
            hasTransactionViewOwn: response.data?.some(p => p.permissionName === 'transactions.view_own') || false
          });
        }
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
    if (user?.role === 'admin' || user?.roleId === 1) {
      // Admin gets all possible permissions - comprehensive list
      setPermissions([
        // Dashboard permissions
        { permissionName: 'dashboard.view', resource: 'dashboard', action: 'view' },

        // Villa permissions
        { permissionName: 'villas.view', resource: 'villas', action: 'view' },
        { permissionName: 'villas.create', resource: 'villas', action: 'create' },
        { permissionName: 'villas.update', resource: 'villas', action: 'update' },
        { permissionName: 'villas.delete', resource: 'villas', action: 'delete' },

        // Building permissions
        { permissionName: 'buildings.view', resource: 'buildings', action: 'view' },
        { permissionName: 'buildings.create', resource: 'buildings', action: 'create' },
        { permissionName: 'buildings.update', resource: 'buildings', action: 'update' },
        { permissionName: 'buildings.delete', resource: 'buildings', action: 'delete' },

        // Tenant permissions
        { permissionName: 'tenants.view', resource: 'tenants', action: 'view' },
        { permissionName: 'tenants.create', resource: 'tenants', action: 'create' },
        { permissionName: 'tenants.update', resource: 'tenants', action: 'update' },
        { permissionName: 'tenants.delete', resource: 'tenants', action: 'delete' },

        // User management permissions
        { permissionName: 'users.view', resource: 'users', action: 'view' },
        { permissionName: 'users.create', resource: 'users', action: 'create' },
        { permissionName: 'users.update', resource: 'users', action: 'update' },
        { permissionName: 'users.delete', resource: 'users', action: 'delete' },

        // Permission management
        { permissionName: 'permissions.view', resource: 'permissions', action: 'view' },
        { permissionName: 'permissions.create', resource: 'permissions', action: 'create' },
        { permissionName: 'permissions.update', resource: 'permissions', action: 'update' },
        { permissionName: 'permissions.delete', resource: 'permissions', action: 'delete' },
        { permissionName: 'permissions.assign', resource: 'permissions', action: 'assign' },

        // Message permissions
        { permissionName: 'messages.view', resource: 'messages', action: 'view' },
        { permissionName: 'messages.create', resource: 'messages', action: 'create' },
        { permissionName: 'messages.update', resource: 'messages', action: 'update' },
        { permissionName: 'messages.delete', resource: 'messages', action: 'delete' },

        // Transaction permissions
        { permissionName: 'transactions.view', resource: 'transactions', action: 'view' },
        { permissionName: 'transactions.create', resource: 'transactions', action: 'create' },
        { permissionName: 'transactions.update', resource: 'transactions', action: 'update' },
        { permissionName: 'transactions.delete', resource: 'transactions', action: 'delete' },

        // Vendor permissions
        { permissionName: 'vendors.view', resource: 'vendors', action: 'view' },
        { permissionName: 'vendors.create', resource: 'vendors', action: 'create' },
        { permissionName: 'vendors.update', resource: 'vendors', action: 'update' },
        { permissionName: 'vendors.delete', resource: 'vendors', action: 'delete' }
      ]);
    } else if (user?.role === 'owner' || user?.roleId === 2) {
      // Give owner limited permissions
      setPermissions([
        { permissionName: 'dashboard.view', resource: 'dashboard', action: 'view' },
        { permissionName: 'villas.view_own', resource: 'villas', action: 'view_own' },
        { permissionName: 'buildings.view_own', resource: 'buildings', action: 'view_own' },
        { permissionName: 'tenants.view_own', resource: 'tenants', action: 'view_own' },
        { permissionName: 'tenants.create', resource: 'tenants', action: 'create' },
        { permissionName: 'transactions.view_own', resource: 'transactions', action: 'view_own' },
        { permissionName: 'transactions.create', resource: 'transactions', action: 'create' },
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
    if (!permissionName) return false;

    // Admin users have all permissions
    if (user?.role === 'admin' || user?.roleId === 1) {
      return true;
    }

    if (!permissions.length) return false;
    return permissions.some(permission => permission.permissionName === permissionName);
  };

  // Check if user has permission for a resource and action
  const hasResourcePermission = (resource, action) => {
    if (!resource || !action) return false;

    // Admin users have all permissions
    if (user?.role === 'admin' || user?.roleId === 1) {
      return true;
    }

    if (!permissions.length) return false;
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
    return user?.role === 'admin' || user?.roleId === 1 || hasPermission('permissions.view');
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
