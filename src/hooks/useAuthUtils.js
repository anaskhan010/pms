import { useAuth } from '../contexts/AuthContext.jsx';
import { usePermissions } from '../contexts/PermissionContext';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook that provides authentication utilities
 * @returns {Object} Authentication utilities
 */
export const useAuthUtils = () => {
  const auth = useAuth();
  const { getFilteredMenuItems } = usePermissions();
  const navigate = useNavigate();

  /**
   * Handle logout with navigation
   * @param {string} redirectTo - Where to redirect after logout
   */
  const handleLogout = async (redirectTo = '/') => {
    try {
      await auth.logout();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate(redirectTo, { replace: true });
    }
  };

  /**
   * Check if current user can access a specific feature
   * @param {string|Array<string>} requiredRoles - Required roles for access
   * @returns {boolean} Whether user has access
   */
  const canAccess = (requiredRoles) => {
    if (!auth.isAuthenticated) return false;
    
    if (typeof requiredRoles === 'string') {
      return auth.hasRole(requiredRoles);
    }
    
    if (Array.isArray(requiredRoles)) {
      return auth.hasAnyRole(requiredRoles);
    }
    
    return false;
  };

  /**
   * Get user display name
   * @returns {string} User's display name
   */
  const getUserDisplayName = () => {
    if (!auth.user) return 'Guest';
    
    const { first_name, last_name, username, email } = auth.user;
    
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    
    if (first_name) {
      return first_name;
    }
    
    return username || email || 'User';
  };

  /**
   * Get user initials for avatar
   * @returns {string} User's initials
   */
  const getUserInitials = () => {
    if (!auth.user) return 'G';
    
    const { first_name, last_name, username, email } = auth.user;
    
    if (first_name && last_name) {
      return `${first_name[0]}${last_name[0]}`.toUpperCase();
    }
    
    if (first_name) {
      return first_name[0].toUpperCase();
    }
    
    if (username) {
      return username[0].toUpperCase();
    }
    
    if (email) {
      return email[0].toUpperCase();
    }
    
    return 'U';
  };

  /**
   * Get role display name
   * @returns {string} Formatted role name
   */
  const getRoleDisplayName = () => {
    if (!auth.user?.role) return 'Unknown';

    const roleMap = {
      'super_admin': 'Super Admin',
      'admin': 'Administrator'
    };

    return roleMap[auth.user.role] || auth.user.role;
  };

  /**
   * Check if user is admin or super admin
   * @returns {boolean} Whether user is admin
   */
  const isAdmin = () => {
    return canAccess(['admin', 'super_admin']);
  };

  // Removed manager, owner, tenant role checks - Admin only system

  /**
   * Get navigation items - Permission-based filtering
   * @returns {Array} Navigation items based on user permissions
   */
  const getNavigationItems = () => {
    // Define all possible navigation items with their required permissions
    const allNavigationItems = [
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: 'home',
        requiredPermission: 'dashboard.view'
      },
      {
        name: auth.user?.role === 'owner' ? 'My Tenants' : 'Tenants',
        href: '/admin/tenants',
        icon: 'users',
        requiredPermission: ['tenants.view', 'tenants.view_own']
      },
      {
        name: auth.user?.role === 'owner' ? 'My Buildings' : 'Buildings',
        href: '/admin/buildings',
        icon: 'building',
        requiredPermission: ['buildings.view', 'buildings.view_own']
      },
      {
        name: auth.user?.role === 'owner' ? 'My Villas' : 'Villas',
        href: '/admin/villas',
        icon: 'home',
        requiredPermission: ['villas.view', 'villas.view_own']
      },
      {
        name: 'Virtual Tour',
        href: '/admin/virtual-demo',
        icon: 'video',
        requiredPermission: 'dashboard.view'
      },
      {
        name: 'Vendors',
        href: '/admin/vendors',
        icon: 'briefcase',
        requiredPermission: 'vendors.view'
      },
      {
        name: 'Transactions',
        href: '/admin/transactions',
        icon: 'credit-card',
        requiredPermission: ['transactions.view', 'transactions.view_own']
      },
      {
        name: 'Messages',
        href: '/admin/messages',
        icon: 'chat',
        requiredPermission: 'messages.view'
      },
      {
        name: 'User Management',
        href: '/admin/user-management',
        icon: 'user-group',
        requiredPermission: 'users.view'
      },
      {
        name: 'Permissions & Roles',
        href: '/admin/permissions',
        icon: 'shield',
        requiredPermission: 'permissions.view'
      }
    ];

    // Filter navigation items based on user permissions
    return getFilteredMenuItems ? getFilteredMenuItems(allNavigationItems) : [];
  };

  /**
   * Format user role for display with color - Admin and Owner
   * @returns {Object} Role info with color
   */
  const getRoleInfo = () => {
    const role = auth.user?.role;

    const roleInfo = {
      'super_admin': { name: 'Super Admin', color: 'purple' },
      'admin': { name: 'Administrator', color: 'red' },
      'owner': { name: 'Building Owner', color: 'blue' }
    };

    return roleInfo[role] || { name: 'Unknown', color: 'gray' };
  };

  return {
    // Auth state
    ...auth,
    
    // Utility functions
    handleLogout,
    canAccess,
    getUserDisplayName,
    getUserInitials,
    getRoleDisplayName,
    getRoleInfo,
    
    // Role checks
    isAdmin,
    
    // Navigation
    getNavigationItems,
  };
};

export default useAuthUtils;
