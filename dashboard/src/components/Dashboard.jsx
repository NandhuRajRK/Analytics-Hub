/**
 * Portfolio Dashboard - Main Dashboard Component
 * 
 * This is the primary dashboard interface that displays portfolio overview,
 * project data, and provides filtering and visualization capabilities.
 * 
 * Key Features:
 * - Portfolio hierarchy display (Portfolio > Program > Projects)
 * - Data filtering and search functionality
 * - Timeline visualization with multiple formats
 * - Project status tracking with color coding
 * - AI-powered insights integration
 * - Export functionality for reports
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { loadCSV } from '../dataLoader';
import PortfolioFilter from './PortfolioFilter';
import ExportDropdown from './ExportDropdown';
import AISidePanel from './AISidePanel';

// Import new utilities and constants
import { STATUS_COLORS, GANTT_CONFIG, UI_CONFIG } from '../constants';
import { generateTimelineLabels, calculateDateRange } from '../utils/dateUtils';
import { usePortfolioData } from '../hooks/usePortfolioData';

// Import UI components
import LoadingSpinner from './LoadingSpinner';

import './Dashboard.css';

/**
 * Chevron icon component for expandable sections
 * Rotates based on expanded state
 * 
 * @param {boolean} expanded - Whether the section is expanded
 * @returns {JSX.Element} SVG chevron icon
 */
