import { useEffect, useState, useRef } from 'react';

import { loadCSV } from '../dataLoader';

import AISidePanel from './AISidePanel';
import ExportDropdown from './ExportDropdown';

import './Dashboard.css';

function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'on track': return '#22c55e';
    case 'delayed': return '#ef4444';
    case 'completed': return '#3b82f6';
    case 'at risk': return '#f59e42';
    default: return '#a3a3a3';
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
            width: '2px',
            background: '#dc2626',
            zIndex: 3,
            borderLeft: '2px dashed #dc2626',
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
          minWidth: 220,
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
      <label className="filter-label" htmlFor="status-filter">Status:</label>
      <div className="custom-select" ref={dropdownRef}>
        <div
          className="select-header"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Status filter: ${selectedText}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="select-value">{selectedText}</span>
          <svg className={`select-arrow ${isOpen ? 'open' : ''}`} fill="none" height="16" viewBox="0 0 24 24" width="16">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
          </svg>
        </div>
        {isOpen && (
          <div className="select-dropdown">
            <div
              className="select-option select-all"
              onClick={handleSelectAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectAll();
                }
              }}
              role="option"
              tabIndex={0}
              aria-label={selectedStatuses.length === statuses.length ? 'Deselect All' : 'Select All'}
              aria-selected={selectedStatuses.length === statuses.length}
            >
              <input
                checked={selectedStatuses.length === statuses.length}
                readOnly
                type="checkbox"
              />
              <span>All</span>
            </div>
            {statuses.map(status => (
              <div
                className="select-option"
                key={status}
                onClick={() => handleStatusToggle(status)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleStatusToggle(status);
                  }
                }}
                role="option"
                tabIndex={0}
                aria-label={`Select ${status} status`}
                aria-selected={selectedStatuses.includes(status)}
              >
                <input
                  checked={selectedStatuses.includes(status)}
                  readOnly
                  type="checkbox"
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

function generateTimelineLabels(start, end, format) {
  const s = new Date(start);
  const e = new Date(end);
  const labels = [];

  switch (format) {
    case 'months': {
      const d = new Date(s.getFullYear(), s.getMonth(), 1);

      while (d <= e) {
        labels.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`);
        d.setMonth(d.getMonth() + 1);
      }
      break;
    }

    case 'quarters': {
      const quarterStart = new Date(s.getFullYear(), Math.floor(s.getMonth() / 3) * 3, 1);

      while (quarterStart <= e) {
        const quarter = Math.floor(quarterStart.getMonth() / 3) + 1;

        labels.push(`Q${quarter} ${quarterStart.getFullYear()}`);
        quarterStart.setMonth(quarterStart.getMonth() + 3);
      }
      break;
    }

    case 'years': {
      const yearStart = new Date(s.getFullYear(), 0, 1);

      while (yearStart <= e) {
        labels.push(yearStart.getFullYear().toString());
        yearStart.setFullYear(yearStart.getFullYear() + 1);
      }
      break;
    }

    default: {
      const monthD = new Date(s.getFullYear(), s.getMonth(), 1);

      while (monthD <= e) {
        labels.push(`${monthD.toLocaleString('default', { month: 'short' })} ${monthD.getFullYear()}`);
        monthD.setMonth(monthD.getMonth() + 3);
      }
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

export default function DepartmentDashboard({ sidebarCollapsed }) {
  const [projects, setProjects] = useState([]);
  const [department, setDepartment] = useState('');
  const [bpmId, setBpmId] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [timelineFormat, setTimelineFormat] = useState('months');

  // AI Assistant state
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  useEffect(() => {
    loadCSV(`${process.env.PUBLIC_URL}/data/demo.csv`, setProjects);
  }, []);

  // Filter options
  const departments = Array.from(new Set(projects.map(p => p.Department))).filter(Boolean);
  const bpmIds = Array.from(new Set(projects.map(p => p.BPM_ID))).filter(Boolean);
  const statuses = Array.from(new Set(projects.map(p => p.Status))).filter(Boolean);

  // Filtered projects
  const filtered = projects.filter(p =>
    (!department || p.Department === department) &&
    (!bpmId || p.BPM_ID === bpmId) &&
    (selectedStatuses.length === 0 || selectedStatuses.includes(p.Status)),
  );

  // Gantt axis based on filtered data
  const allDates = filtered.length > 0
    ? filtered.flatMap(p => [p.G0, p.G5_Previous, p.G5_Current]).map(d => new Date(d))
    : projects.flatMap(p => [p.G0, p.G5_Previous, p.G5_Current]).map(d => new Date(d));

  // Filter out invalid dates and ensure we have valid dates
  const validDates = allDates.filter(date => date instanceof Date && !isNaN(date));

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
  const extendedMaxDate = new Date(today);

  extendedMaxDate.setMonth(today.getMonth() + 6);

  // Use the later of project end date or extended future date
  if (extendedMaxDate > maxDate) {
    maxDate = extendedMaxDate;
  }

  const timelineLabels = generateTimelineLabels(minDate, maxDate, timelineFormat);

  return (
    <>
      {/* AI Side Panel */}
      <AISidePanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        projects={projects}
        selectedPortfolio={department}
        selectedStatuses={selectedStatuses}
      />

      <div className="dashboard-main-bg" style={{ marginLeft: sidebarCollapsed ? 0 : 200 }}>
        <div className="dashboard-container">


          <div className="dashboard-title">
            <div className="title-content">
              <h1>Department Dashboard</h1>
              <p>Department-level project management and timeline visualization</p>
            </div>
            <div className="title-export">
              <ExportDropdown
                element={() => document.querySelector('.dashboard-container')}
                filename="Complete_Department_Dashboard"
              />
            </div>
          </div>

          {/* AI Assistant Toggle - Right Side */}
          <div className={`ai-assistant-toggle-container ${isAIPanelOpen ? 'hidden' : ''}`}>
            <button
              aria-label={isAIPanelOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
              className="ai-assistant-toggle-btn"
              onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}
              title={isAIPanelOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            >
              <span className="ai-assistant-icon">🤖</span>
            </button>
          </div>

          <div className="filters-section">
            <div className="filter-row">
              <div>
                <label className="filter-label" htmlFor="department-select">Department: </label>
                <select id="department-select" onChange={e => setDepartment(e.target.value)} value={department}>
                  <option value="">All</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="filter-label" htmlFor="bpm-id-select">BPM ID: </label>
                <select id="bpm-id-select" onChange={e => setBpmId(e.target.value)} value={bpmId}>
                  <option value="">All</option>
                  {bpmIds.map(id => <option key={id} value={id}>{id}</option>)}
                </select>
              </div>
              <StatusFilter
                onStatusChange={setSelectedStatuses}
                selectedStatuses={selectedStatuses}
                statuses={statuses}
              />
            </div>
          </div>

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
                <label className="filter-label" htmlFor="timeline-format-select">Timeline Format:</label>
                <select
                  id="timeline-format-select"
                  className="timeline-format-select"
                  onChange={(e) => setTimelineFormat(e.target.value)}
                  value={timelineFormat}
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
            {filtered.length === 0 ? (
              <div className="no-data-message">No data to display</div>
            ) : (
              <div style={{ position: 'relative' }}>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Project</th>
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
                                  className="gantt-timeline-label"
                                  key={index}
                                  style={{
                                    position: 'absolute',
                                    left: `${labelPosition}%`,
                                    transform: 'translateX(-50%)',
                                    minWidth: 'auto',
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
                                  className="gantt-timeline-label"
                                  key={index}
                                  style={{
                                    position: 'absolute',
                                    left: `${labelPosition}%`,
                                    transform: 'translateX(-50%)',
                                    minWidth: 'auto',
                                  }}
                                >
                                  {timelineFormat === 'quarters' ? label.split(' ')[0] : label}
                                </span>
                              );
                            }
                          })}
                        </div>
                      </th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(proj => (
                      <tr className="project-row" key={proj.BPM_ID}>
                        <td>{proj.Project}</td>
                        <td>{proj.BPM_ID}</td>
                        <td>{proj.Project_Manager}</td>
                        <td>
                          <GanttBar
                            G0={proj.G0}
                            G5_Current={proj.G5_Current}
                            G5_Previous={proj.G5_Previous}
                            details={proj.Other_Detail}
                            max={maxDate}
                            min={minDate}
                            showTodayLine={false}
                            status={proj.Status}
                          />
                        </td>
                      </tr>
                    ))}
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
                        borderLeft: '3px dotted #dc2626',
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
