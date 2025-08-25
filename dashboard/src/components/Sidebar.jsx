import { useEffect, useRef } from "react";
import { useSidebar } from "../hooks/useSidebar";
import { useDashboard } from "../hooks/useDashboard";
import { useLocation } from "react-router-dom";
import {
  HomeIcon,
  CalendarIcon,
  SettingsIcon,
  UsersIcon,
  LogoutIcon,
} from "../assets/icons";

const Sidebar = () => {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    isSidebarVisible,
  } = useSidebar();
  const { setDashboardExpanded } = useDashboard();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: HomeIcon, label: "Dashboard", ariaLabel: "Go to dashboard" },
    { path: "/calendar", icon: CalendarIcon, label: "Calendar", ariaLabel: "Go to calendar" },
    { path: "/users", icon: UsersIcon, label: "Users", ariaLabel: "Go to users" },
    { path: "/settings", icon: SettingsIcon, label: "Settings", ariaLabel: "Go to settings" },
    { path: "/logout", icon: LogoutIcon, label: "Logout", ariaLabel: "Logout" },
  ];

  const handleNavItemClick = (path) => {
    if (path === "/logout") {
      // Handle logout logic
      console.log("Logging out...");
      return;
    }
    setSidebarCollapsed(true);
    setDashboardExpanded(false);
    // Navigate to the path
    // This would typically use react-router-dom's navigate function
    // For now, we'll just log the navigation
    console.log(`Navigating to: ${path}`);
  };

  const sidebarRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 700) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!sidebarCollapsed) {
      setDashboardExpanded(false);
    }
  }, [sidebarCollapsed, setDashboardExpanded]);

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
      ref={sidebarRef}
      aria-hidden={sidebarCollapsed}
    >
      <div className="sidebar-header">
        <h2>App Name</h2>
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? "→" : "←"}
        </button>
      </div>

      <div className="sidebar-title-row">
        <span className="sidebar-title">Navigation</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li
              key={item.path}
              onClick={() => handleNavItemClick(item.path)}
              className={location.pathname === item.path ? "active" : ""}
              tabIndex={0}
              aria-label={item.ariaLabel}
              title={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p>Version 1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar; 