import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // State to track if screen is mobile size
  const [, setIsMobile] = useState(false);

  // Handle sidebar toggle from child component
  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-80" : "ml-20"
        }`}
      >
        <Navbar />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="  mx-auto px-2 sm:px-6 py-4 sm:py-6 md:py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
