import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarMenu from './components/SidebarMenu';
import Dashboard from './components/Dashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import DependencyGraph from './components/DependencyGraph';
import BudgetFinance from './components/BudgetFinance';
import AdvancedCharts from './components/AdvancedCharts';
import './components/Dashboard.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sidebar auto-collapse logic for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 700) {
        setSidebarCollapsed(true);
      }
    };
    
    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <SidebarMenu collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="app-main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="/departments" element={<DepartmentDashboard sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="/dependencies" element={<DependencyGraph sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="/budget" element={<BudgetFinance sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="/advanced-charts" element={<AdvancedCharts sidebarCollapsed={sidebarCollapsed} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
