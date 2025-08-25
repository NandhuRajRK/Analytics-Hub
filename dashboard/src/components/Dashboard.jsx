import React, { useEffect, useState, useRef } from 'react';
import { loadCSV } from '../dataLoader';
import PortfolioFilter from './PortfolioFilter';
import ExportDropdown from './ExportDropdown';

import './Dashboard.css';

function groupData(projects) {
  // Group by Portfolio > Program > Projects
  const portfolios = {};
  projects.forEach(p => {
    if (!portfolios[p.Portfolio]) portfolios[p.Portfolio] = {};
    if (!portfolios[p.Portfolio][p.Program]) portfolios[p.Portfolio][p.Program] = [];
    portfolios[p.Portfolio][p.Program].push(p);
  });
  return portfolios;
}

function generateTimelineLabels(start, end, format) {
  const s = new Date(start);
  const e = new Date(end);
  const labels = [];
  
  switch (format) {
    case 'months':
      let d = new Date(s.getFullYear(), s.getMonth(), 1);
      while (d <= e) {
        labels.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`);
        d.setMonth(d.getMonth() + 1);
      }
      break;
      
    case 'quarters':
      let quarterStart = new Date(s.getFullYear(), Math.floor(s.getMonth() / 3) * 3, 1);
      while (quarterStart <= e) {
        const quarter = Math.floor(quarterStart.getMonth() / 3) + 1;
        labels.push(`Q${quarter} ${quarterStart.getFullYear()}`);
        quarterStart.setMonth(quarterStart.getMonth() + 3);
      }
      break;
      

      
    case 'years':
      let yearStart = new Date(s.getFullYear(), 0, 1);
      while (yearStart <= e) {
        labels.push(yearStart.getFullYear().toString());
        yearStart.setFullYear(yearStart.getFullYear() + 1);
      }
      break;
      
    default:
      let monthD = new Date(s.getFullYear(), s.getMonth(), 1);
      while (monthD <= e) {
        labels.push(`${monthD.toLocaleString('default', { month: 'short' })} ${monthD.getFullYear()}`);
        monthD.setMonth(monthD.getMonth() + 1);
      }
  }
  
  // Filter out labels that would be too close together
  if (format === 'months') {
    const filteredLabels = [];
    const totalDays = (e - s) / (1000 * 60 * 60 * 24);
    
    // If timeline is very long, show every 2nd or 3rd month to avoid crowding
    if (totalDays > 1000) { // More than ~3 years
      for (let i = 0; i < labels.length; i += 2) {
        filteredLabels.push(labels[i]);
      }
    } else if (totalDays > 500) { // More than ~1.5 years
      for (let i = 0; i < labels.length; i += 1) {
        filteredLabels.push(labels[i]);
      }
    } else {
      filteredLabels.push(...labels);
    }
    return filteredLabels;
  }
  
  return labels;
}

function Chevron({ expanded }) {
  return (
    <svg className={`chevron${expanded ? ' expanded' : ''}`} width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 8l3 3 3-3" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'on track': return '#22c55e'; // green
    case 'delayed': return '#ef4444'; // red
    case 'completed': return '#3b82f6'; // blue
    case 'at risk': return '#f59e42'; // orange
    default: return '#a3a3a3'; // gray
  }
}

function GanttBar({ G0, G5_Previous, G5_Current, min, max, details, status, showTodayLine }) {
  const [hover, setHover] = React.useState(false);
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
        style={{ left: `${prevStart}%`, width: `${prevWidth}%`, background: '#222', height: 6, top: 16, zIndex: 1 }}
      />
      <div
        className="gantt-bar gantt-bar-current"
        style={{ left: `${currStart}%`, width: `${currWidth}%`, background: currColor, height: 12, top: 4, zIndex: 2 }}
      />
      {showTodayLine && todayPosition >= 0 && todayPosition <= 100 && (
        <div
          className="today-line"
          style={{
            position: 'absolute',
            left: `${todayPosition}%`,
            top: 0,
            bottom: 0,
            width: '3px',
            background: '#dc2626',
            zIndex: 5,
            boxShadow: '0 0 4px rgba(220, 38, 38, 0.5)'
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
          borderRadius: 8,
          boxShadow: '0 4px 16px #0001',
          padding: 12,
          fontSize: 14,
          zIndex: 10,
          minWidth: 220
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
        className={`portfolio-card${!selected ? ' selected' : ''}`}
        onClick={() => onSelect('')}
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
          <span className="select-value">{selectedText}</span>
          <svg className={`select-arrow ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {isOpen && (
          <div className="select-dropdown">
            <div className="select-option select-all" onClick={handleSelectAll}>
              <input 
                type="checkbox" 
                checked={selectedStatuses.length === statuses.length}
                readOnly
              />
              <span>All</span>
            </div>
            {statuses.map(status => (
              <div 
                key={status} 
                className="select-option"
                onClick={() => handleStatusToggle(status)}
              >
                <input 
                  type="checkbox" 
                  checked={selectedStatuses.includes(status)}
                  readOnly
                />
                <span>{status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ sidebarCollapsed }) {
  const [projects, setProjects] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [allExpanded, setAllExpanded] = useState(true);
  const [timelineFormat, setTimelineFormat] = useState('months');

  useEffect(() => {
    loadCSV(process.env.PUBLIC_URL + '/data/demo.csv', setProjects);
  }, []);

  // Get unique statuses from projects
  const allStatuses = [...new Set(projects.map(p => p.Status).filter(Boolean))];

  // Handle collapse/expand all functionality
  const handleCollapseExpandAll = () => {
    setAllExpanded(prev => !prev);
    
    if (allExpanded) {
      // Collapse all
      setExpanded({});
    } else {
      // Expand all
      const grouped = groupData(selectedPortfolio ? projects.filter(p => p.Portfolio === selectedPortfolio) : projects);
      const newExpanded = {};
      Object.keys(grouped).forEach(portfolio => {
        newExpanded[`portfolio-${portfolio}`] = true;
        Object.keys(grouped[portfolio]).forEach(program => {
          newExpanded[`portfolio-${portfolio}-program-${program}`] = true;
        });
      });
      setExpanded(newExpanded);
    }
  };

  // Expand all portfolios and programs by default when projects or filter changes
  useEffect(() => {
    if (allExpanded) {
      const grouped = groupData(selectedPortfolio ? projects.filter(p => p.Portfolio === selectedPortfolio) : projects);
      const newExpanded = {};
      Object.keys(grouped).forEach(portfolio => {
        newExpanded[`portfolio-${portfolio}`] = true;
        Object.keys(grouped[portfolio]).forEach(program => {
          newExpanded[`portfolio-${portfolio}-program-${program}`] = true;
        });
      });
      setExpanded(newExpanded);
    }
  }, [projects, selectedPortfolio, allExpanded]);

  // Filter projects by portfolio and status
  const filtered = projects.filter(p => {
    const portfolioMatch = !selectedPortfolio || p.Portfolio === selectedPortfolio;
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(p.Status);
    return portfolioMatch && statusMatch;
  });
  
  const grouped = groupData(filtered);
  const portfolios = Object.keys(groupData(projects));

  // Find min/max dates for Gantt based on filtered data
  const allDates = filtered.length > 0 
    ? filtered.flatMap(p => [p.G0, p.G5_Previous, p.G5_Current]).map(d => new Date(d))
    : projects.flatMap(p => [p.G0, p.G5_Previous, p.G5_Current]).map(d => new Date(d));
  
  // Filter out invalid dates and ensure we have valid dates
  const validDates = allDates.filter(date => date instanceof Date && !isNaN(date));
  
  // Debug logging
  console.log('All dates:', allDates);
  console.log('Valid dates:', validDates);
  console.log('Projects:', projects);
  console.log('Filtered:', filtered);
  
  let minDate, maxDate;
  if (validDates.length > 0) {
    minDate = new Date(Math.min(...validDates));
    maxDate = new Date(Math.max(...validDates));
  } else {
    // Fallback to current date if no valid dates found
    minDate = new Date();
    maxDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
  }
  
  // Extend the timeline to show future time beyond today
  const today = new Date();
  const futureBuffer = 6; // Show 6 months into the future
  const extendedMaxDate = new Date(today);
  extendedMaxDate.setMonth(today.getMonth() + futureBuffer);
  
  // Use the later of project end date or extended future date
  if (extendedMaxDate > maxDate) {
    maxDate = extendedMaxDate;
  }
  
  console.log('Min date:', minDate, 'Type:', typeof minDate);
  console.log('Max date:', maxDate, 'Type:', typeof maxDate);
  
  const timelineLabels = generateTimelineLabels(minDate, maxDate, timelineFormat);

  // Expand/collapse helpers
  const isExpanded = (key) => expanded[key];
  const toggle = (key) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  // Render rows recursively
  const renderRows = () => {
    let rows = [];
    Object.entries(grouped).forEach(([portfolio, programs]) => {
      const pKey = `portfolio-${portfolio}`;
      rows.push(
        <tr key={pKey} className="group-row portfolio-row">
          <td className="group-label" style={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={() => toggle(pKey)}>
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
              <td className="group-label" style={{ fontWeight: 'bold', paddingLeft: 24, cursor: 'pointer' }} onClick={() => toggle(prKey)}>
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
                  <td style={{ paddingLeft: 48 }}>{proj.Project}</td>
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
        
        <div className="filters-section">
          <div className="filter-row">
            <PortfolioFilter
              portfolios={portfolios}
              selected={selectedPortfolio}
              onSelect={setSelectedPortfolio}
            />
            <StatusFilter
              statuses={allStatuses}
              selectedStatuses={selectedStatuses}
              onStatusChange={setSelectedStatuses}
            />
          </div>
          
        </div>

        <div className="portfolio-section-header">
        </div>
        <PortfolioCards
          portfolios={portfolios}
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
                value={timelineFormat} 
                onChange={(e) => setTimelineFormat(e.target.value)}
                className="timeline-format-select"
              >
                <option value="months">Months</option>
                <option value="quarters">Quarters</option>
                <option value="years">Years</option>
              </select>
            </div>
            
            <button
              className="collapse-expand-btn"
              aria-label={allExpanded ? "Collapse all" : "Expand all"}
              onClick={handleCollapseExpandAll}
            >
              {allExpanded ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>
        
        <div className="dashboard-table-wrapper">
          <div className="chart-header-with-export">
          </div>
          {filtered.length === 0 ? (
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
                          
                          if (timelineFormat === 'months') {
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
                                {timelineFormat === 'quarters' ? label.split(' ')[0] : 
                                 timelineFormat === 'weeks' ? label.split(' ')[0] : 
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
  );
} 