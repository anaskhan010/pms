import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SidebarPattern from "./SidebarPattern";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    onToggle && onToggle(!isOpen);
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    if (user?.role === "owner") {
      return [
        { path: "/owner/dashboard", icon: "grid", label: "Dashboard" },
        { path: "/owner/properties", icon: "building", label: "My Properties" },
        { path: "/owner/tenants", icon: "users", label: "My Tenants" },
        {
          path: "/owner/financial",
          icon: "credit-card",
          label: "Financial Reports",
        },
        { path: "/owner/maintenance", icon: "tools", label: "Maintenance" },
        {
          path: "/owner/billing",
          icon: "document",
          label: "Billing & Payments",
        },
        { path: "/owner/messages", icon: "chat", label: "Messages" },
      ];
    }

    if (user?.role === "tenant") {
      return [
        { path: "/tenant/dashboard", icon: "grid", label: "Dashboard" },
        { path: "/tenant/properties", icon: "home", label: "My Properties" },
        { path: "/tenant/lease", icon: "document", label: "Lease Management" },
        {
          path: "/tenant/payments",
          icon: "credit-card",
          label: "Payment Center",
        },
        { path: "/tenant/bills", icon: "receipt", label: "Bills & Utilities" },
        { path: "/tenant/maintenance", icon: "tools", label: "Maintenance" },
        { path: "/tenant/documents", icon: "folder", label: "Documents" },
        { path: "/tenant/messages", icon: "chat", label: "Messages" },
      ];
    }

    if (user?.role === "manager") {
      return [
        { path: "/manager/dashboard", icon: "grid", label: "Dashboard" },
        { path: "/manager/properties", icon: "building", label: "Properties" },
        { path: "/manager/units", icon: "home", label: "Units" },
        { path: "/manager/tenants", icon: "users", label: "Tenants" },
        { path: "/manager/owners", icon: "briefcase", label: "Owners" },
        { path: "/manager/contracts", icon: "document", label: "Contracts" },
        {
          path: "/manager/reports",
          icon: "credit-card",
          label: "Financial Reports",
        },
        { path: "/manager/messages", icon: "chat", label: "Messages" },
      ];
    }

    // Default admin menu items
    return [
      { path: "/admin/dashboard", icon: "grid", label: "Dashboard" },
      { path: "/admin/tenants", icon: "users", label: "Tenants" },
      { path: "/admin/buildings", icon: "building", label: "Buildings" },
      { path: "/admin/villas", icon: "home", label: "Villas" },
      { path: "/admin/virtual-demo", icon: "video", label: "Virtual Tour" },
      { path: "/admin/vendors", icon: "briefcase", label: "Vendors" },
      {
        path: "/admin/transactions",
        icon: "credit-card",
        label: "Financial Transactions",
      },
      { path: "/admin/messages", icon: "chat", label: "Messages" },
    ];
  };

  const menuItems = getMenuItems();

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
            {user?.role === "owner" && (
              <p className="text-xs text-teal-300 mt-1">
                Property Owner Portal
              </p>
            )}
            {user?.role === "tenant" && (
              <p className="text-xs text-teal-300 mt-1">Tenant Portal</p>
            )}
            {user?.role === "manager" && (
              <p className="text-xs text-teal-300 mt-1">Manager Portal</p>
            )}
          </div>
        ) : (
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-white">
            {user?.role === "owner"
              ? "PO"
              : user?.role === "tenant"
              ? "TP"
              : user?.role === "manager"
              ? "MP"
              : "AP"}
          </h1>
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
          {menuItems.map((item) => (
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
                    {item.icon === "chat" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    )}
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
          ))}
        </ul>
      </nav>

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
