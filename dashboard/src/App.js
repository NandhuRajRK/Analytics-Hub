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

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AdvancedCharts from './components/AdvancedCharts';
import BudgetFinance from './components/BudgetFinance';
import Dashboard from './components/Dashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import DependencyGraph from './components/DependencyGraph';
import DevOpsAnalytics from './components/DevOpsAnalytics';
import ErrorBoundary from './components/ErrorBoundary';
import SidebarMenu from './components/SidebarMenu';

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
    window.addEventListener('resize', handleResize);

    // Cleanup: remove event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
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
              <Route element={
                <Dashboard
                  isAIPanelOpen={isAIPanelOpen}
                  setIsAIPanelOpen={setIsAIPanelOpen}
                  sidebarCollapsed={sidebarCollapsed}
                />
              } path="/" />

              {/* Department-specific dashboard view */}
              <Route element={
                <DepartmentDashboard sidebarCollapsed={sidebarCollapsed} />
              } path="/departments" />

              {/* Project dependency visualization */}
              <Route element={
                <DependencyGraph sidebarCollapsed={sidebarCollapsed} />
              } path="/dependencies" />

              {/* Budget and financial management view */}
              <Route element={
                <BudgetFinance sidebarCollapsed={sidebarCollapsed} />
              } path="/budget" />

              {/* Advanced data visualization and charts */}
              <Route element={
                <AdvancedCharts sidebarCollapsed={sidebarCollapsed} />
              } path="/advanced-charts" />

              {/* DevOps analytics and monitoring */}
              <Route element={
                <DevOpsAnalytics sidebarCollapsed={sidebarCollapsed} />
              } path="/devops" />
            </Routes>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
