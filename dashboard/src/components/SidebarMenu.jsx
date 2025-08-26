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

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// Import constants for configuration
import { UI_CONFIG } from '../constants';

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
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path
        d="M8 5l5 5-5 5"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ) : (
    // Arrow pointing left when expanded (collapse action)
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path
        d="M12 5l-5 5 5 5"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Timeline Icon Component
 *
 * Renders a custom timeline icon for navigation items.
 * Provides visual consistency and accessibility.
 *
 * @param {string} title - Tooltip text for the icon
 * @returns {JSX.Element} Custom timeline SVG icon
 */
function TimelineIcon({ title }) {
  return (
    <span className="sidebar-icon" title={title} aria-label={title}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Timeline container */}
        <rect x="3" y="7" width="18" height="7" rx="2" fill="#e6edfa" stroke="#2563eb" />
        {/* Timeline markers */}
        <rect x="6" y="10" width="6" height="2" rx="1" fill="#2563eb" stroke="#2563eb" />
        <rect x="14" y="10" width="4" height="2" rx="1" fill="#2563eb" stroke="#2563eb" />
      </svg>
    </span>
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
   * Only active when sidebar is collapsed
   */
  useEffect(() => {
    if (!collapsed) return; // Only active when collapsed

    const onMove = (e) => {
      // Show expand button when mouse is within configured hover area of left edge
      if (e.clientX < UI_CONFIG.SIDEBAR_HOVER_AREA) {
        setShowExpand(true);
      } else {
        setShowExpand(false);
      }
    };

    // Add mouse move listener
    window.addEventListener('mousemove', onMove);

    // Cleanup: remove listener on unmount
    return () => window.removeEventListener('mousemove', onMove);
  }, [collapsed]);

  // Render collapsed state with hover-based expand button
  if (collapsed) {
    return (
      <>
        {/* Expand button that appears on hover */}
        {showExpand && (
          <button
            className="sidebar-expand-btn"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
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
        <div className="sidebar-title">R&D Analytics Hub</div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(true)}
          title="Collapse"
          aria-label="Collapse sidebar"
        >
          <DrawerArrow collapsed={false} />
        </button>
      </div>

      {/* Navigation links with active state highlighting */}
      {/* Main dashboard view */}
      <NavLink
        to="/"
        end
        className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
        aria-label="Portfolio-Program"
      >
        Portfolio-Program
      </NavLink>

      {/* Department and project management */}
      <NavLink
        to="/departments"
        className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
        aria-label="Department-Project"
      >
        Department-Project
      </NavLink>

      {/* Project dependency visualization */}
      <NavLink
        to="/dependencies"
        className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
        aria-label="Dependency Graph"
      >
        Dependency Graph
      </NavLink>

      {/* Budget and financial management */}
      <NavLink
        to="/budget"
        className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
        aria-label="Budget & Finance"
      >
        Budget & Finance
      </NavLink>

      {/* Advanced data visualization */}
      <NavLink
        to="/advanced-charts"
        className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
        aria-label="Advanced Charts"
      >
        Advanced Charts
      </NavLink>
    </nav>
  );
} 