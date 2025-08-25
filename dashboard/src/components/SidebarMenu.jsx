import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './SidebarMenu.css';

function DrawerArrow({ collapsed }) {
  return collapsed ? (
    <svg width="20" height="20" viewBox="0 0 20 20"><path d="M8 5l5 5-5 5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 20 20"><path d="M12 5l-5 5 5 5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
  );
}

function TimelineIcon({ title }) {
  return (
    <span className="sidebar-icon" title={title} aria-label={title}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="7" rx="2" fill="#e6edfa" stroke="#2563eb" />
        <rect x="6" y="10" width="6" height="2" rx="1" fill="#2563eb" stroke="#2563eb" />
        <rect x="14" y="10" width="4" height="2" rx="1" fill="#2563eb" stroke="#2563eb" />
      </svg>
    </span>
  );
}

export default function SidebarMenu({ collapsed, setCollapsed }) {
  const [showExpand, setShowExpand] = useState(false);

  // Show expand button when hovering near left edge if collapsed
  useEffect(() => {
    if (!collapsed) return;
    const onMove = (e) => {
      if (e.clientX < 24) setShowExpand(true);
      else setShowExpand(false);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [collapsed]);

  if (collapsed) {
    return (
      <>
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

  return (
    <nav className={`sidebar-menu${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-title-row">
        <div className="sidebar-title">R&D Analytics Hub</div>
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(true)} title="Collapse" aria-label="Collapse sidebar">
          <DrawerArrow collapsed={false} />
        </button>
      </div>
      <NavLink to="/" end className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')} aria-label="Portfolio-Program">
        Portfolio-Program
      </NavLink>
      <NavLink to="/departments" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')} aria-label="Department-Project">
        Department-Project
      </NavLink>
              <NavLink to="/dependencies" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')} aria-label="Dependency Graph">
          Dependency Graph
        </NavLink>
        <NavLink to="/budget" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')} aria-label="Budget & Finance">
          Budget & Finance
        </NavLink>
        <NavLink to="/advanced-charts" className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')} aria-label="Advanced Charts">
          Advanced Charts
        </NavLink>
    </nav>
  );
} 