function Chevron({ expanded }) {
  return (
    <svg 
      className={`chevron${expanded ? ' expanded' : ''}`} 
      width="16" 
      height="16" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M7 8l3 3 3-3" 
        stroke="#2563eb" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Returns the appropriate color for project status
 * Provides visual consistency across the dashboard
 * 
 * @param {string} status - Project status string
 * @returns {string} Hex color code for the status
 */
function getStatusColor(status) {
  const statusLower = (status || '').toLowerCase();
  
  switch (statusLower) {
    case 'on track': return STATUS_COLORS.ON_TRACK;
    case 'delayed': return STATUS_COLORS.DELAYED;
    case 'completed': return STATUS_COLORS.COMPLETED;
    case 'at risk': return STATUS_COLORS.AT_RISK;
    default: return STATUS_COLORS.DEFAULT;
  }
}

function GanttBar({ G0, G5_Previous, G5_Current, min, max, details, status, showTodayLine }) {
  const [hover, setHover] = useState(false);
  const total = max - min;
  const prevStart = (new Date(G0) - min) / total * 100;
  const prevWidth = (new Date(G5_Previous) - new Date(G0)) / total * 100;
  const currStart = (new Date(G0) - min) / total * 100;
  const currWidth = (new Date(G5_Current) - new Date(G0)) / total * 100;
  const currColor = getStatusColor(status);
  
  // Calculate today's position
  const today = new Date();
  const todayPosition = ((today - min) / total) * 100;
  
  return (
    <div className="gantt-bar-cell"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative' }}
    >
      <div
        className="gantt-bar gantt-bar-previous"
        style={{ 
          left: `${prevStart}%`, 
          width: `${prevWidth}%`, 
          background: '#222', 
          height: GANTT_CONFIG.PREVIOUS_BAR_HEIGHT, 
          top: 16, 
          zIndex: GANTT_CONFIG.Z_INDEX.PREVIOUS_BAR 
        }}
      />
      <div
        className="gantt-bar gantt-bar-current"
        style={{ 
          left: `${currStart}%`, 
          width: `${currWidth}%`, 
          background: currColor, 
          height: GANTT_CONFIG.CURRENT_BAR_HEIGHT, 
          top: 4, 
          zIndex: GANTT_CONFIG.Z_INDEX.CURRENT_BAR 
        }}
      />
      {showTodayLine && todayPosition >= 0 && todayPosition <= 100 && (
        <div
          className="today-line"
          style={{
            position: 'absolute',
            left: `${todayPosition}%`,
            top: 0,
            bottom: 0,
            width: GANTT_CONFIG.TODAY_LINE.WIDTH,
            background: GANTT_CONFIG.TODAY_LINE.COLOR,
            zIndex: GANTT_CONFIG.Z_INDEX.TODAY_LINE,
            boxShadow: GANTT_CONFIG.TODAY_LINE.SHADOW
          }}
          title="Today"
        />
      )}
      {hover && (
        <div style={{
          position: 'absolute',
          top: 32,
          left: 0,
          background: '#fff',
          border: '1.5px solid #e5e7eb',
          borderRadius: UI_CONFIG.TOOLTIP.BORDER_RADIUS,
          boxShadow: UI_CONFIG.TOOLTIP.SHADOW,
          padding: UI_CONFIG.TOOLTIP.PADDING,
          fontSize: UI_CONFIG.TOOLTIP.FONT_SIZE,
          zIndex: GANTT_CONFIG.Z_INDEX.TOOLTIP,
          minWidth: UI_CONFIG.TOOLTIP.MIN_WIDTH
        }}>
          <div><b>G0:</b> {G0}</div>
          <div><b>G5 Previous:</b> {G5_Previous}</div>
          <div><b>G5 Current:</b> {G5_Current}</div>
          {status && <div><b>Status:</b> {status}</div>}
          {details && <div style={{ marginTop: 4 }}><b>Details:</b> {details}</div>}
        </div>
      )}
    </div>
  );
}

function PortfolioCards({ portfolios, selected, onSelect }) {
  return (
    <div className="portfolio-cards-row">
      <div
        className={`portfolio-card${selected === 'All' ? ' selected' : ''}`}
        onClick={() => onSelect('All')}
      >
        All
      </div>
      {portfolios.map(p => (
        <div
          key={p}
          className={`portfolio-card${selected === p ? ' selected' : ''}`}
          onClick={() => onSelect(p)}
        >
          {p}
        </div>
      ))}
    </div>
  );
}

function StatusFilter({ statuses, selectedStatuses, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusToggle = (status) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStatuses.length === statuses.length) {
      onStatusChange([]);
    } else {
      onStatusChange([...statuses]);
    }
  };

  const selectedText = selectedStatuses.length === 0 
    ? 'All' 
    : selectedStatuses.length === 1 
      ? selectedStatuses[0] 
      : `${selectedStatuses.length} Statuses`;

  return (
    <div className="status-filter-container">
      <label className="filter-label">Status:</label>
      <div className="custom-select" ref={dropdownRef}>
        <div 
          className="select-header"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedText}
          <svg className="select-arrow" width="12" height="12" viewBox="0 0 12 12">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {isOpen && (
          <div className="select-dropdown">
            <div className="select-option" onClick={handleSelectAll}>
              {selectedStatuses.length === statuses.length ? 'Deselect All' : 'Select All'}
            </div>
            {statuses.map(status => (
              <div 
                key={status} 
                className={`select-option${selectedStatuses.includes(status) ? ' selected' : ''}`}
                onClick={() => handleStatusToggle(status)}
              >
                {status}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ sidebarCollapsed, isAIPanelOpen, setIsAIPanelOpen }) {
  // Use the custom hook for portfolio data management
  const {
    data: projects,
    loading,
    error,
    selectedPortfolio,
    setSelectedPortfolio,
    selectedProgram,
    setSelectedProgram,
    searchTerm,
    setSearchTerm,
    selectedStatuses,
    setSelectedStatuses,
    timelineFormat,
    setTimelineFormat,
    groupedData,
    portfolioNames,
    programNames,
    statusValues,
    filteredData,
    dateRange,
    expanded,
    isExpanded,
    toggleExpanded,
    resetFilters
  } = usePortfolioData('/data/demo.csv');

  // State for timeline format
  const [timelineFormatLocal, setTimelineFormatLocal] = useState('months');

  // Update local timeline format when hook timeline format changes
  useEffect(() => {
    setTimelineFormatLocal(timelineFormat);
  }, [timelineFormat]);

  // Handle timeline format change
  const handleTimelineFormatChange = (format) => {
    setTimelineFormatLocal(format);
    setTimelineFormat(format);
  };

  // Get date range from the hook - safely handle undefined dateRange
  const { minDate, maxDate } = dateRange || { minDate: new Date(), maxDate: new Date() };

  // Generate timeline labels using utility function - safely handle dates
  const timelineLabels = useMemo(() => {
    if (!minDate || !maxDate) return [];
    return generateTimelineLabels(minDate, maxDate, timelineFormatLocal);
  }, [minDate, maxDate, timelineFormatLocal]);

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner 
          size="large" 
          text="Loading portfolio data..." 
          variant="ring"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // No data state - check both projects array and filtered data
  if (!projects || projects.length === 0) {
    return (
      <div className="dashboard-no-data">
        <h2>No Data Available</h2>
        <p>No portfolio data found. Please check your data source.</p>
      </div>
    );
  }

  // Render rows recursively
  const renderRows = () => {
    let rows = [];
    
    // Safely handle filteredData - use filtered data instead of groupedData
    if (!filteredData || filteredData.length === 0) {
      return (
        <tr>
          <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
            No data to display
          </td>
        </tr>
      );
    }
    
    // Create grouped structure from filtered data instead of all data
    const groupedFilteredData = {};
    filteredData.forEach(project => {
      // Create portfolio level if it doesn't exist
      if (!groupedFilteredData[project.Portfolio]) {
        groupedFilteredData[project.Portfolio] = {};
      }
      
      // Create program level if it doesn't exist
      if (!groupedFilteredData[project.Portfolio][project.Program]) {
        groupedFilteredData[project.Portfolio][project.Program] = [];
      }
      
      // Add project to the appropriate program
      groupedFilteredData[project.Portfolio][project.Program].push(project);
    });
    
    // Safely handle groupedFilteredData
    if (Object.keys(groupedFilteredData).length === 0) {
      return (
        <tr>
          <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
            No data to display
          </td>
        </tr>
      );
    }
    
    Object.entries(groupedFilteredData).forEach(([portfolio, programs]) => {
      const pKey = `portfolio-${portfolio}`;
      rows.push(
        <tr key={pKey} className="group-row portfolio-row">
          <td className="group-label" style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => toggleExpanded(pKey)}>
            <Chevron expanded={isExpanded(pKey)} /> {portfolio}
          </td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      );
      if (isExpanded(pKey)) {
        Object.entries(programs).forEach(([program, projs]) => {
          const prKey = `${pKey}-program-${program}`;
          rows.push(
            <tr key={prKey} className="group-row program-row">
              <td className="group-label" style={{ fontWeight: 'bold', paddingLeft: UI_CONFIG.INDENTATION.PROGRAM_LEVEL, cursor: 'pointer' }} onClick={() => toggleExpanded(prKey)}>
                <Chevron expanded={isExpanded(prKey)} /> {program}
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          );
          if (isExpanded(prKey)) {
            projs.forEach(proj => {
              rows.push(
                <tr key={proj.BPM_ID} className="project-row">
                  <td style={{ paddingLeft: UI_CONFIG.INDENTATION.PROJECT_LEVEL }}>{proj.Project}</td>
                  <td>{proj.BPM_ID}</td>
                  <td>{proj.Project_Manager}</td>
                  <td>
                    <GanttBar
                      G0={proj.G0}
                      G5_Previous={proj.G5_Previous}
                      G5_Current={proj.G5_Current}
                      min={minDate}
                      max={maxDate}
                      details={proj.Other_Detail}
                      status={proj.Status}
                      showTodayLine={false}
                    />
                  </td>
                </tr>
              );
            });
          }
        });
      }
    });
    return rows;
  };

  return (
    <>
      {/* AI Side Panel */}
      <AISidePanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        projects={projects}
        selectedPortfolio={selectedPortfolio}
        selectedStatuses={selectedStatuses}
      />
      
      <div className="dashboard-main-bg" style={{ marginLeft: sidebarCollapsed ? 0 : 200 }}>
        <div className="dashboard-container">
        
        <div className="dashboard-title">
          <div className="title-content">
            <h1>Portfolio Dashboard</h1>
            <p>Comprehensive project portfolio management with timeline visualization</p>
          </div>
          <div className="title-export">
            <ExportDropdown 
              element={() => document.querySelector('.dashboard-container')} 
              filename="Complete_Portfolio_Dashboard"
            />
          </div>
        </div>
        
        {/* AI Assistant Toggle - Right Side */}
        <div className={`ai-assistant-toggle-container ${isAIPanelOpen ? 'hidden' : ''}`}>
          <button
            className="ai-assistant-toggle-btn"
            onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
            aria-label={isAIPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
            title={isAIPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            <span className="ai-assistant-icon">🤖</span>
          </button>
        </div>
        
        <div className="filters-section">
          <div className="filter-row">
            <PortfolioFilter
                portfolios={portfolioNames}
              selected={selectedPortfolio}
              onSelect={setSelectedPortfolio}
            />
            <StatusFilter
                statuses={statusValues}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
            />
          </div>
        </div>

        <div className="portfolio-section-header">
        </div>
        <PortfolioCards
            portfolios={portfolioNames}
          selected={selectedPortfolio}
          onSelect={setSelectedPortfolio}
        />
        
        <div className="legend-section">
          <div className="legend-header">
          </div>
          <div className="legend-row">
            <div className="legend-item"><span className="legend-bar prev"></span> Previous Timeline</div>
            <div className="legend-item"><span className="legend-bar ontrack"></span> On Track</div>
            <div className="legend-item"><span className="legend-bar delayed"></span> Delayed</div>
            <div className="legend-item"><span className="legend-bar completed"></span> Completed</div>
            <div className="legend-item"><span className="legend-bar atrisk"></span> At Risk</div>
            <div className="legend-item"><span className="legend-bar today"></span> Today Reference</div>
            
            <div className="timeline-format-selector">
              <label className="filter-label">Timeline Format:</label>
              <select 
                  value={timelineFormatLocal} 
                  onChange={(e) => handleTimelineFormatChange(e.target.value)}
                className="timeline-format-select"
              >
                <option value="months">Months</option>
                <option value="quarters">Quarters</option>
                <option value="years">Years</option>
              </select>
            </div>
            </div>
        </div>
        
        <div className="dashboard-table-wrapper">
          <div className="chart-header-with-export">
          </div>
            {filteredData.length === 0 ? (
            <div className="no-data-message">No data to display</div>
          ) : (
            <div style={{ position: 'relative' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>BPM ID</th>
                    <th>Project Manager</th>
                    {timelineLabels.length > 0 && <th className="gantt-header" colSpan={1}>
                      <div className="gantt-timeline-labels" style={{ position: 'relative' }}>
                        {timelineLabels.map((label, index) => {
                          // For months, create evenly spaced labels that align with the timeline
                          let labelPosition;
                          let displayLabel;
                          
                            if (timelineFormatLocal === 'months') {
                            // Evenly space months across the timeline
                            labelPosition = (index / (timelineLabels.length - 1)) * 100;
                            displayLabel = label.split(' ')[0];
                            
                            // Show year for January months (except first)
                            const showYear = index > 0 && label.includes('Jan');
                            const year = label.split(' ')[1];
                            
                            return (
                              <span 
                                key={index} 
                                className="gantt-timeline-label"
                                style={{
                                  position: 'absolute',
                                  left: `${labelPosition}%`,
                                  transform: 'translateX(-50%)',
                                  minWidth: 'auto'
                                }}
                              >
                                {displayLabel}
                                {showYear && (
                                  <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.7 }}>
                                    {year}
                                  </div>
                                )}
                              </span>
                            );
                          } else {
                            // For other formats, use the same logic
                            labelPosition = (index / (timelineLabels.length - 1)) * 100;
                            
                            return (
                              <span 
                                key={index} 
                                className="gantt-timeline-label"
                                style={{
                                  position: 'absolute',
                                  left: `${labelPosition}%`,
                                  transform: 'translateX(-50%)',
                                  minWidth: 'auto'
                                }}
                              >
                                  {timelineFormatLocal === 'quarters' ? label.split(' ')[0] : 
                                   timelineFormatLocal === 'weeks' ? label.split(' ')[0] : 
                                 label}
                              </span>
                            );
                          }
                        })}
                      </div>
                    </th>}
                  </tr>
                </thead>
                <tbody>
                  {renderRows()}
                </tbody>
              </table>
              
              {/* Global Today Line - Integrated within dashboard table */}
              {(() => {
                const today = new Date();
                const total = maxDate - minDate;
                const todayPosition = ((today - minDate) / total) * 100;
                
                // Always show the today line, even if it's outside the project range
                let displayPosition = todayPosition;
                if (todayPosition < 0) {
                  displayPosition = 0; // Position at the very left if today is before projects
                } else if (todayPosition > 100) {
                  displayPosition = 100; // Position at the very right if today is after projects
                }
                
                return (
                  <div
                    className="global-today-line"
                    style={{
                      position: 'absolute',
                      left: `calc(75% + ${displayPosition}% * 0.25)`,
                      top: '40px',
                      bottom: '0',
                      width: '3px',
                      background: 'transparent',
                      zIndex: 20,
                      pointerEvents: 'none',
                      borderLeft: '3px dotted #dc2626'
                    }}
                    title={`Today: ${today.toLocaleDateString()} - ${todayPosition > 100 ? 'After project timeline' : todayPosition < 0 ? 'Before project timeline' : 'Within project timeline'}`}
                  >
                    <div className="today-date-label">
                      {today.toLocaleDateString()}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
} 