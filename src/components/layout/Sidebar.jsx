import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import { useState, useEffect } from "react";
import adminApiService from "../../services/adminApiService";
import SidebarPattern from "./SidebarPattern";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasPermission, getFilteredMenuItems } = usePermissions();
  const [sidebarPages, setSidebarPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    onToggle && onToggle(!isOpen);
  };

  // Fetch sidebar pages from database
  useEffect(() => {
    const fetchSidebarPages = async () => {
      try {
        setLoading(true);
        const response = await adminApiService.getMySidebarPages();
        if (response.success) {
          setSidebarPages(response.data);
        } else {
          console.error('Failed to fetch sidebar pages:', response.error);
          // Fallback to empty array
          setSidebarPages([]);
        }
      } catch (error) {
        console.error('Error fetching sidebar pages:', error);
        setSidebarPages([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSidebarPages();
    }
  }, [user]);

  // Get menu items from database pages with enhanced filtering
  const getMenuItems = () => {
    if (loading || !sidebarPages.length) {
      return [];
    }

    // Convert database pages to menu items format with enhanced labeling
    const menuItems = sidebarPages.map(page => {
      // Enhanced label formatting for owner users
      let label = page.pageName;
      if (user?.role === 'owner' && page.pageName !== 'Dashboard') {
        // Remove "My" prefix if it already exists to avoid duplication
        const cleanName = page.pageName.replace(/^My\s+/, '');
        label = `My ${cleanName}`;
      }

      return {
        path: page.pageUrl,
        icon: page.pageIcon,
        label: label,
        pageName: page.pageName,
        displayOrder: page.displayOrder,
        requiredPermission: `${page.pageName.toLowerCase().replace(/\s+/g, '_').replace(/&/g, '')}.view`
      };
    });

    // Sort by display order to maintain consistent ordering
    menuItems.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Enhanced Dynamic Sidebar Debug:', {
        userRole: user?.role,
        userRoleId: user?.roleId,
        databasePages: sidebarPages.length,
        menuItems: menuItems.length,
        menuItemPaths: menuItems.map(item => item.path),
        menuItemLabels: menuItems.map(item => item.label),
        loading,
        hasPermissionContext: !!hasPermission
      });
    }

    return menuItems;
  };

  const menuItems = getMenuItems();

  // Loading indicator for sidebar items
  const renderLoadingItems = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={index} className="flex items-center px-4 py-3 text-gray-300 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-md bg-slate-700/50 animate-pulse mr-3"></div>
        {isOpen && (
          <div className="w-32 h-5 bg-slate-700/50 animate-pulse rounded"></div>
        )}
      </div>
    ));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation even if logout fails
      navigate("/login");
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white h-screen ${
        isOpen ? "w-80" : "w-20"
      } transition-all duration-300 fixed left-0 top-0 shadow-xl overflow-hidden z-30`}
    >
      <SidebarPattern />
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-teal-800 to-slate-800">
        {isOpen ? (
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-white">
              SENTRIX Real Estate
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <p className="text-xs text-teal-300">
                {user?.role === 'owner' ? 'Owner Portal' : 'Admin Portal'}
              </p>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                user?.role === 'admin'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {user?.role?.toUpperCase() || 'USER'}
              </span>
            </div>
            {user?.firstName && (
              <p className="text-xs text-gray-400 mt-1">
                Welcome, {user.firstName}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-white">
              {user?.role === 'owner' ? 'OP' : 'AP'}
            </h1>
            <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
              user?.role === 'admin' ? 'bg-red-400' : 'bg-blue-400'
            }`}></div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-teal-300 transition-all duration-200 p-1 rounded-full hover:bg-slate-700/50"
        >
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {loading ? (
            renderLoadingItems()
          ) : menuItems.length === 0 ? (
            // No pages available fallback
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm">No pages available</p>
                <p className="text-xs mt-1">Contact administrator</p>
              </div>
            </div>
          ) : (
            menuItems
              .filter(item => {
                // Additional permission check using permission context
                if (item.requiredPermission && hasPermission) {
                  return hasPermission(item.requiredPermission);
                }
                return true; // Show item if no specific permission required
              })
              .map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md border-l-4 border-teal-400"
                    : item.highlight
                    ? "text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md"
                    : "text-gray-300 hover:bg-slate-800/50 hover:text-teal-300 hover:translate-x-1 hover:border-l-4 hover:border-teal-500/50"
                }`}
                title={`Navigate to ${item.label}`}
              >
                <span className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {item.icon === "grid" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    )}
                    {item.icon === "users" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    )}
                    {item.icon === "building" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    )}
                    {item.icon === "home" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    )}
                    {item.icon === "briefcase" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    )}
                    {item.icon === "credit-card" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    )}
                    {item.icon === "video" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    )}
                    {item.icon === "tools" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                    )}
                    {item.icon === "document" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    )}
                    {item.icon === "receipt" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                      />
                    )}
                    {item.icon === "folder" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    )}
                    {item.icon === "user-group" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    )}
                    {item.icon === "chat" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    )}
                    {/* {item.icon === "shield" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    )} */}
                  </svg>
                </span>
                {isOpen && (
                  <div className="ml-3">
                    <span className="block font-medium">{item.label}</span>
                    {item.description && (
                      <span className="text-xs opacity-75">
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          )))}
        </ul>
      </nav>

      {/* User Info Section */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        {isOpen && user && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email
                  }
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded-full ${
                user?.role === 'admin'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {user?.role?.toUpperCase() || 'USER'}
              </span>
              <div className="text-xs text-gray-500">
                {menuItems.length} pages
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-700 bg-gradient-to-r from-slate-800 to-teal-800">
        <button
          onClick={handleLogout}
          className="flex items-center p-2 text-gray-300 hover:text-teal-300 transition-colors duration-200 rounded-lg hover:bg-slate-800/50 w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {isOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
