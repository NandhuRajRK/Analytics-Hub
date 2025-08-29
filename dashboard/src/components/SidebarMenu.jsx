/**
 * Sidebar Menu Component
 *
 * This component provides the main navigation sidebar for the portfolio dashboard.
 * It includes collapsible functionality for mobile responsiveness and hover-based
 * expansion when collapsed.
 *
 * Features:
 * - Responsive navigation with collapsible sidebar
 * - Hover-based expansion when collapsed
 * - Active route highlighting
 * - Accessible navigation with ARIA labels
 * - Smooth animations and transitions
 */

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import './SidebarMenu.css';

/**
 * Drawer Arrow Icon Component
 *
 * Renders a directional arrow that changes based on collapsed state.
 * Used for expand/collapse buttons in the sidebar.
 *
 * @param {boolean} collapsed - Whether the sidebar is collapsed
 * @returns {JSX.Element} SVG arrow icon pointing in appropriate direction
 */
function DrawerArrow({ collapsed }) {
  return collapsed ? (
    // Arrow pointing right when collapsed (expand action)
    <svg height="20" viewBox="0 0 20 20" width="20">
      <path
        d="M8 5l5 5-5 5"
        fill="none"
        stroke="#2563eb"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  ) : (
    // Arrow pointing left when expanded (collapse action)
    <svg height="20" viewBox="0 0 20 20" width="20">
      <path
        d="M12 5l-5 5 5 5"
        fill="none"
        stroke="#2563eb"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Main Sidebar Menu Component
 *
 * Provides the primary navigation interface with collapsible functionality.
 * Automatically shows expand button on hover when collapsed for better UX.
 *
 * @param {boolean} collapsed - Whether the sidebar is currently collapsed
 * @param {Function} setCollapsed - Function to toggle collapsed state
 * @returns {JSX.Element} Navigation sidebar with appropriate state
 */
export default function SidebarMenu({ collapsed, setCollapsed }) {
  // State to control when to show the expand button
  const [showExpand, setShowExpand] = useState(false);

  /**
   * Hover-based expansion logic
   * Shows expand button when user hovers near left edge of screen
   */
  useEffect(() => {
    if (collapsed) {
      const onMove = (e) => {
        // Show expand button when mouse is within 20px of left edge
        if (e.clientX <= 20) {
          setShowExpand(true);
        } else {
          setShowExpand(false);
        }
      };

      // Add mouse move listener to detect hover near left edge
      window.addEventListener('mousemove', onMove);

      // Cleanup: remove listener on unmount
      return () => window.removeEventListener('mousemove', onMove);
    }
  }, [collapsed]);

  // Render collapsed state with hover-based expand button
  if (collapsed) {
    return (
      <>
        {/* Expand button that appears on hover */}
        {showExpand && (
          <button
            aria-label="Expand sidebar"
            className="sidebar-expand-btn"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
          >
            <DrawerArrow collapsed={true} />
          </button>
        )}
      </>
    );
  }

  // Render expanded sidebar with full navigation
  return (
    <nav className={`sidebar-menu${collapsed ? ' collapsed' : ''}`}>
      {/* Sidebar header with title and collapse button */}
      <div className="sidebar-title-row">
        <div className="sidebar-title">Analytics Hub</div>
        <button
          aria-label="Collapse sidebar"
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(true)}
          title="Collapse"
        >
          <DrawerArrow collapsed={false} />
        </button>
      </div>

      {/* Navigation links with active state highlighting */}
      {/* Main dashboard view */}
      <NavLink
        aria-label="Portfolio-Program"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        end
        to="/"
      >
        Portfolio-Program
      </NavLink>

      {/* Department and project management */}
      <NavLink
        aria-label="Department-Project"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        to="/departments"
      >
        Department-Project
      </NavLink>

      {/* Project dependency visualization */}
      <NavLink
        aria-label="Dependency Graph"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        to="/dependencies"
      >
        Dependency Graph
      </NavLink>

      {/* Budget and financial management */}
      <NavLink
        aria-label="Budget & Finance"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        to="/budget"
      >
        Budget & Finance
      </NavLink>

      {/* Advanced data visualization */}
      <NavLink
        aria-label="Advanced Charts"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        to="/advanced-charts"
      >
        Advanced Charts
      </NavLink>

      {/* DevOps analytics and monitoring */}
      <NavLink
        aria-label="DevOps Analytics"
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        to="/devops"
      >
        DevOps Analytics
      </NavLink>
    </nav>
  );
}
