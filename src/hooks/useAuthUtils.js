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
   * Get navigation items - Admin only
   * @returns {Array} Navigation items for admin users
   */
  const getNavigationItems = () => {
    if (isAdmin()) {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: 'home' },
        { name: 'Tenants', href: '/admin/tenants', icon: 'users' },
        { name: 'Buildings', href: '/admin/buildings', icon: 'building' },
        { name: 'Villas', href: '/admin/villas', icon: 'home' },
        { name: 'Virtual Tour', href: '/admin/virtual-demo', icon: 'video' },
        { name: 'Vendors', href: '/admin/vendors', icon: 'briefcase' },
        { name: 'Transactions', href: '/admin/transactions', icon: 'credit-card' },
        { name: 'Messages', href: '/admin/messages', icon: 'chat' },
      ];
    }

    return [];
  };

  /**
   * Format user role for display with color - Admin only
   * @returns {Object} Role info with color
   */
  const getRoleInfo = () => {
    const role = auth.user?.role;

    const roleInfo = {
      'super_admin': { name: 'Super Admin', color: 'purple' },
      'admin': { name: 'Administrator', color: 'red' }
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
