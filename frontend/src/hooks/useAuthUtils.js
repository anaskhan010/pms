import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook that provides authentication utilities
 * @returns {Object} Authentication utilities
 */
export const useAuthUtils = () => {
  const auth = useAuth();
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
      'admin': 'Administrator',
      'manager': 'Property Manager',
      'owner': 'Property Owner',
      'tenant': 'Tenant'
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

  /**
   * Check if user is manager or above
   * @returns {boolean} Whether user is manager or above
   */
  const isManagerOrAbove = () => {
    return canAccess(['admin', 'super_admin', 'manager']);
  };

  /**
   * Check if user is owner or above
   * @returns {boolean} Whether user is owner or above
   */
  const isOwnerOrAbove = () => {
    return canAccess(['admin', 'super_admin', 'manager', 'owner']);
  };

  /**
   * Check if user is tenant
   * @returns {boolean} Whether user is tenant
   */
  const isTenant = () => {
    return canAccess(['tenant']);
  };

  /**
   * Get navigation items based on user role
   * @returns {Array} Navigation items for current user
   */
  const getNavigationItems = () => {
    const baseItems = [];
    
    if (isTenant()) {
      return [
        { name: 'Dashboard', href: '/home', icon: 'home' },
        { name: 'My Contracts', href: '/tenant/contracts', icon: 'document' },
        { name: 'Payments', href: '/tenant/payments', icon: 'credit-card' },
        { name: 'Tickets', href: '/tenant/tickets', icon: 'support' },
      ];
    }
    
    if (isOwnerOrAbove()) {
      baseItems.push(
        { name: 'Dashboard', href: '/admin/dashboard', icon: 'home' },
        { name: 'Properties', href: '/admin/buildings', icon: 'building' },
        { name: 'Units', href: '/admin/units', icon: 'grid' },
      );
      
      if (isManagerOrAbove()) {
        baseItems.push(
          { name: 'Tenants', href: '/admin/tenants', icon: 'users' },
          { name: 'Contracts', href: '/admin/contracts', icon: 'document' },
          { name: 'Payments', href: '/admin/payments', icon: 'credit-card' },
          { name: 'Invoices', href: '/admin/invoices', icon: 'receipt' },
        );
      }
      
      if (isAdmin()) {
        baseItems.push(
          { name: 'Owners', href: '/admin/owners', icon: 'user-group' },
          { name: 'Users', href: '/admin/users', icon: 'users' },
          { name: 'Reports', href: '/admin/reports', icon: 'chart' },
          { name: 'Settings', href: '/admin/settings', icon: 'cog' },
        );
      }
    }
    
    return baseItems;
  };

  /**
   * Format user role for display with color
   * @returns {Object} Role info with color
   */
  const getRoleInfo = () => {
    const role = auth.user?.role;
    
    const roleInfo = {
      'super_admin': { name: 'Super Admin', color: 'purple' },
      'admin': { name: 'Administrator', color: 'red' },
      'manager': { name: 'Property Manager', color: 'blue' },
      'owner': { name: 'Property Owner', color: 'green' },
      'tenant': { name: 'Tenant', color: 'gray' }
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
    isManagerOrAbove,
    isOwnerOrAbove,
    isTenant,
    
    // Navigation
    getNavigationItems,
  };
};

export default useAuthUtils;
