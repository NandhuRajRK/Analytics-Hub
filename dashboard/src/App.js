/**
 * Portfolio Dashboard - Main Application Component
 * 
 * This is the root component that sets up the application structure, routing,
 * and manages global state for the sidebar and AI panel.
 * 
 * Features:
 * - React Router setup for navigation between different dashboard views
 * - Responsive sidebar management with auto-collapse on mobile
 * - Global state management for sidebar and AI panel visibility
 * - Mobile-first responsive design
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all dashboard components
import SidebarMenu from './components/SidebarMenu';
import Dashboard from './components/Dashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import DependencyGraph from './components/DependencyGraph';
import BudgetFinance from './components/BudgetFinance';
import AdvancedCharts from './components/AdvancedCharts';

// Import error boundary for graceful error handling
import ErrorBoundary from './components/ErrorBoundary';

// Import global styles
import './components/Dashboard.css';

function App() {
  // Global state management
  // Controls whether the sidebar is collapsed (mobile view)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Controls whether the AI insights panel is open
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  /**
   * Responsive sidebar management
   * Automatically collapses sidebar on mobile devices for better UX
   */
  useEffect(() => {
    const handleResize = () => {
      // Collapse sidebar on screens smaller than configured mobile breakpoint
      if (window.innerWidth < 700) {
        setSidebarCollapsed(true);
      }
    };
    
    // Set initial state based on current screen size
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener("resize", handleResize);
    
    // Cleanup: remove event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        {/* Main application container with flexbox layout */}
        <div style={{ display: 'flex' }}>
          {/* Left sidebar navigation */}
          <SidebarMenu 
            collapsed={sidebarCollapsed} 
            setCollapsed={setSidebarCollapsed} 
          />
          
          {/* Main content area */}
          <div className="app-main-content" style={{ flex: 1 }}>
            {/* Application routing configuration */}
            <Routes>
              {/* Home/Dashboard route - Main portfolio overview */}
              <Route path="/" element={
                <Dashboard 
                  sidebarCollapsed={sidebarCollapsed} 
                  isAIPanelOpen={isAIPanelOpen}
                  setIsAIPanelOpen={setIsAIPanelOpen}
                />
              } />
              
              {/* Department-specific dashboard view */}
              <Route path="/departments" element={
                <DepartmentDashboard sidebarCollapsed={sidebarCollapsed} />
              } />
              
              {/* Project dependency visualization */}
              <Route path="/dependencies" element={
                <DependencyGraph sidebarCollapsed={sidebarCollapsed} />
              } />
              
              {/* Budget and financial management view */}
              <Route path="/budget" element={
                <BudgetFinance sidebarCollapsed={sidebarCollapsed} />
              } />
              
              {/* Advanced data visualization and charts */}
              <Route path="/advanced-charts" element={
                <AdvancedCharts sidebarCollapsed={sidebarCollapsed} />
              } />
            </Routes>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
