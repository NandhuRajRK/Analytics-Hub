/**
 * DevOps Analytics Component
 *
 * This component provides organizational-level DevOps analytics and insights
 * for portfolio management, agile processes, and cross-team coordination.
 *
 * Key Features:
 * - Organizational backlog management and epic tracking
 * - Cross-team agile process overview
 * - DevOps portfolio alignment and strategic initiatives
 * - Team coordination and dependency management
 * - DevOps maturity assessment and transformation tracking
 */

import { useState, useEffect, useMemo, useRef } from 'react';

import { STATUS_COLORS } from '../constants';
import { loadCSV } from '../dataLoader';

import ExportDropdown from './ExportDropdown';
import AISidePanel from './AISidePanel';

import './DevOpsAnalytics.css';

// Real-time Notifications & Alerts Component
function NotificationCenter({ notifications, onDismiss, onMarkRead }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, alerts, updates
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'alerts') return notification.type === 'alert';
    if (filter === 'updates') return notification.type === 'update';
    return true;
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="notification-center">
      <div className="notification-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="notification-icon">🔔</div>
        {unreadCount > 0 && (
          <div className="notification-badge">{unreadCount}</div>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button 
                className={`filter-btn ${filter === 'alerts' ? 'active' : ''}`}
                onClick={() => setFilter('alerts')}
              >
                Alerts
              </button>
              <button 
                className={`filter-btn ${filter === 'updates' ? 'active' : ''}`}
                onClick={() => setFilter('updates')}
              >
                Updates
              </button>
            </div>
          </div>
          
          <div className="notification-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <div 
                  key={index} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                >
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        className="mark-read-btn"
                        onClick={() => onMarkRead(notification.id)}
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      className="dismiss-btn"
                      onClick={() => onDismiss(notification.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">
                <p>No {filter} notifications</p>
              </div>
            )}
          </div>
          
          <div className="notification-footer">
            <button 
              className="mark-all-read-btn"
              onClick={() => notifications.forEach(n => onMarkRead(n.id))}
            >
              Mark All Read
            </button>
            <button 
              className="clear-all-btn"
              onClick={() => notifications.forEach(n => onDismiss(n.id))}
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Advanced Search & Filtering Component
function AdvancedSearch({ onSearch, onFilterChange, searchHistory, savedFilters }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('simple'); // simple, boolean, wildcard
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [booleanOperator, setBooleanOperator] = useState('AND');
  const [wildcardPattern, setWildcardPattern] = useState('');
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch({
        query: searchQuery,
        mode: searchMode,
        operator: booleanOperator,
        pattern: wildcardPattern
      });
    }
  };
  
  const handleQuickFilter = (filter) => {
    onFilterChange(filter);
  };
  
  const handleSaveFilter = () => {
    if (searchQuery.trim()) {
      const filterName = prompt('Enter a name for this filter:');
      if (filterName) {
        // This would typically save to localStorage or backend
        console.log('Saving filter:', filterName, searchQuery);
      }
    }
  };
  
  return (
    <div className="advanced-search-section">
      <div className="search-header">
        <h3>Advanced Search & Filtering</h3>
        <div className="search-controls">
          <button 
            className={`mode-btn ${searchMode === 'simple' ? 'active' : ''}`}
            onClick={() => setSearchMode('simple')}
          >
            Simple
          </button>
          <button 
            className={`mode-btn ${searchMode === 'boolean' ? 'active' : ''}`}
            onClick={() => setSearchMode('boolean')}
          >
            Boolean
          </button>
          <button 
            className={`mode-btn ${searchMode === 'wildcard' ? 'active' : ''}`}
            onClick={() => setSearchMode('wildcard')}
          >
            Wildcard
          </button>
        </div>
      </div>
      
      <div className="search-input-section">
        {searchMode === 'simple' && (
          <div className="simple-search">
            <input
              type="text"
              placeholder="Search epics, stories, teams, descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-advanced"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍 Search
            </button>
          </div>
        )}
        
        {searchMode === 'boolean' && (
          <div className="boolean-search">
            <div className="boolean-inputs">
              <input
                type="text"
                placeholder="First search term"
                className="search-input-advanced"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                value={booleanOperator} 
                onChange={(e) => setBooleanOperator(e.target.value)}
                className="operator-select"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="NOT">NOT</option>
              </select>
              <input
                type="text"
                placeholder="Second search term"
                className="search-input-advanced"
                onChange={(e) => setWildcardPattern(e.target.value)}
              />
            </div>
            <button className="search-btn" onClick={handleSearch}>
              🔍 Boolean Search
            </button>
          </div>
        )}
        
        {searchMode === 'wildcard' && (
          <div className="wildcard-search">
            <div className="wildcard-help">
              <span>Use * for multiple characters, ? for single character</span>
            </div>
            <div className="wildcard-inputs">
              <input
                type="text"
                placeholder="e.g., *portal*, team?, *2024*"
                value={wildcardPattern}
                onChange={(e) => setWildcardPattern(e.target.value)}
                className="search-input-advanced"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch}>
                🔍 Wildcard Search
              </button>
            </div>
          </div>
        )}
        
        <div className="search-actions">
          <button className="action-btn save-btn" onClick={handleSaveFilter}>
            💾 Save Filter
          </button>
          <button 
            className="action-btn advanced-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '🔽 Hide' : '🔼 Show'} Advanced
          </button>
        </div>
      </div>
      
      {showAdvanced && (
        <div className="advanced-options">
          <div className="quick-filters">
            <h4>Quick Filters</h4>
            <div className="filter-buttons">
              <button 
                className="quick-filter-btn"
                onClick={() => handleQuickFilter({ type: 'high-priority' })}
              >
                🚨 High Priority
              </button>
              <button 
                className="quick-filter-btn"
                onClick={() => handleQuickFilter({ type: 'blocked-items' })}
              >
                🚫 Blocked Items
              </button>
              <button 
                className="quick-filter-btn"
                onClick={() => handleQuickFilter({ type: 'overdue' })}
              >
                ⏰ Overdue
              </button>
              <button 
                className="quick-filter-btn"
                onClick={() => handleQuickFilter({ type: 'active-sprints' })}
              >
                🏃 Active Sprints
              </button>
              <button 
                className="quick-filter-btn"
                onClick={() => handleQuickFilter({ type: 'planning-phase' })}
              >
                📋 Planning Phase
              </button>
            </div>
          </div>
          
          <div className="search-history">
            <h4>Recent Searches</h4>
            <div className="history-list">
              {searchHistory.slice(0, 5).map((search, index) => (
                <div key={index} className="history-item">
                  <span className="history-query">{search.query}</span>
                  <span className="history-time">{search.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Filter Component
function StatusFilter({ statuses, selectedStatuses, onStatusChange, label = "Status" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

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
      : `${selectedStatuses.length} ${label}s`;

  return (
    <div className="status-filter-container">
      <label className="filter-label" htmlFor={`${label.toLowerCase()}-select`}>{label}:</label>
      <div className="custom-select" ref={dropdownRef}>
        <div
          className="select-header"
          id={`${label.toLowerCase()}-select`}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Select ${label.toLowerCase()}`}
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
              role="button"
              tabIndex={0}
              aria-label={`Select all ${label.toLowerCase()}s`}
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
                role="button"
                tabIndex={0}
                aria-label={`Select ${status}`}
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

/**
 * Epic Card Component
 * Displays organizational epics with status and progress
 */
function EpicCard({ epic }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return STATUS_COLORS.ON_TRACK;
      case 'planning': return STATUS_COLORS.AT_RISK;
      case 'completed': return STATUS_COLORS.COMPLETED;
      case 'blocked': return STATUS_COLORS.DELAYED;
      default: return STATUS_COLORS.DEFAULT;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return STATUS_COLORS.ON_TRACK;
    if (progress >= 50) return STATUS_COLORS.AT_RISK;
    return STATUS_COLORS.DELAYED;
  };

  return (
    <div className="devops-epic-card">
      <div className="epic-header">
        <div className="epic-id">{epic.ID || 'Unknown'}</div>
        <div className="epic-status" style={{ backgroundColor: getStatusColor(epic.Status) }}>
          {epic.Status || 'Unknown'}
        </div>
      </div>
      <div className="epic-title">{epic.Title || 'Untitled'}</div>
      <div className="epic-description">{epic.Description || 'No description'}</div>
      <div className="epic-meta">
        <div className="epic-team">Team: {epic.Team || 'Unassigned'}</div>
        <div className="epic-priority">Priority: {epic.Priority || 'Medium'}</div>
      </div>
      <div className="epic-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${epic.Progress || 0}%`,
              backgroundColor: getProgressColor(epic.Progress || 0)
            }}
          ></div>
        </div>
        <div className="progress-text">{epic.Progress || 0}% Complete</div>
      </div>
      <div className="epic-stats">
        <div className="stat">
          <span className="stat-label">Points:</span>
          <span className="stat-value">{epic.StoryPoints || 0}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Sprint:</span>
          <span className="stat-value">{epic.CurrentSprint || 'Unassigned'}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Gantt Timeline Component
 * Shows epic timelines and dependencies
 */
function GanttTimeline({ epics }) {
  const [hoveredEpic, setHoveredEpic] = useState(null);
  
  const timelineData = useMemo(() => {
    if (!epics || epics.length === 0) return [];
    
    return epics
      .filter(epic => epic.StartDate && epic.EndDate)
      .map(epic => ({
        id: epic.ID,
        title: epic.Title,
        start: new Date(epic.StartDate),
        end: new Date(epic.EndDate),
        status: epic.Status,
        team: epic.Team,
        progress: epic.Progress || 0,
        priority: epic.Priority
      }))
      .sort((a, b) => a.start - b.start);
  }, [epics]);

  if (timelineData.length === 0) {
    return (
      <div className="gantt-timeline">
        <div className="gantt-header">
          <h3>Epic Timeline</h3>
        </div>
        <div className="gantt-empty">
          <p>No timeline data available</p>
        </div>
      </div>
    );
  }

  const minDate = new Date(Math.min(...timelineData.map(e => e.start)));
  const maxDate = new Date(Math.max(...timelineData.map(e => e.end)));
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
  const today = new Date();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#22c55e';
      case 'planning': return '#f59e0b';
      case 'completed': return '#3b82f6';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className="gantt-timeline">
      <div className="gantt-header">
        <h3>Epic Timeline</h3>
        <div className="gantt-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
            <span>Active</span>
      </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
            <span>Planning</span>
        </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
            <span>Completed</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
            <span>Blocked</span>
          </div>
        </div>
      </div>
      
      <div className="gantt-container">
        <div className="gantt-timeline-header">
          <div className="gantt-epic-header">Epic</div>
          <div className="gantt-timeline-grid">
            {Array.from({ length: Math.min(totalDays, 90) }, (_, i) => {
              const date = new Date(minDate);
              date.setDate(date.getDate() + i);
              return (
                <div key={i} className="gantt-date-header">
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="gantt-timeline-body">
          {timelineData.map((epic) => {
            const startOffset = Math.floor((epic.start - minDate) / (1000 * 60 * 60 * 24));
            const duration = Math.ceil((epic.end - epic.start) / (1000 * 60 * 60 * 24));
            const isToday = today >= epic.start && today <= epic.end;
            
            return (
              <div key={epic.id} className="gantt-timeline-row">
                <div className="gantt-epic-info">
                  <div className="epic-title">{epic.title}</div>
                  <div className="epic-meta">
                    <span className="epic-team">{epic.team}</span>
                    <span className="epic-priority" style={{ color: getPriorityColor(epic.priority) }}>
                      {epic.priority}
                    </span>
                  </div>
                </div>
                
                <div className="gantt-timeline-grid">
                  {Array.from({ length: Math.min(totalDays, 90) }, (_, i) => {
                    const isEpicDay = i >= startOffset && i < startOffset + duration;
                    const isEpicStart = i === startOffset;
                    const isEpicEnd = i === startOffset + duration - 1;
                    
                    return (
                      <div key={i} className="gantt-timeline-cell">
                        {isEpicDay && (
                          <div
                            className={`gantt-epic-bar ${isEpicStart ? 'epic-start' : ''} ${isEpicEnd ? 'epic-end' : ''} ${isToday ? 'today' : ''}`}
                            style={{
                              backgroundColor: getStatusColor(epic.status),
                              width: '100%',
                              height: '20px',
                              borderRadius: isEpicStart && isEpicEnd ? '10px' : isEpicStart ? '10px 0 0 10px' : isEpicEnd ? '0 10px 10px 0' : '0',
                              position: 'relative'
                            }}
                            onMouseEnter={() => setHoveredEpic(epic)}
                            onMouseLeave={() => setHoveredEpic(null)}
                          >
                            {isEpicStart && (
                              <div className="epic-progress-indicator" style={{ width: `${epic.progress}%` }}></div>
                            )}
        </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {hoveredEpic && (
        <div className="gantt-tooltip">
          <div className="tooltip-title">{hoveredEpic.title}</div>
          <div className="tooltip-content">
            <div>Team: {hoveredEpic.team}</div>
            <div>Status: {hoveredEpic.status}</div>
            <div>Priority: {hoveredEpic.priority}</div>
            <div>Progress: {hoveredEpic.progress}%</div>
            <div>Duration: {Math.ceil((hoveredEpic.end - hoveredEpic.start) / (1000 * 60 * 60 * 24))} days</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Team Velocity Component
 * Shows team performance and capacity across sprints
 */
function TeamVelocity({ teams }) {
  const chartData = useMemo(() => {
    return teams.map(team => ({
      name: team.Title || 'Unknown Team',
      velocity: parseInt(team.StoryPoints) || 0,
      capacity: 50, // Default capacity since it's not in CSV
      utilization: parseInt(team.StoryPoints) ? (parseInt(team.StoryPoints) / 50) * 100 : 0,
      trend: 0 // Default trend since it's not in CSV
    }));
  }, [teams]);

  const maxVelocity = Math.max(...chartData.map(t => t.velocity));

  return (
    <div className="team-velocity-section">
      <div className="velocity-chart">
        {chartData.map((team, index) => (
          <div className="velocity-bar-group" key={index}>
            <div className="team-name">{team.name}</div>
            <div className="velocity-bars">
              <div 
                className="velocity-bar actual"
                style={{
                  height: `${(team.velocity / maxVelocity) * 100}%`,
                  backgroundColor: STATUS_COLORS.ON_TRACK
                }}
                title={`Actual: ${team.velocity} points`}
              ></div>
              <div 
                className="velocity-bar capacity"
                style={{
                  height: `${(team.capacity / maxVelocity) * 100}%`,
                  backgroundColor: STATUS_COLORS.AT_RISK
                }}
                title={`Capacity: ${team.capacity} points`}
              ></div>
            </div>
            <div className="velocity-stats">
              <div className="utilization">{team.utilization.toFixed(0)}%</div>
              <div className="trend">{team.trend > 0 ? '↗️' : team.trend < 0 ? '↘️' : '→'}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color actual"></span>
          Actual Velocity
        </div>
        <div className="legend-item">
          <span className="legend-color capacity"></span>
          Team Capacity
        </div>
      </div>
    </div>
  );
}

/**
 * Backlog Overview Component
 * Shows organizational backlog status and distribution
 */
function BacklogOverview({ backlog }) {
  const getStatusDistribution = () => {
    const distribution = {};
    backlog.forEach(item => {
      const status = item.Status || 'Unknown';
      distribution[status] = (distribution[status] || 0) + 1;
    });
    return distribution;
  };

  const getPriorityDistribution = () => {
    const distribution = {};
    backlog.forEach(item => {
      const priority = item.Priority || 'Unknown';
      distribution[priority] = (distribution[priority] || 0) + 1;
    });
    return distribution;
  };

  const statusDistribution = getStatusDistribution();
  const priorityDistribution = getPriorityDistribution();

  return (
    <div className="backlog-overview-section">
      <div className="backlog-stats">
        <div className="stat-card">
          <div className="stat-number">{backlog.length}</div>
          <div className="stat-label">Total Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{backlog.filter(item => item.Status === 'Ready').length}</div>
          <div className="stat-label">Ready for Sprint</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{backlog.filter(item => item.Priority === 'High').length}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{backlog.filter(item => item.WorkItemType === 'Epic').length}</div>
          <div className="stat-label">Active Epics</div>
        </div>
      </div>
      
      <div className="distribution-charts">
        <div className="distribution-chart">
          <h4>Status Distribution</h4>
          <div className="pie-chart" style={{
            background: (() => {
              const total = Object.values(statusDistribution).reduce((sum, count) => sum + count, 0);
              let currentAngle = 0;
              const gradients = [];
              
              Object.entries(statusDistribution).forEach(([status, count]) => {
                const percentage = count / total;
                const angle = percentage * 360;
                const color = STATUS_COLORS[status.toUpperCase()] || STATUS_COLORS.DEFAULT;
                gradients.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
                currentAngle += angle;
              });
              
              return `conic-gradient(${gradients.join(', ')})`;
            })()
          }}>
          </div>
          <div className="chart-labels">
            {Object.entries(statusDistribution).map(([status, count]) => (
              <div key={status} className="chart-label">
                <span className="label-color" style={{ backgroundColor: STATUS_COLORS[status.toUpperCase()] || STATUS_COLORS.DEFAULT }}></span>
                {status}: {count}
              </div>
            ))}
          </div>
        </div>

        <div className="distribution-chart">
          <h4>Priority Distribution</h4>
          <div className="priority-bars">
            {Object.entries(priorityDistribution).map(([priority, count]) => (
              <div key={priority} className="priority-bar">
                <div className="priority-label">{priority}</div>
                <div className="priority-count">{count}</div>
                <div 
                  className="priority-fill"
                  style={{
                    width: `${(count / Math.max(...Object.values(priorityDistribution))) * 100}%`,
                    backgroundColor: priority === 'High' ? STATUS_COLORS.DELAYED : 
                                  priority === 'Medium' ? STATUS_COLORS.AT_RISK : 
                                  STATUS_COLORS.ON_TRACK
                  }}
                ></div>
              </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Burndown Chart Component
 * Shows sprint progress over time
 */
function BurndownChart({ sprint }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  
  const generateBurndownData = () => {
    if (!sprint.StartDate || !sprint.EndDate) return null;
    
    const startDate = new Date(sprint.StartDate);
    const endDate = new Date(sprint.EndDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPoints = parseInt(sprint.StoryPoints) || 0;
    
    if (totalDays <= 0 || totalPoints <= 0) return null;
    
    const data = [];
    const idealBurndown = [];
    
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const isToday = new Date() >= currentDate;
      
      // Ideal burndown (linear)
      const idealPoints = totalPoints - (totalPoints / totalDays) * i;
      idealBurndown.push({
        day: i,
        points: Math.max(0, idealPoints),
        date: currentDate
      });
      
      // Actual progress (simulated based on current progress)
      const currentProgress = parseInt(sprint.Progress) || 0;
      const actualPoints = totalPoints - (totalPoints * currentProgress / 100) * (i / totalDays);
      
      data.push({
        day: i,
        points: Math.max(0, actualPoints),
        date: currentDate,
        isToday,
        remaining: Math.max(0, actualPoints)
      });
    }
    
    return { data, idealBurndown, totalDays, totalPoints };
  };
  
  const burndownData = generateBurndownData();
  
  if (!burndownData) {
    return (
      <div className="burndown-chart">
        <div className="chart-empty">
          <p>No sprint data available for burndown chart</p>
        </div>
      </div>
    );
  }
  
  const maxPoints = Math.max(...burndownData.data.map(d => d.points));
  
  return (
    <div className="burndown-chart">
      <div className="chart-header">
        <h4>Burndown Chart - {sprint.Title}</h4>
        <div className="chart-metrics">
          <span className="metric">Total: {burndownData.totalPoints} pts</span>
          <span className="metric">Progress: {sprint.Progress || 0}%</span>
          <span className="metric">Days: {burndownData.totalDays}</span>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-y-axis">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="y-tick">
              {Math.round(maxPoints * (1 - i / 5))}
            </div>
          ))}
        </div>
        
        <div className="chart-content">
          <div className="chart-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="grid-line" style={{ top: `${(i / 5) * 100}%` }}></div>
            ))}
          </div>
          
          <div className="chart-lines">
            {/* Ideal burndown line */}
            <svg className="ideal-line" viewBox={`0 0 ${burndownData.totalDays * 20} 100`}>
              <polyline
                points={burndownData.idealBurndown.map(d => 
                  `${d.day * 20},${100 - (d.points / maxPoints) * 100}`
                ).join(' ')}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
            
            {/* Actual burndown line */}
            <svg className="actual-line" viewBox={`0 0 ${burndownData.totalDays * 20} 100`}>
              <polyline
                points={burndownData.data.map(d => 
                  `${d.day * 20},${100 - (d.points / maxPoints) * 100}`
                ).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
              />
            </svg>
          </div>
          
          <div className="chart-points">
            {burndownData.data.map((day, index) => (
              <div
                key={index}
                className={`chart-point ${day.isToday ? 'today' : ''}`}
                style={{
                  left: `${(day.day / burndownData.totalDays) * 100}%`,
                  top: `${100 - (day.points / maxPoints) * 100}%`
                }}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="point-tooltip">
                  Day {day.day}: {day.remaining.toFixed(1)} pts remaining
                </div>
              </div>
            ))}
          </div>
          
          <div className="chart-x-axis">
            {Array.from({ length: Math.min(burndownData.totalDays + 1, 8) }, (_, i) => {
              const dayIndex = Math.floor((i / 7) * burndownData.totalDays);
              const date = new Date(burndownData.data[dayIndex]?.date);
              return (
                <div key={i} className="x-tick" style={{ left: `${(i / 7) * 100}%` }}>
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color actual"></div>
          <span>Actual Progress</span>
        </div>
        <div className="legend-item">
          <div className="legend-color ideal"></div>
          <span>Ideal Burndown</span>
        </div>
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Performance Analytics & Trends Component
 * Shows performance metrics over time with trend analysis
 */
function PerformanceAnalytics({ teams, epics, backlog, sprints }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month'); // week, month, quarter
  const [selectedMetrics, setSelectedMetrics] = useState(['velocity', 'progress', 'quality']);
  
  const generateTrendData = useMemo(() => {
    const timeframes = {
      week: 7,
      month: 30,
      quarter: 90
    };
    
    const days = timeframes[selectedTimeframe];
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      
      // Simulate trend data based on current data
      const baseVelocity = teams.reduce((sum, team) => sum + (parseInt(team.StoryPoints) || 0), 0) / teams.length;
      const baseProgress = epics.reduce((sum, epic) => sum + (parseInt(epic.Progress) || 0), 0) / epics.length;
      const baseQuality = 100 - (backlog.filter(item => item.Status === 'Blocked').length / backlog.length * 100);
      
      // Add some variation and trends
      const velocityTrend = baseVelocity * (0.8 + Math.random() * 0.4) * (1 + i * 0.01);
      const progressTrend = Math.min(100, baseProgress * (0.9 + Math.random() * 0.2) * (1 + i * 0.005));
      const qualityTrend = Math.max(0, baseQuality * (0.85 + Math.random() * 0.3) * (1 - i * 0.002));
      
      data.push({
        date: date.toISOString().split('T')[0],
        velocity: Math.round(velocityTrend),
        progress: Math.round(progressTrend),
        quality: Math.round(qualityTrend),
        teamCount: teams.length,
        epicCount: epics.length,
        backlogCount: backlog.length
      });
    }
    
    return data;
  }, [teams, epics, backlog, selectedTimeframe]);
  
  const getTrendDirection = (data, metric) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-7).reduce((sum, d) => sum + d[metric], 0) / 7;
    const earlier = data.slice(0, 7).reduce((sum, d) => sum + d[metric], 0) / 7;
    if (recent > earlier * 1.05) return 'up';
    if (recent < earlier * 0.95) return 'down';
    return 'stable';
  };
  
  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up': return '#22c55e';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };
  
  const metrics = [
    {
      key: 'velocity',
      label: 'Team Velocity',
      value: generateTrendData[generateTrendData.length - 1]?.velocity || 0,
      trend: getTrendDirection(generateTrendData, 'velocity'),
      unit: 'points/day',
      description: 'Average story points completed per day'
    },
    {
      key: 'progress',
      label: 'Epic Progress',
      value: generateTrendData[generateTrendData.length - 1]?.progress || 0,
      trend: getTrendDirection(generateTrendData, 'progress'),
      unit: '%',
      description: 'Overall progress across all epics'
    },
    {
      key: 'quality',
      label: 'Code Quality',
      value: generateTrendData[generateTrendData.length - 1]?.quality || 0,
      trend: getTrendDirection(generateTrendData, 'quality'),
      unit: '%',
      description: 'Percentage of successful deployments'
    },
    {
      key: 'efficiency',
      label: 'Team Efficiency',
      value: Math.round((generateTrendData[generateTrendData.length - 1]?.velocity || 0) / 50 * 100),
      trend: getTrendDirection(generateTrendData, 'velocity'),
      unit: '%',
      description: 'Velocity vs. capacity utilization'
    }
  ];
  
  return (
    <div className="performance-analytics-section">
      <div className="analytics-header">
        <h2>Performance Analytics & Trends</h2>
        <div className="analytics-controls">
          <div className="timeframe-selector">
            <label>Timeframe:</label>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="timeframe-select"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>
          <div className="metric-selector">
            <label>Metrics:</label>
            <div className="metric-checkboxes">
              {metrics.map(metric => (
                <label key={metric.key} className="metric-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric.key]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.key));
                      }
                    }}
                  />
                  <span>{metric.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="metrics-overview">
        {metrics.map(metric => (
          <div key={metric.key} className="metric-card">
            <div className="metric-header">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-trend" style={{ color: getTrendColor(metric.trend) }}>
                {getTrendIcon(metric.trend)}
              </div>
            </div>
            <div className="metric-value">
              {metric.value}
              <span className="metric-unit">{metric.unit}</span>
            </div>
            <div className="metric-description">{metric.description}</div>
            <div className="metric-change">
              <span className="change-label">Trend:</span>
              <span className="change-value" style={{ color: getTrendColor(metric.trend) }}>
                {metric.trend === 'up' ? 'Improving' : metric.trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="trend-chart-section">
        <h3>Performance Trends Over Time</h3>
        <div className="trend-chart">
          <div className="chart-legend">
            {selectedMetrics.map(metricKey => {
              const metric = metrics.find(m => m.key === metricKey);
              return (
                <div key={metricKey} className="legend-item">
                  <div className="legend-color" style={{ 
                    backgroundColor: getTrendColor(metric.trend) 
                  }}></div>
                  <span>{metric.label}</span>
                </div>
              );
            })}
          </div>
          
          <div className="trend-data">
            {generateTrendData.slice(-14).map((dataPoint, index) => (
              <div key={index} className="trend-point">
                <div className="trend-date">{dataPoint.date}</div>
                <div className="trend-values">
                  {selectedMetrics.map(metricKey => (
                    <div key={metricKey} className="trend-value">
                      <span className="value-label">{metrics.find(m => m.key === metricKey).label}:</span>
                      <span className="value-number">
                        {dataPoint[metricKey]}
                        <span className="value-unit">
                          {metrics.find(m => m.key === metricKey).unit}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="insights-section">
        <h3>Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card positive">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Velocity Improvement</h4>
              <p>Team velocity has increased by 15% over the last {selectedTimeframe}</p>
            </div>
          </div>
          <div className="insight-card warning">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <h4>Quality Alert</h4>
              <p>Code quality metrics show a slight decline. Consider additional testing.</p>
            </div>
          </div>
          <div className="insight-card info">
            <div className="insight-icon">ℹ️</div>
            <div className="insight-content">
              <h4>Capacity Utilization</h4>
              <p>Teams are operating at 78% capacity, optimal for sustainable delivery.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Team Collaboration & Communication Component
 * Shows team interactions, communication patterns, and collaboration metrics
 */
function TeamCollaboration({ teams, epics, backlog, sprints }) {
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [collaborationView, setCollaborationView] = useState('overview'); // overview, communication, dependencies
  
  const teamCollaborationData = useMemo(() => {
    const data = {};
    
    teams.forEach(team => {
      const teamEpics = epics.filter(epic => epic.Team === team.Title);
      const teamBacklog = backlog.filter(item => item.Team === team.Title);
      const teamSprints = sprints.filter(sprint => 
        sprint.Team === team.Title || sprint.Team === 'Multiple Teams'
      );
      
      // Calculate collaboration metrics
      const crossTeamEpics = teamEpics.filter(epic => 
        epic.Team !== team.Title || epic.Description?.includes('collaboration') || epic.Description?.includes('integration')
      );
      
      const communicationScore = Math.min(100, 
        (teamEpics.length * 10) + (teamBacklog.length * 5) + (crossTeamEpics.length * 15)
      );
      
      const dependencyCount = teamEpics.filter(epic => 
        epic.Description?.includes('dependency') || epic.Description?.includes('integration')
      ).length;
      
      data[team.Title] = {
        epics: teamEpics.length,
        backlog: teamBacklog.length,
        sprints: teamSprints.length,
        crossTeamEpics: crossTeamEpics.length,
        communicationScore,
        dependencyCount,
        collaborationIndex: Math.round((communicationScore + dependencyCount * 10) / 2)
      };
    });
    
    return data;
  }, [teams, epics, backlog, sprints]);
  
  const overallCollaboration = useMemo(() => {
    const scores = Object.values(teamCollaborationData);
    return {
      totalTeams: teams.length,
      avgCommunicationScore: Math.round(scores.reduce((sum, d) => sum + d.communicationScore, 0) / scores.length),
      totalCrossTeamEpics: scores.reduce((sum, d) => sum + d.crossTeamEpics, 0),
      totalDependencies: scores.reduce((sum, d) => sum + d.dependencyCount, 0),
      collaborationHealth: scores.reduce((sum, d) => sum + d.collaborationIndex, 0) / scores.length
    };
  }, [teamCollaborationData, teams.length]);
  
  const getCollaborationLevel = (score) => {
    if (score >= 80) return { level: 'Excellent', color: '#22c55e', icon: '🌟' };
    if (score >= 60) return { level: 'Good', color: '#10b981', icon: '👍' };
    if (score >= 40) return { level: 'Fair', color: '#f59e0b', icon: '⚠️' };
    return { level: 'Needs Improvement', color: '#ef4444', icon: '🔧' };
  };
  
  const selectedTeamData = selectedTeam === 'all' ? overallCollaboration : teamCollaborationData[selectedTeam];
  
  return (
    <div className="team-collaboration-section">
      <div className="collaboration-header">
        <h2>Team Collaboration & Communication</h2>
        <div className="collaboration-controls">
          <div className="team-selector">
            <label>Team:</label>
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="team-select"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.Title} value={team.Title}>{team.Title}</option>
              ))}
            </select>
          </div>
          <div className="view-selector">
            <label>View:</label>
            <div className="view-buttons">
              <button 
                className={`view-btn ${collaborationView === 'overview' ? 'active' : ''}`}
                onClick={() => setCollaborationView('overview')}
              >
                Overview
              </button>
              <button 
                className={`view-btn ${collaborationView === 'communication' ? 'active' : ''}`}
                onClick={() => setCollaborationView('communication')}
              >
                Communication
              </button>
              <button 
                className={`view-btn ${collaborationView === 'dependencies' ? 'active' : ''}`}
                onClick={() => setCollaborationView('dependencies')}
              >
                Dependencies
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {collaborationView === 'overview' && (
        <div className="collaboration-overview">
          <div className="overview-metrics">
            <div className="metric-item">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-value">{selectedTeamData.totalTeams || selectedTeamData.epics}</div>
                <div className="metric-label">
                  {selectedTeam === 'all' ? 'Total Teams' : 'Team Epics'}
                </div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">💬</div>
              <div className="metric-content">
                <div className="metric-value">
                  {selectedTeam === 'all' ? selectedTeamData.avgCommunicationScore : selectedTeamData.communicationScore}
                </div>
                <div className="metric-label">Communication Score</div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">🔗</div>
              <div className="metric-content">
                <div className="metric-value">
                  {selectedTeam === 'all' ? selectedTeamData.totalCrossTeamEpics : selectedTeamData.crossTeamEpics}
                </div>
                <div className="metric-label">
                  {selectedTeam === 'all' ? 'Cross-Team Epics' : 'Cross-Team Work'}
                </div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">
                  {selectedTeam === 'all' ? Math.round(selectedTeamData.collaborationHealth) : selectedTeamData.collaborationIndex}
                </div>
                <div className="metric-label">Collaboration Index</div>
              </div>
            </div>
          </div>
          
          <div className="collaboration-health">
            <h3>Collaboration Health Assessment</h3>
            <div className="health-indicator">
              {(() => {
                const score = selectedTeam === 'all' ? selectedTeamData.collaborationHealth : selectedTeamData.collaborationIndex;
                const level = getCollaborationLevel(score);
                return (
                  <div className="health-score" style={{ color: level.color }}>
                    <div className="score-icon">{level.icon}</div>
                    <div className="score-value">{score}</div>
                    <div className="score-level">{level.level}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {collaborationView === 'communication' && (
        <div className="communication-view">
          <h3>Communication Patterns</h3>
          <div className="communication-metrics">
            {teams.map(team => {
              const teamData = teamCollaborationData[team.Title];
              const commLevel = getCollaborationLevel(teamData.communicationScore);
              return (
                <div key={team.Title} className="team-communication-card">
                  <div className="team-header">
                    <h4>{team.Title}</h4>
                    <div className="team-score" style={{ color: commLevel.color }}>
                      {teamData.communicationScore}
                    </div>
                  </div>
                  <div className="communication-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Epics:</span>
                      <span className="breakdown-value">{teamData.epics}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Backlog Items:</span>
                      <span className="breakdown-value">{teamData.backlog}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Cross-Team Work:</span>
                      <span className="breakdown-value">{teamData.crossTeamEpics}</span>
                    </div>
                  </div>
                  <div className="communication-status">
                    <span className="status-label">Status:</span>
                    <span className="status-value" style={{ color: commLevel.color }}>
                      {commLevel.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {collaborationView === 'dependencies' && (
        <div className="dependencies-view">
          <h3>Team Dependencies & Integration</h3>
          <div className="dependencies-grid">
            {teams.map(team => {
              const teamData = teamCollaborationData[team.Title];
              const depLevel = getCollaborationLevel(teamData.dependencyCount * 10);
              return (
                <div key={team.Title} className="dependency-card">
                  <div className="dependency-header">
                    <h4>{team.Title}</h4>
                    <div className="dependency-count">{teamData.dependencyCount}</div>
                  </div>
                  <div className="dependency-details">
                    <div className="detail-item">
                      <span className="detail-label">Integration Points:</span>
                      <span className="detail-value">{teamData.dependencyCount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Collaboration Level:</span>
                      <span className="detail-value" style={{ color: depLevel.color }}>
                        {depLevel.level}
                      </span>
                    </div>
                  </div>
                  <div className="dependency-recommendations">
                    {teamData.dependencyCount === 0 && (
                      <p className="recommendation">Consider identifying integration opportunities</p>
                    )}
                    {teamData.dependencyCount > 0 && teamData.dependencyCount < 3 && (
                      <p className="recommendation">Good level of team integration</p>
                    )}
                    {teamData.dependencyCount >= 3 && (
                      <p className="recommendation">Strong cross-team collaboration</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="collaboration-recommendations">
        <h3>Collaboration Recommendations</h3>
        <div className="recommendations-list">
          <div className="recommendation-item">
            <div className="recommendation-icon">💡</div>
            <div className="recommendation-content">
              <h4>Cross-Team Workshops</h4>
              <p>Schedule regular workshops to improve communication between teams</p>
            </div>
          </div>
          <div className="recommendation-item">
            <div className="recommendation-icon">📅</div>
            <div className="recommendation-content">
              <h4>Shared Sprint Planning</h4>
              <p>Coordinate sprint planning sessions across dependent teams</p>
            </div>
          </div>
          <div className="recommendation-item">
            <div className="recommendation-icon">🔄</div>
            <div className="recommendation-content">
              <h4>Integration Reviews</h4>
              <p>Establish regular integration review meetings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Resource Management & Capacity Planning Component
 * Shows team capacity, resource allocation, and planning insights
 */
function ResourceManagement({ teams, epics, backlog, sprints }) {
  const [selectedView, setSelectedView] = useState('capacity'); // capacity, allocation, planning
  const [selectedTimeframe, setSelectedTimeframe] = useState('sprint'); // sprint, month, quarter
  
  const resourceData = useMemo(() => {
    const data = {};
    
    teams.forEach(team => {
      const teamEpics = epics.filter(epic => epic.Team === team.Title);
      const teamBacklog = backlog.filter(item => item.Team === team.Title);
      const teamSprints = sprints.filter(sprint => 
        sprint.Team === team.Title || sprint.Team === 'Multiple Teams'
      );
      
      // Calculate capacity metrics
      const teamSize = parseInt(team.Members) || 5; // Default team size
      const totalCapacity = teamSize * 40; // 40 hours per week per person
      const allocatedCapacity = teamEpics.reduce((sum, epic) => 
        sum + (parseInt(epic.StoryPoints) || 0), 0
      );
      const utilizationRate = Math.min(100, (allocatedCapacity / totalCapacity) * 100);
      
      // Calculate sprint capacity
      const activeSprints = teamSprints.filter(sprint => sprint.Status === 'Active');
      const sprintCapacity = activeSprints.reduce((sum, sprint) => 
        sum + (parseInt(sprint.StoryPoints) || 0), 0
      );
      
      // Calculate resource allocation
      const highPriorityItems = teamBacklog.filter(item => item.Priority === 'High').length;
      const blockedItems = teamBacklog.filter(item => item.Status === 'Blocked').length;
      const technicalDebt = teamBacklog.filter(item => 
        item.Type === 'Technical Debt' || item.Description?.includes('refactor')
      ).length;
      
      data[team.Title] = {
        teamSize,
        totalCapacity,
        allocatedCapacity,
        utilizationRate,
        sprintCapacity,
        highPriorityItems,
        blockedItems,
        technicalDebt,
        availableCapacity: Math.max(0, totalCapacity - allocatedCapacity),
        efficiency: Math.round((allocatedCapacity / totalCapacity) * 100)
      };
    });
    
    return data;
  }, [teams, epics, backlog, sprints]);
  
  const overallCapacity = useMemo(() => {
    const teamsData = Object.values(resourceData);
    return {
      totalTeams: teams.length,
      totalCapacity: teamsData.reduce((sum, d) => sum + d.totalCapacity, 0),
      totalAllocated: teamsData.reduce((sum, d) => sum + d.allocatedCapacity, 0),
      avgUtilization: Math.round(teamsData.reduce((sum, d) => sum + d.utilizationRate, 0) / teamsData.length),
      totalAvailable: teamsData.reduce((sum, d) => sum + d.availableCapacity, 0),
      capacityHealth: teamsData.filter(d => d.utilizationRate < 90).length
    };
  }, [resourceData, teams.length]);
  
  const getCapacityStatus = (utilization) => {
    if (utilization >= 90) return { status: 'Overloaded', color: '#ef4444', icon: '🔴' };
    if (utilization >= 75) return { status: 'High', color: '#f59e0b', icon: '🟡' };
    if (utilization >= 50) return { status: 'Optimal', color: '#10b981', icon: '🟢' };
    return { status: 'Underutilized', color: '#6b7280', icon: '⚪' };
  };
  
  const getPlanningRecommendations = () => {
    const recommendations = [];
    
    Object.entries(resourceData).forEach(([teamName, data]) => {
      if (data.utilizationRate >= 90) {
        recommendations.push({
          type: 'warning',
          team: teamName,
          message: 'Team is overloaded. Consider redistributing work or adding resources.',
          priority: 'high'
        });
      } else if (data.utilizationRate < 50) {
        recommendations.push({
          type: 'info',
          team: teamName,
          message: 'Team has available capacity. Consider assigning additional work.',
          priority: 'medium'
        });
      }
      
      if (data.blockedItems > 3) {
        recommendations.push({
          type: 'alert',
          team: teamName,
          message: 'High number of blocked items. Review and resolve blockers.',
          priority: 'high'
        });
      }
      
      if (data.technicalDebt > 2) {
        recommendations.push({
          type: 'info',
          team: teamName,
          message: 'Technical debt accumulating. Plan refactoring sprints.',
          priority: 'medium'
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };
  
  return (
    <div className="resource-management-section">
      <div className="resource-header">
        <h2>Resource Management & Capacity Planning</h2>
        <div className="resource-controls">
          <div className="view-selector">
            <label>View:</label>
            <div className="view-buttons">
              <button 
                className={`view-btn ${selectedView === 'capacity' ? 'active' : ''}`}
                onClick={() => setSelectedView('capacity')}
              >
                Capacity
              </button>
              <button 
                className={`view-btn ${selectedView === 'allocation' ? 'active' : ''}`}
                onClick={() => setSelectedView('allocation')}
              >
                Allocation
              </button>
              <button 
                className={`view-btn ${selectedView === 'planning' ? 'active' : ''}`}
                onClick={() => setSelectedView('planning')}
              >
                Planning
              </button>
            </div>
          </div>
          <div className="timeframe-selector">
            <label>Timeframe:</label>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="timeframe-select"
            >
              <option value="sprint">Current Sprint</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </div>
      
      {selectedView === 'capacity' && (
        <div className="capacity-view">
          <div className="capacity-overview">
            <div className="overview-metric">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-value">{overallCapacity.totalTeams}</div>
                <div className="metric-label">Total Teams</div>
              </div>
            </div>
            <div className="overview-metric">
              <div className="metric-icon">⏰</div>
              <div className="metric-content">
                <div className="metric-value">{overallCapacity.totalCapacity.toLocaleString()}</div>
                <div className="metric-label">Total Capacity (hrs)</div>
              </div>
            </div>
            <div className="overview-metric">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{overallCapacity.avgUtilization}%</div>
                <div className="metric-label">Avg Utilization</div>
              </div>
            </div>
            <div className="overview-metric">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-value">{overallCapacity.capacityHealth}</div>
                <div className="metric-label">Healthy Teams</div>
              </div>
            </div>
          </div>
          
          <div className="team-capacity-grid">
            {teams.map(team => {
              const data = resourceData[team.Title];
              const status = getCapacityStatus(data.utilizationRate);
              return (
                <div key={team.Title} className="team-capacity-card">
                  <div className="team-header">
                    <h4>{team.Title}</h4>
                    <div className="capacity-status" style={{ color: status.color }}>
                      {status.icon} {status.status}
                    </div>
                  </div>
                  <div className="capacity-metrics">
                    <div className="capacity-bar">
                      <div className="bar-label">Utilization</div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${data.utilizationRate}%`,
                            backgroundColor: status.color
                          }}
                        ></div>
                        <span className="bar-value">{data.utilizationRate}%</span>
                      </div>
                    </div>
                    <div className="capacity-details">
                      <div className="detail-row">
                        <span>Team Size:</span>
                        <span>{data.teamSize} members</span>
                      </div>
                      <div className="detail-row">
                        <span>Total Capacity:</span>
                        <span>{data.totalCapacity} hrs</span>
                      </div>
                      <div className="detail-row">
                        <span>Allocated:</span>
                        <span>{data.allocatedCapacity} hrs</span>
                      </div>
                      <div className="detail-row">
                        <span>Available:</span>
                        <span>{data.availableCapacity} hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {selectedView === 'allocation' && (
        <div className="allocation-view">
          <h3>Resource Allocation Analysis</h3>
          <div className="allocation-grid">
            {teams.map(team => {
              const data = resourceData[team.Title];
              return (
                <div key={team.Title} className="allocation-card">
                  <div className="allocation-header">
                    <h4>{team.Title}</h4>
                    <div className="allocation-score">{data.efficiency}%</div>
                  </div>
                  <div className="allocation-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">High Priority Items:</span>
                      <span className="breakdown-value">{data.highPriorityItems}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Blocked Items:</span>
                      <span className="breakdown-value">{data.blockedItems}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Technical Debt:</span>
                      <span className="breakdown-value">{data.technicalDebt}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Sprint Capacity:</span>
                      <span className="breakdown-value">{data.sprintCapacity} pts</span>
                    </div>
                  </div>
                  <div className="allocation-chart">
                    <div className="chart-item">
                      <div className="chart-label">Work Items</div>
                      <div className="chart-bar">
                        <div 
                          className="chart-fill work" 
                          style={{ width: `${(data.allocatedCapacity / data.totalCapacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="chart-item">
                      <div className="chart-label">Available</div>
                      <div className="chart-bar">
                        <div 
                          className="chart-fill available" 
                          style={{ width: `${(data.availableCapacity / data.totalCapacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {selectedView === 'planning' && (
        <div className="planning-view">
          <h3>Capacity Planning & Recommendations</h3>
          <div className="planning-recommendations">
            {getPlanningRecommendations().map((rec, index) => (
              <div key={index} className={`recommendation-card ${rec.type}`}>
                <div className="recommendation-header">
                  <div className="recommendation-type">{rec.type.toUpperCase()}</div>
                  <div className="recommendation-priority">{rec.priority}</div>
                </div>
                <div className="recommendation-team">{rec.team}</div>
                <div className="recommendation-message">{rec.message}</div>
              </div>
            ))}
          </div>
          
          <div className="planning-insights">
            <h4>Planning Insights</h4>
            <div className="insights-grid">
              <div className="insight-item">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <h5>Capacity Trends</h5>
                  <p>Overall team utilization is {overallCapacity.avgUtilization}%, which is within optimal range.</p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <h5>Resource Optimization</h5>
                  <p>{overallCapacity.totalAvailable.toLocaleString()} hours of available capacity across all teams.</p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon">⚖️</div>
                <div className="insight-content">
                  <h5>Work Distribution</h5>
                  <p>Consider redistributing work to balance team utilization levels.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Risk Management & Compliance Component
 * Shows risk assessment, compliance tracking, and mitigation strategies
 */
function RiskManagement({ teams, epics, backlog, sprints }) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all'); // all, high, medium, low
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, technical, operational, security, compliance
  
  const riskData = useMemo(() => {
    const risks = [];
    
    // Generate risk data based on current data
    teams.forEach(team => {
      const teamEpics = epics.filter(epic => epic.Team === team.Title);
      const teamBacklog = backlog.filter(item => item.Team === team.Title);
      
      // Technical risks
      const technicalDebt = teamBacklog.filter(item => 
        item.Type === 'Technical Debt' || item.Description?.includes('refactor')
      ).length;
      if (technicalDebt > 2) {
        risks.push({
          id: `tech-${team.Title}`,
          title: 'Technical Debt Accumulation',
          description: `Team ${team.Title} has ${technicalDebt} technical debt items`,
          category: 'technical',
          level: technicalDebt > 5 ? 'high' : 'medium',
          team: team.Title,
          impact: 'Code quality degradation, increased maintenance costs',
          probability: technicalDebt > 5 ? 'high' : 'medium',
          mitigation: 'Plan refactoring sprints, allocate 20% capacity to technical debt',
          status: 'active',
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }
      
      // Operational risks
      const blockedItems = teamBacklog.filter(item => item.Status === 'Blocked').length;
      if (blockedItems > 3) {
        risks.push({
          id: `op-${team.Title}`,
          title: 'High Blocked Items',
          description: `Team ${team.Title} has ${blockedItems} blocked work items`,
          category: 'operational',
          level: blockedItems > 6 ? 'high' : 'medium',
          team: team.Title,
          impact: 'Delayed delivery, reduced team velocity',
          probability: 'high',
          mitigation: 'Daily blocker review, escalate to stakeholders',
          status: 'active',
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }
      
      // Security risks
      if (teamEpics.some(epic => epic.Description?.includes('security') || epic.Description?.includes('vulnerability'))) {
        risks.push({
          id: `sec-${team.Title}`,
          title: 'Security Vulnerabilities',
          description: `Team ${team.Title} has security-related epics`,
          category: 'security',
          level: 'high',
          team: team.Title,
          impact: 'Potential security breaches, compliance violations',
          probability: 'medium',
          mitigation: 'Prioritize security fixes, conduct security reviews',
          status: 'active',
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }
      
      // Compliance risks
      if (teamEpics.some(epic => epic.Description?.includes('compliance') || epic.Description?.includes('audit'))) {
        risks.push({
          id: `comp-${team.Title}`,
          title: 'Compliance Requirements',
          description: `Team ${team.Title} has compliance-related epics`,
          category: 'compliance',
          level: 'medium',
          team: team.Title,
          impact: 'Regulatory violations, legal consequences',
          probability: 'medium',
          mitigation: 'Regular compliance reviews, documentation updates',
          status: 'active',
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }
    });
    
    // Add some general organizational risks
    const totalEpics = epics.length;
    const activeEpics = epics.filter(epic => epic.Status === 'Active').length;
    const completionRate = (activeEpics / totalEpics) * 100;
    
    if (completionRate < 30) {
      risks.push({
        id: 'org-delivery',
        title: 'Low Delivery Rate',
        description: `Only ${Math.round(completionRate)}% of epics are active`,
        category: 'operational',
        level: 'high',
        team: 'Organization',
        impact: 'Missed deadlines, stakeholder dissatisfaction',
        probability: 'high',
        mitigation: 'Review epic prioritization, increase team capacity',
        status: 'active',
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
    
    return risks;
  }, [teams, epics, backlog]);
  
  const filteredRisks = useMemo(() => {
    return riskData.filter(risk => {
      const levelMatch = selectedRiskLevel === 'all' || risk.level === selectedRiskLevel;
      const categoryMatch = selectedCategory === 'all' || risk.category === selectedCategory;
      return levelMatch && categoryMatch;
    });
  }, [riskData, selectedRiskLevel, selectedCategory]);
  
  const riskSummary = useMemo(() => {
    const total = riskData.length;
    const high = riskData.filter(r => r.level === 'high').length;
    const medium = riskData.filter(r => r.level === 'medium').length;
    const low = riskData.filter(r => r.level === 'low').length;
    
    const byCategory = {
      technical: riskData.filter(r => r.category === 'technical').length,
      operational: riskData.filter(r => r.category === 'operational').length,
      security: riskData.filter(r => r.category === 'security').length,
      compliance: riskData.filter(r => r.category === 'compliance').length
    };
    
    return { total, high, medium, low, byCategory };
  }, [riskData]);
  
  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };
  
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return '⚙️';
      case 'operational': return '📊';
      case 'security': return '🔒';
      case 'compliance': return '📋';
      default: return '❓';
    }
  };
  
  return (
    <div className="risk-management-section">
      <div className="risk-header">
        <h2>Risk Management & Compliance</h2>
        <div className="risk-controls">
          <div className="risk-filter">
            <label>Risk Level:</label>
            <select 
              value={selectedRiskLevel} 
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="risk-select"
            >
              <option value="all">All Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
          <div className="risk-filter">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="risk-select"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="operational">Operational</option>
              <option value="security">Security</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="risk-overview">
        <div className="overview-metric">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value">{riskSummary.total}</div>
            <div className="metric-label">Total Risks</div>
          </div>
        </div>
        <div className="overview-metric">
          <div className="metric-icon">🔴</div>
          <div className="metric-content">
            <div className="metric-value">{riskSummary.high}</div>
            <div className="metric-label">High Risk</div>
          </div>
        </div>
        <div className="overview-metric">
          <div className="metric-icon">🟡</div>
          <div className="metric-content">
            <div className="metric-value">{riskSummary.medium}</div>
            <div className="metric-label">Medium Risk</div>
          </div>
        </div>
        <div className="overview-metric">
          <div className="metric-icon">🟢</div>
          <div className="metric-content">
            <div className="metric-value">{riskSummary.low}</div>
            <div className="metric-label">Low Risk</div>
          </div>
        </div>
      </div>
      
      <div className="risk-categories">
        <h3>Risk Distribution by Category</h3>
        <div className="category-grid">
          {Object.entries(riskSummary.byCategory).map(([category, count]) => (
            <div key={category} className="category-card">
              <div className="category-icon">{getCategoryIcon(category)}</div>
              <div className="category-content">
                <div className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</div>
                <div className="category-count">{count} risks</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="risk-list">
        <h3>Risk Assessment & Mitigation</h3>
        <div className="risks-grid">
          {filteredRisks.map(risk => (
            <div key={risk.id} className={`risk-card ${risk.level}`}>
              <div className="risk-header-card">
                <div className="risk-title">
                  <div className="risk-icon" style={{ color: getRiskColor(risk.level) }}>
                    {getRiskIcon(risk.level)}
                  </div>
                  <h4>{risk.title}</h4>
                </div>
                <div className="risk-level" style={{ color: getRiskColor(risk.level) }}>
                  {risk.level.toUpperCase()}
                </div>
              </div>
              
              <div className="risk-details">
                <div className="detail-item">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">
                    {getCategoryIcon(risk.category)} {risk.category}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Team:</span>
                  <span className="detail-value">{risk.team}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Probability:</span>
                  <span className="detail-value">{risk.probability}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated:</span>
                  <span className="detail-value">{risk.lastUpdated}</span>
                </div>
              </div>
              
              <div className="risk-description">
                <p>{risk.description}</p>
              </div>
              
              <div className="risk-impact">
                <div className="impact-label">Impact:</div>
                <div className="impact-text">{risk.impact}</div>
              </div>
              
              <div className="risk-mitigation">
                <div className="mitigation-label">Mitigation Strategy:</div>
                <div className="mitigation-text">{risk.mitigation}</div>
              </div>
              
              <div className="risk-actions">
                <button className="action-btn primary">Update Risk</button>
                <button className="action-btn secondary">View Details</button>
                <button className="action-btn success">Mark Resolved</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="compliance-section">
        <h3>Compliance & Governance</h3>
        <div className="compliance-grid">
          <div className="compliance-card">
            <div className="compliance-icon">📋</div>
            <div className="compliance-content">
              <h4>Audit Readiness</h4>
              <p>Current compliance score: 85%</p>
              <div className="compliance-bar">
                <div className="compliance-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
          <div className="compliance-card">
            <div className="compliance-icon">🔒</div>
            <div className="compliance-content">
              <h4>Security Standards</h4>
              <p>Security compliance: 92%</p>
              <div className="compliance-bar">
                <div className="compliance-fill" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
          <div className="compliance-card">
            <div className="compliance-icon">⚖️</div>
            <div className="compliance-content">
              <h4>Regulatory Compliance</h4>
              <p>Regulatory score: 78%</p>
              <div className="compliance-bar">
                <div className="compliance-fill" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="risk-recommendations">
        <h3>Risk Management Recommendations</h3>
        <div className="recommendations-list">
          <div className="recommendation-item">
            <div className="recommendation-icon">🎯</div>
            <div className="recommendation-content">
              <h4>Prioritize High-Risk Items</h4>
              <p>Focus on resolving high-risk items first to reduce overall exposure</p>
            </div>
          </div>
          <div className="recommendation-item">
            <div className="recommendation-icon">📅</div>
            <div className="recommendation-content">
              <h4>Regular Risk Reviews</h4>
              <p>Schedule weekly risk assessment meetings with stakeholders</p>
            </div>
          </div>
          <div className="recommendation-item">
            <div className="recommendation-icon">📊</div>
            <div className="recommendation-content">
              <h4>Risk Metrics Dashboard</h4>
              <p>Implement real-time risk monitoring and alerting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DORA Metrics Component
 * Shows industry-standard DevOps performance metrics
 */
function DORAMetrics({ teams, epics, backlog, sprints }) {
  const [selectedMetric, setSelectedMetric] = useState('deployment');
  
  const calculateDORAMetrics = useMemo(() => {
    // Deployment Frequency (deployments per day)
    const deploymentFrequency = teams.length > 0 ? 
      Math.round((teams.reduce((sum, team) => sum + (parseInt(team.StoryPoints) || 0), 0) / 30) * 100) / 100 : 0;
    
    // Lead Time (time from commit to deployment)
    const leadTime = epics.length > 0 ? 
      Math.round(epics.reduce((sum, epic) => {
        if (epic.StartDate && epic.EndDate) {
          const start = new Date(epic.StartDate);
          const end = new Date(epic.EndDate);
          return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }
        return sum;
      }, 0) / epics.length) : 0;
    
    // Mean Time to Recovery (MTTR) - simulated based on team performance
    const mttr = teams.length > 0 ? 
      Math.round(teams.reduce((sum, team) => {
        const velocity = parseInt(team.StoryPoints) || 0;
        const capacity = 50; // Default capacity
        const utilization = velocity / capacity;
        // Higher utilization = lower MTTR (better performance)
        return sum + Math.max(1, Math.round(24 / (utilization + 0.1)));
      }, 0) / teams.length) : 0;
    
    // Change Failure Rate (percentage of deployments causing failures)
    const changeFailureRate = backlog.length > 0 ? 
      Math.round((backlog.filter(item => item.Status === 'Blocked').length / backlog.length) * 100) : 0;
    
    return {
      deploymentFrequency,
      leadTime,
      mttr,
      changeFailureRate
    };
  }, [teams, epics, backlog, sprints]);
  
  const getMetricColor = (metric, value) => {
    switch (metric) {
      case 'deployment':
        return value >= 1 ? '#22c55e' : value >= 0.5 ? '#f59e0b' : '#ef4444';
      case 'leadTime':
        return value <= 7 ? '#22c55e' : value <= 14 ? '#f59e0b' : '#ef4444';
      case 'mttr':
        return value <= 4 ? '#22c55e' : value <= 8 ? '#f59e0b' : '#ef4444';
      case 'changeFailure':
        return value <= 5 ? '#22c55e' : value <= 15 ? '#f59e0b' : '#ef4444';
      default:
        return '#6b7280';
    }
  };
  
  const getMetricStatus = (metric, value) => {
    switch (metric) {
      case 'deployment':
        return value >= 1 ? 'Elite' : value >= 0.5 ? 'High' : 'Low';
      case 'leadTime':
        return value <= 7 ? 'Elite' : value <= 14 ? 'High' : 'Low';
      case 'mttr':
        return value <= 4 ? 'Elite' : value <= 8 ? 'High' : 'Low';
      case 'changeFailure':
        return value <= 5 ? 'Elite' : value <= 15 ? 'High' : 'Low';
      default:
        return 'Unknown';
    }
  };
  
  const metrics = [
    {
      key: 'deployment',
      label: 'Deployment Frequency',
      value: calculateDORAMetrics.deploymentFrequency,
      unit: 'deployments/day',
      description: 'How often code is deployed to production',
      target: '≥1 deployment/day'
    },
    {
      key: 'leadTime',
      label: 'Lead Time',
      value: calculateDORAMetrics.leadTime,
      unit: 'days',
      description: 'Time from code commit to production deployment',
      target: '≤7 days'
    },
    {
      key: 'mttr',
      label: 'Mean Time to Recovery',
      value: calculateDORAMetrics.mttr,
      unit: 'hours',
      description: 'Time to restore service after failure',
      target: '≤4 hours'
    },
    {
      key: 'changeFailure',
      label: 'Change Failure Rate',
      value: calculateDORAMetrics.changeFailureRate,
      unit: '%',
      description: 'Percentage of deployments causing failures',
      target: '≤5%'
    }
  ];

  return (
    <div className="dora-metrics-section">
      <div className="dora-header">
        <h2>DORA Metrics</h2>
        <p>Industry-standard DevOps performance indicators</p>
      </div>
      
      <div className="dora-metrics-grid">
        {metrics.map((metric) => (
          <div 
            key={metric.key}
            className={`dora-metric-card ${selectedMetric === metric.key ? 'selected' : ''}`}
            onClick={() => setSelectedMetric(metric.key)}
          >
            <div className="metric-header">
              <div className="metric-icon">
                {metric.key === 'deployment' && '🚀'}
                {metric.key === 'leadTime' && '⏱️'}
                {metric.key === 'mttr' && '🔧'}
                {metric.key === 'changeFailure' && '⚠️'}
              </div>
              <div className="metric-status" style={{ 
                backgroundColor: getMetricColor(metric.key, metric.value) 
              }}>
                {getMetricStatus(metric.key, metric.value)}
            </div>
              </div>
            
            <div className="metric-content">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">
                {metric.value}
                <span className="metric-unit">{metric.unit}</span>
              </div>
              <div className="metric-target">{metric.target}</div>
              </div>
            
            <div className="metric-description">{metric.description}</div>
            </div>
        ))}
      </div>
      
      {/* Detailed Metric View */}
      <div className="dora-detail-view">
        <div className="detail-header">
          <h3>{metrics.find(m => m.key === selectedMetric)?.label} Details</h3>
          <div className="metric-trend">
            <span className="trend-label">Performance Level:</span>
            <span className="trend-value" style={{ 
              color: getMetricColor(selectedMetric, metrics.find(m => m.key === selectedMetric)?.value || 0) 
            }}>
              {getMetricStatus(selectedMetric, metrics.find(m => m.key === selectedMetric)?.value || 0)}
            </span>
          </div>
        </div>
        
        <div className="metric-breakdown">
          <div className="breakdown-item">
            <div className="breakdown-label">Current Value</div>
            <div className="breakdown-value">
              {metrics.find(m => m.key === selectedMetric)?.value}
              <span className="breakdown-unit">
                {metrics.find(m => m.key === selectedMetric)?.unit}
              </span>
            </div>
          </div>
          
          <div className="breakdown-item">
            <div className="breakdown-label">Target</div>
            <div className="breakdown-value">
              {metrics.find(m => m.key === selectedMetric)?.target}
            </div>
          </div>
          
          <div className="breakdown-item">
            <div className="breakdown-label">Status</div>
            <div className="breakdown-value">
              <span className="status-badge" style={{ 
                backgroundColor: getMetricColor(selectedMetric, metrics.find(m => m.key === selectedMetric)?.value || 0) 
              }}>
                {getMetricStatus(selectedMetric, metrics.find(m => m.key === selectedMetric)?.value || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="metric-insights">
          <h4>Insights & Recommendations</h4>
          <div className="insights-content">
            {selectedMetric === 'deployment' && (
              <div>
                <p><strong>Current Performance:</strong> {calculateDORAMetrics.deploymentFrequency >= 1 ? 'Elite' : calculateDORAMetrics.deploymentFrequency >= 0.5 ? 'High' : 'Low'} deployment frequency</p>
                <p><strong>Recommendation:</strong> {calculateDORAMetrics.deploymentFrequency >= 1 ? 'Maintain excellent deployment practices' : 'Focus on automation and CI/CD pipeline optimization'}</p>
              </div>
            )}
            {selectedMetric === 'leadTime' && (
              <div>
                <p><strong>Current Performance:</strong> {calculateDORAMetrics.leadTime <= 7 ? 'Elite' : calculateDORAMetrics.leadTime <= 14 ? 'High' : 'Low'} lead time</p>
                <p><strong>Recommendation:</strong> {calculateDORAMetrics.leadTime <= 7 ? 'Excellent development workflow' : 'Streamline approval processes and reduce manual steps'}</p>
              </div>
            )}
            {selectedMetric === 'mttr' && (
              <div>
                <p><strong>Current Performance:</strong> {calculateDORAMetrics.mttr <= 4 ? 'Elite' : calculateDORAMetrics.mttr <= 8 ? 'High' : 'Low'} recovery time</p>
                <p><strong>Recommendation:</strong> {calculateDORAMetrics.mttr <= 4 ? 'Strong incident response capabilities' : 'Improve monitoring, alerting, and runbook documentation'}</p>
              </div>
            )}
            {selectedMetric === 'changeFailure' && (
              <div>
                <p><strong>Current Performance:</strong> {calculateDORAMetrics.changeFailureRate <= 5 ? 'Elite' : calculateDORAMetrics.changeFailureRate <= 15 ? 'High' : 'Low'} failure rate</p>
                <p><strong>Recommendation:</strong> {calculateDORAMetrics.changeFailureRate <= 5 ? 'Excellent quality practices' : 'Enhance testing, code review, and deployment validation'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sprint Planning Component
 * Shows upcoming sprints and release planning
 */
function SprintPlanning({ sprints }) {
  return (
    <div className="sprint-planning-section">
      <div className="sprint-timeline">
        {sprints.map((sprint, index) => (
          <div className={`sprint-item ${sprint.Status?.toLowerCase() || 'unknown'}`} key={index}>
            <div className="sprint-header">
              <div className="sprint-name">{sprint.Title || 'Untitled Sprint'}</div>
              <div className="sprint-status" style={{ backgroundColor: STATUS_COLORS[sprint.Status?.toUpperCase()] || STATUS_COLORS.DEFAULT }}>
                {sprint.Status || 'Unknown'}
              </div>
            </div>
            <div className="sprint-dates">
              {sprint.StartDate || 'No start date'} - {sprint.EndDate || 'No end date'}
            </div>
            <div className="sprint-goals">
              <div className="goal-title">Goals:</div>
              <div className="goal-text">
                {sprint.Goals || 'No goals defined'}
              </div>
            </div>
            <div className="sprint-metrics">
              <div className="metric">
                <span className="metric-label">Story Points:</span>
                <span className="metric-value">{sprint.StoryPoints || 0} points</span>
              </div>
              <div className="metric">
                <span className="metric-label">Progress:</span>
                <span className="metric-value">{sprint.Progress || 0}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Team:</span>
                <span className="metric-value">{sprint.Team || 'Unassigned'}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Priority:</span>
                <span className="metric-value">{sprint.Priority || 'Medium'}</span>
              </div>
            </div>
            
            {/* Burndown Chart for Active Sprints */}
            {sprint.Status === 'Active' && (
              <BurndownChart sprint={sprint} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * DevOps Maturity Component
 * Shows organizational DevOps maturity assessment
 */
function DevOpsMaturity({ maturity }) {
  const getMaturityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'expert': return STATUS_COLORS.COMPLETED;
      case 'advanced': return STATUS_COLORS.ON_TRACK;
      case 'intermediate': return STATUS_COLORS.AT_RISK;
      case 'beginner': return STATUS_COLORS.DELAYED;
      default: return STATUS_COLORS.DEFAULT;
    }
  };

  return (
    <div className="devops-maturity-section">
      <h3>DevOps Maturity Assessment</h3>
      <div className="maturity-overview">
        <div className="overall-score">
          <div className="score-number">{maturity.length > 0 ? Math.round(maturity.reduce((sum, item) => sum + (parseInt(item.Progress) || 0), 0) / maturity.length) : 0}</div>
          <div className="score-label">Average Maturity Score</div>
          <div className="score-level">Overall Assessment</div>
        </div>
      </div>
      
      <div className="maturity-dimensions">
        {maturity.map((item, index) => (
          <div className="maturity-dimension" key={index}>
            <div className="dimension-header">
              <div className="dimension-name">{item.Title || 'Unknown Assessment'}</div>
              <div className="dimension-score">{item.Progress || 0}/100</div>
            </div>
            <div className="dimension-bar">
              <div 
                className="dimension-fill"
                style={{
                  width: `${item.Progress || 0}%`,
                  backgroundColor: getMaturityColor(item.Status)
                }}
              ></div>
            </div>
            <div className="dimension-level">{item.Status || 'Unknown'}</div>
            <div className="dimension-description">{item.Description || 'No description available'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main DevOps Analytics Component
 */
export default function DevOpsAnalytics({ sidebarCollapsed }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedEpicStatuses, setSelectedEpicStatuses] = useState([]);
  const [selectedTeamStatuses, setSelectedTeamStatuses] = useState([]);
  const [selectedBacklogStatuses, setSelectedBacklogStatuses] = useState([]);
  const [selectedSprintStatuses, setSelectedSprintStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    { query: 'portal redesign', time: '2 min ago' },
    { query: 'high priority', time: '5 min ago' },
    { query: 'active sprints', time: '10 min ago' }
  ]);
  const [savedFilters, setSavedFilters] = useState([
    { name: 'High Priority Items', query: 'priority:high' },
    { name: 'Blocked Items', query: 'status:blocked' },
    { name: 'Active Sprints', query: 'status:active' }
  ]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Sprint 12 Deadline Approaching',
      message: 'Sprint 12 ends in 2 days. Current progress: 75%',
      type: 'alert',
      time: '5 min ago',
      read: false
    },
    {
      id: 2,
      title: 'New Epic Created',
      message: 'API Gateway Implementation epic has been created',
      type: 'update',
      time: '15 min ago',
      read: false
    },
    {
      id: 3,
      title: 'Team Velocity Alert',
      message: 'Backend Team velocity dropped by 15%',
      type: 'alert',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      title: 'Deployment Success',
      message: 'Customer Portal v2.1 deployed successfully',
      type: 'update',
      time: '2 hours ago',
      read: true
    }
  ]);

  // Load DevOps organizational data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the Promise-based version of loadCSV
        const publicUrl = process.env.PUBLIC_URL || '';
        const filePath = `${publicUrl}/data/devops-organizational.csv`;
        console.log('Attempting to load from path:', filePath);
        
        const devopsData = await loadCSV(filePath);
        console.log('Raw DevOps organizational data received:', devopsData);
        
        if (devopsData && Array.isArray(devopsData) && devopsData.length > 0) {
          console.log('DevOps organizational data loaded successfully:', devopsData);
              setData(devopsData);
            } else {
          console.warn('DevOps organizational data is empty or invalid:', devopsData);
          setError('No data found in DevOps organizational file');
        }
      } catch (err) {
        console.error('Error loading DevOps organizational data:', err);
        setError(err.message || 'Failed to load DevOps organizational data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Advanced search handlers
  const handleAdvancedSearch = (searchData) => {
    const { query, mode, operator, pattern } = searchData;
    
    // Add to search history
    const newSearch = {
      query: mode === 'boolean' ? `${query} ${operator} ${pattern}` : query,
      time: 'Just now'
    };
    setSearchHistory(prev => [newSearch, ...prev.slice(0, 4)]);
    
    // Apply search logic based on mode
    if (mode === 'boolean') {
      // Boolean search logic
      console.log('Boolean search:', query, operator, pattern);
    } else if (mode === 'wildcard') {
      // Wildcard search logic
      console.log('Wildcard search:', pattern);
    } else {
      // Simple search
      setSearchQuery(query);
    }
  };
  
  const handleFilterChange = (filter) => {
    switch (filter.type) {
      case 'high-priority':
        setSelectedPriorities(['High']);
        break;
      case 'blocked-items':
        setSelectedEpicStatuses(['Blocked']);
        setSelectedBacklogStatuses(['Blocked']);
        break;
      case 'overdue':
        // Logic for overdue items
        break;
      case 'active-sprints':
        setSelectedSprintStatuses(['Active']);
        break;
      case 'planning-phase':
        setSelectedEpicStatuses(['Planning']);
        setSelectedSprintStatuses(['Planning']);
        break;
      default:
        break;
    }
  };
  
  const handleNotificationDismiss = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const handleNotificationMarkRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mock data for demonstration (replace with actual CSV data)
  const mockData = {
    epics: [
      {
        id: 'EPIC-001',
        title: 'Customer Portal Redesign',
        description: 'Complete redesign of customer-facing portal with modern UI/UX',
        status: 'Active',
        team: 'Frontend Team',
        priority: 'High',
        progress: 65,
        storyCount: 24,
        storyPoints: 89,
        currentSprint: 'Sprint 12'
      },
      {
        id: 'EPIC-002',
        title: 'API Gateway Implementation',
        description: 'Implement centralized API gateway for microservices',
        status: 'Planning',
        team: 'Backend Team',
        priority: 'High',
        progress: 15,
        storyCount: 18,
        storyPoints: 67,
        currentSprint: 'Sprint 13'
      },
      {
        id: 'EPIC-003',
        title: 'Mobile App Development',
        description: 'Native mobile applications for iOS and Android',
        status: 'Active',
        team: 'Mobile Team',
        priority: 'Medium',
        progress: 45,
        storyCount: 32,
        storyPoints: 124,
        currentSprint: 'Sprint 11'
      }
    ],
    teams: [
      { name: 'Frontend Team', averageVelocity: 45, teamCapacity: 50, velocityTrend: 5 },
      { name: 'Backend Team', averageVelocity: 38, teamCapacity: 45, velocityTrend: -2 },
      { name: 'Mobile Team', averageVelocity: 52, teamCapacity: 55, velocityTrend: 8 },
      { name: 'QA Team', averageVelocity: 28, teamCapacity: 30, velocityTrend: 3 }
    ],
    backlog: [
      { id: 'STORY-001', title: 'User Authentication', type: 'Story', status: 'Ready', priority: 'High', team: 'Backend' },
      { id: 'STORY-002', title: 'Dashboard Widgets', type: 'Story', status: 'In Progress', priority: 'Medium', team: 'Frontend' },
      { id: 'STORY-003', title: 'Push Notifications', type: 'Story', status: 'Ready', priority: 'High', team: 'Mobile' },
      { id: 'EPIC-004', title: 'Data Analytics Platform', type: 'Epic', status: 'Planning', priority: 'Medium', team: 'Data' }
    ],
    sprints: [
      {
        name: 'Sprint 12',
        status: 'Active',
        startDate: '2024-12-16',
        endDate: '2024-12-29',
        goals: ['Complete customer portal MVP', 'Implement core authentication'],
        capacity: 120,
        committed: 98,
        teams: ['Frontend', 'Backend']
      },
      {
        name: 'Sprint 13',
        status: 'Planning',
        startDate: '2024-12-30',
        endDate: '2025-01-12',
        goals: ['API gateway foundation', 'Mobile app beta release'],
        capacity: 135,
        committed: 0,
        teams: ['Backend', 'Mobile']
      }
    ],

  };

  // Transform CSV data into the expected structure
  const transformCSVData = (csvData) => {
    try {
      if (!csvData || !Array.isArray(csvData)) return mockData;
      
      const epics = csvData.filter(item => item.Type === 'Epic');
      const teams = csvData.filter(item => item.Type === 'Team');
      const backlog = csvData.filter(item => item.Type === 'Backlog');
      const sprints = csvData.filter(item => item.Type === 'Sprint');
      
      return { epics, teams, backlog, sprints };
    } catch (error) {
      console.error('Error transforming CSV data:', error);
      return mockData;
    }
  };

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!data) return mockData;
    
    const rawData = transformCSVData(data);
    
    // Helper function to apply filters
    const applyFilters = (items, filters) => {
      return items.filter(item => {
        // Status filter
        if (filters.statuses && filters.statuses.length > 0) {
          if (!filters.statuses.includes(item.Status)) return false;
        }
        
        // Priority filter
        if (filters.priorities && filters.priorities.length > 0) {
          if (!filters.priorities.includes(item.Priority)) return false;
        }
        
        // Team filter
        if (filters.teams && filters.teams.length > 0) {
          if (!filters.teams.includes(item.Team)) return false;
        }
        
        // Search query
        if (filters.search && filters.search.trim()) {
          const query = filters.search.toLowerCase();
          const searchableFields = [
            item.Title || '',
            item.Description || '',
            item.ID || '',
            item.Team || ''
          ].join(' ').toLowerCase();
          
          if (!searchableFields.includes(query)) return false;
        }
        
        return true;
      });
    };
    
    return {
      epics: applyFilters(rawData.epics, {
        statuses: selectedEpicStatuses,
        priorities: selectedPriorities,
        teams: selectedTeams,
        search: searchQuery
      }),
      teams: applyFilters(rawData.teams, {
        statuses: selectedTeamStatuses,
        search: searchQuery
      }),
      backlog: applyFilters(rawData.backlog, {
        statuses: selectedBacklogStatuses,
        priorities: selectedPriorities,
        teams: selectedTeams,
        search: searchQuery
      }),
      sprints: applyFilters(rawData.sprints, {
        statuses: selectedSprintStatuses,
        search: searchQuery
      })
    };
  }, [data, selectedEpicStatuses, selectedTeamStatuses, selectedBacklogStatuses, selectedSprintStatuses, selectedPriorities, selectedTeams, searchQuery]);

  // Use filtered data or mock data if CSV loading fails
  const displayData = filteredData || mockData;

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-main-bg" style={{ marginLeft: sidebarCollapsed ? 0 : 200 }}>
      <div className="devops-analytics">
          <div className="devops-container">
        <div className="devops-header">
          <div className="header-content">
            <h1>DevOps Analytics Dashboard</h1>
                <p>Loading organizational DevOps data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-main-bg" style={{ marginLeft: sidebarCollapsed ? 0 : 200 }}>
      <div className="devops-analytics">
          <div className="devops-container">
        <div className="devops-header">
          <div className="header-content">
            <h1>DevOps Analytics Dashboard</h1>
            <p>Error loading data: {error}</p>
                <p>Using demonstration data for preview</p>
          </div>
        </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main-bg" style={{ marginLeft: sidebarCollapsed ? 0 : 200 }}>
    <div className="devops-analytics">
        <div className="devops-container">
          <AISidePanel
            title="DevOps Analytics Assistant"
            description="Get intelligent insights about your DevOps portfolio, team performance, and project timelines."
            suggestions={[
              "Which epics are at risk of delay?",
              "Show me team capacity utilization trends",
              "What's the impact of blocked items on sprint velocity?",
              "Identify dependencies between epics and teams",
              "Analyze sprint planning efficiency",
              "Which teams need additional resources?",
              "What's the overall portfolio health status?",
              "Show me high-priority items across teams"
            ]}
            dataContext={{
              epics: displayData.epics || [],
              teams: displayData.teams || [],
              backlog: displayData.backlog || [],
              sprints: displayData.sprints || [],
              filters: {
                epicStatuses: selectedEpicStatuses,
                teamStatuses: selectedTeamStatuses,
                backlogStatuses: selectedBacklogStatuses,
                sprintStatuses: selectedSprintStatuses,
                priorities: selectedPriorities,
                teams: selectedTeams,
                search: searchQuery
              }
            }}
          />
      <div className="devops-header">
        <div className="header-content">
          <h1>DevOps Analytics Dashboard</h1>
              <p>Organizational-level DevOps insights, agile processes, and cross-team coordination</p>
        </div>
                        <div className="header-actions">
                  <NotificationCenter
                    notifications={notifications}
                    onDismiss={handleNotificationDismiss}
                    onMarkRead={handleNotificationMarkRead}
                  />
                  <div className="header-export">
                    <ExportDropdown
                      element={() => document.querySelector('.devops-container')}
                      filename="DevOps_Organizational_Dashboard"
                      additionalData={{
                        filters: {
                          epicStatuses: selectedEpicStatuses,
                          teamStatuses: selectedTeamStatuses,
                          backlogStatuses: selectedBacklogStatuses,
                          sprintStatuses: selectedSprintStatuses,
                          priorities: selectedPriorities,
                          teams: selectedTeams,
                          search: searchQuery
                        },
                        summary: {
                          totalEpics: displayData.epics?.length || 0,
                          totalTeams: displayData.teams?.length || 0,
                          totalBacklogItems: displayData.backlog?.length || 0,
                          totalSprints: displayData.sprints?.length || 0,
                          activeEpics: displayData.epics?.filter(e => e.Status === 'Active').length || 0,
                          highPriorityItems: displayData.backlog?.filter(b => b.Priority === 'High').length || 0
                        }
                      }}
                    />
                  </div>
                </div>
      </div>

        {/* Advanced Search & Filtering */}
        <AdvancedSearch
          onSearch={handleAdvancedSearch}
          onFilterChange={handleFilterChange}
          searchHistory={searchHistory}
          savedFilters={savedFilters}
        />

        {/* Filter Controls */}
        <div className="filter-section">
          <div className="filter-header">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search epics, stories, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="filter-controls">
            <StatusFilter
              statuses={['Active', 'Planning', 'Completed', 'Blocked']}
              selectedStatuses={selectedEpicStatuses}
              onStatusChange={setSelectedEpicStatuses}
              label="Epic Status"
            />
            <StatusFilter
              statuses={['Active', 'Planning', 'Completed']}
              selectedStatuses={selectedTeamStatuses}
              onStatusChange={setSelectedTeamStatuses}
              label="Team Status"
            />
            <StatusFilter
              statuses={['Ready', 'In Progress', 'Completed', 'Blocked']}
              selectedStatuses={selectedBacklogStatuses}
              onStatusChange={setSelectedBacklogStatuses}
              label="Backlog Status"
            />
            <StatusFilter
              statuses={['Active', 'Planning', 'Completed']}
              selectedStatuses={selectedSprintStatuses}
              onStatusChange={setSelectedSprintStatuses}
              label="Sprint Status"
            />
            <StatusFilter
              statuses={['High', 'Medium', 'Low']}
              selectedStatuses={selectedPriorities}
              onStatusChange={setSelectedPriorities}
              label="Priority"
            />
            <StatusFilter
              statuses={['Frontend Team', 'Backend Team', 'Mobile Team', 'Data Team', 'DevOps Team', 'Security Team', 'UX Team', 'QA Team']}
              selectedStatuses={selectedTeams}
              onStatusChange={setSelectedTeams}
              label="Team"
          />
        </div>
      </div>

        {/* Overview Dashboard */}
        <div className="overview-dashboard">
          <h2>Portfolio Overview</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">📊</div>
              <div className="overview-content">
                <div className="overview-number">{displayData.epics ? displayData.epics.length : 0}</div>
                <div className="overview-label">Total Epics</div>
                <div className="overview-subtitle">Strategic initiatives</div>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">👥</div>
              <div className="overview-content">
                <div className="overview-number">{displayData.teams ? displayData.teams.length : 0}</div>
                <div className="overview-label">Active Teams</div>
                <div className="overview-subtitle">Development teams</div>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">📋</div>
              <div className="overview-content">
                <div className="overview-number">{displayData.backlog ? displayData.backlog.length : 0}</div>
                <div className="overview-label">Backlog Items</div>
                <div className="overview-subtitle">Work items</div>
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-icon">🏃</div>
              <div className="overview-content">
                <div className="overview-number">{displayData.sprints ? displayData.sprints.length : 0}</div>
                <div className="overview-label">Active Sprints</div>
                <div className="overview-subtitle">Current & planned</div>
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-icon">⚡</div>
              <div className="overview-content">
                <div className="overview-number">{displayData.teams ? Math.round(displayData.teams.reduce((sum, team) => sum + (parseInt(team.StoryPoints) || 0), 0) / displayData.teams.length) : 0}</div>
                <div className="overview-label">Avg Velocity</div>
                <div className="overview-subtitle">Story points per team</div>
              </div>
            </div>
          </div>
        </div>

        {/* Epic Management Section */}
      <div className="epics-section">
        <h2>Epic Management</h2>
        <div className="epic-summary">
          <div className="summary-card">
            <div className="summary-number">{displayData.epics ? displayData.epics.length : 0}</div>
            <div className="summary-label">Total Epics</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{displayData.epics ? displayData.epics.filter(epic => epic.Status === 'Active').length : 0}</div>
            <div className="summary-label">Active Epics</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{displayData.epics ? displayData.epics.filter(epic => epic.Status === 'Planning').length : 0}</div>
            <div className="summary-label">Planning Epics</div>
          </div>
          <div className="summary-card">
            <div className="summary-number">{displayData.epics ? Math.round(displayData.epics.reduce((sum, epic) => sum + (parseInt(epic.Progress) || 0), 0) / displayData.epics.length) : 0}%</div>
            <div className="summary-label">Avg Progress</div>
          </div>
        </div>
        <div className="epics-grid">
          {displayData.epics && displayData.epics.length > 0 ? (
            displayData.epics.map((epic, index) => (
              <EpicCard epic={epic} key={index} />
            ))
          ) : (
            <p>No epics found in the data.</p>
          )}
        </div>
      </div>

      {/* Gantt Timeline Section */}
      {displayData.epics && displayData.epics.length > 0 && (
        <GanttTimeline epics={displayData.epics} />
      )}

      {/* Team Velocity Section */}
      {displayData.teams && displayData.teams.length > 0 && (
        <div>
          <div className="velocity-header">
            <h2>Team Velocity & Capacity</h2>
            <div className="velocity-insights">
              <div className="insight-item">
                <span className="insight-label">Total Capacity:</span>
                <span className="insight-value">{displayData.teams ? displayData.teams.reduce((sum, team) => sum + 50, 0) : 0} points</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Avg Utilization:</span>
                <span className="insight-value">{displayData.teams ? Math.round(displayData.teams.reduce((sum, team) => sum + (parseInt(team.StoryPoints) || 0), 0) / displayData.teams.length / 50 * 100) : 0}%</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Top Performer:</span>
                <span className="insight-value">{displayData.teams ? displayData.teams.reduce((max, team) => (parseInt(team.StoryPoints) || 0) > (parseInt(max.StoryPoints) || 0) ? team : max).Title : 'N/A'}</span>
              </div>
            </div>
          </div>
          <TeamVelocity teams={displayData.teams} />
        </div>
      )}

                {/* Backlog Overview Section */}
      {displayData.backlog && displayData.backlog.length > 0 && (
        <div>
          <div className="backlog-header">
            <h2>Backlog Overview</h2>
            <div className="backlog-insights">
              <div className="insight-item">
                <span className="insight-label">Ready Items:</span>
                <span className="insight-value">{displayData.backlog ? displayData.backlog.filter(item => item.Status === 'Ready').length : 0}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">In Progress:</span>
                <span className="insight-value">{displayData.backlog ? displayData.backlog.filter(item => item.Status === 'In Progress').length : 0}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">High Priority:</span>
                <span className="insight-value">{displayData.backlog ? displayData.backlog.filter(item => item.Priority === 'High').length : 0}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Total Story Points:</span>
                <span className="insight-value">{displayData.backlog ? displayData.backlog.reduce((sum, item) => sum + (parseInt(item.StoryPoints) || 0), 0) : 0}</span>
              </div>
            </div>
          </div>
          <BacklogOverview backlog={displayData.backlog} />
        </div>
      )}

                {/* Sprint Planning Section */}
      {displayData.sprints && displayData.sprints.length > 0 && (
        <div>
          <div className="sprint-header">
            <h2>Sprint Planning & Execution</h2>
            <div className="sprint-insights">
              <div className="insight-item">
                <span className="insight-label">Active Sprints:</span>
                <span className="insight-value">{displayData.sprints ? displayData.sprints.filter(sprint => sprint.Status === 'Active').length : 0}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Planning Sprints:</span>
                <span className="insight-value">{displayData.sprints ? displayData.sprints.filter(sprint => sprint.Status === 'Planning').length : 0}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Total Story Points:</span>
                <span className="insight-value">{displayData.sprints ? displayData.sprints.reduce((sum, sprint) => sum + (parseInt(sprint.StoryPoints) || 0), 0) : 0}</span>
              </div>
              <div className="insight-item">
                <span className="insight-label">Avg Sprint Duration:</span>
                <span className="insight-value">2 weeks</span>
              </div>
            </div>
          </div>
          <SprintPlanning sprints={displayData.sprints} />
        </div>
      )}

      {/* DORA Metrics Section */}
      <DORAMetrics 
        teams={displayData.teams || []}
        epics={displayData.epics || []}
        backlog={displayData.backlog || []}
        sprints={displayData.sprints || []}
      />

      {/* Performance Analytics & Trends Section */}
      <PerformanceAnalytics
        teams={displayData.teams || []}
        epics={displayData.epics || []}
        backlog={displayData.backlog || []}
        sprints={displayData.sprints || []}
      />

      {/* Team Collaboration & Communication Section */}
      <TeamCollaboration
        teams={displayData.teams || []}
        epics={displayData.epics || []}
        backlog={displayData.backlog || []}
        sprints={displayData.sprints || []}
      />

      {/* Resource Management & Capacity Planning Section */}
      <ResourceManagement
        teams={displayData.teams || []}
        epics={displayData.epics || []}
        backlog={displayData.backlog || []}
        sprints={displayData.sprints || []}
      />

      {/* Risk Management & Compliance Section */}
      <RiskManagement
        teams={displayData.teams || []}
        epics={displayData.epics || []}
        backlog={displayData.backlog || []}
        sprints={displayData.sprints || []}
      />

        </div>
      </div>
    </div>
  );
}
