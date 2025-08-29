import * as d3 from 'd3';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

import { loadCSV } from '../dataLoader';

import AISidePanel from './AISidePanel';
import ExportDropdown from './ExportDropdown';
import PortfolioFilter from './PortfolioFilter';

import './DependencyGraph.css';

// Simple StatusFilter component for dependency graph
function StatusFilter({ statuses, selectedStatuses, onStatusChange }) {
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

export default function DependencyGraph({ sidebarCollapsed }) {
  const [projects, setProjects] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [insights, setInsights] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState({});

  // AI Assistant state
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // Load project data
  useEffect(() => {
    loadCSV(`${process.env.PUBLIC_URL}/data/demo.csv`, setProjects);
  }, []);

  // Get unique portfolios and statuses
  const portfolios = [...new Set(projects.map(p => p.Portfolio))];
  const allStatuses = [...new Set(projects.map(p => p.Status).filter(Boolean))];

  // Filter projects by portfolio and status
  const filtered = useMemo(() => {
    return projects.filter(p => {
      const portfolioMatch = !selectedPortfolio || p.Portfolio === selectedPortfolio;
      const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(p.Status);

      return portfolioMatch && statusMatch;
    });
  }, [projects, selectedPortfolio, selectedStatuses]);

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'on track': return '#22c55e';
      case 'delayed': return '#ef4444';
      case 'completed': return '#3b82f6';
      case 'at risk': return '#f59e42';
      default: return '#a3a3a3';
    }
  };

  // Function to create D3 visualization
  const createD3Visualization = useCallback((nodes, links) => {
    if (!svgRef.current) return;

    console.log(`Starting D3 visualization with: ${nodes.length} nodes and ${links.length} links`);

    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();

    // Set explicit SVG dimensions
    const width = 800;
    const height = 600;

    svg.attr('width', width).attr('height', height);

    // Create simulation with better constraints
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Add viewBox for proper scaling
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Add background rectangle for debugging
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f8fafc')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1);

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.type === 'hierarchy' ? '#94a3b8' : '#ef4444')
      .attr('stroke-width', d => d.type === 'hierarchy' ? 2 : 3)
      .attr('stroke-dasharray', d => d.type === 'dependency' ? '5,5' : 'none');

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => {
        switch(d.type) {
          case 'portfolio': return 25;
          case 'program': return 20;
          case 'project': return 15;
          default: return 15;
        }
      })
      .attr('fill', d => {
        switch(d.type) {
          case 'portfolio': return '#2563eb';
          case 'program': return '#7c3aed';
          case 'project': return getStatusColor(d.status);
          default: return '#6b7280';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels to nodes
    node.append('text')
      .text(d => d.name.length > 15 ? `${d.name.substring(0, 15)}...` : d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', d => {
        switch(d.type) {
          case 'portfolio': return '12px';
          case 'program': return '11px';
          case 'project': return '10px';
          default: return '10px';
        }
      })
      .attr('font-weight', 'bold');

    // Add tooltips
    node.append('title')
      .text(d => `${d.type.toUpperCase()}: ${d.name}`);

    // Add click handlers for detailed information
    node.on('click', (event, d) => {
      setSelectedNode(d);

      // Find all dependencies for this node
      const incomingDeps = links.filter(link => link.target.id === d.id);
      const outgoingDeps = links.filter(link => link.source.id === d.id);

      // Update node details with dependency information
      const nodeWithDeps = {
        ...d,
        incomingDependencies: incomingDeps,
        outgoingDependencies: outgoingDeps,
      };

      setSelectedNode(nodeWithDeps);
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Constrain nodes to SVG bounds
      nodes.forEach(d => {
        d.x = Math.max(25, Math.min(width - 25, d.x));
        d.y = Math.max(25, Math.min(height - 25, d.y));
      });

      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Store simulation reference for cleanup
    svgRef.current.simulation = simulation;
  }, [getStatusColor]);

  // Analyze dependencies and generate insights
  useEffect(() => {
    if (!filtered || filtered.length === 0) return;

    const newInsights = [];
    const newRiskMetrics = {
      highRiskDependencies: 0,
      delayedProjects: 0,
      blockedProjects: 0,
      criticalPathLength: 0,
    };

    // 1. Identify high-risk dependencies (delayed projects blocking others)
    const delayedProjects = filtered.filter(p => p.Status?.toLowerCase() === 'delayed');
    const onTrackProjects = filtered.filter(p => p.Status?.toLowerCase() === 'on track');

    newRiskMetrics.delayedProjects = delayedProjects.length;
    newRiskMetrics.blockedProjects = onTrackProjects.filter(p =>
      delayedProjects.some(delayed =>
        // Check if this project depends on a delayed project
        p.Program === delayed.Program || p.Portfolio === delayed.Portfolio,
      ),
    ).length;

    // 2. Find critical paths (longest dependency chains)
    const projectDependencies = {};

    filtered.forEach(project => {
      if (!projectDependencies[project.Program]) {
        projectDependencies[project.Program] = [];
      }
      projectDependencies[project.Program].push(project);
    });

    // Calculate critical path length
    let maxPathLength = 0;

    Object.values(projectDependencies).forEach(programProjects => {
      if (programProjects.length > maxPathLength) {
        maxPathLength = programProjects.length;
      }
    });
    newRiskMetrics.criticalPathLength = maxPathLength;

    // 3. Generate actionable insights
    if (delayedProjects.length > 0) {
      newInsights.push({
        type: 'warning',
        title: 'Delayed Projects Detected',
        message: `${delayedProjects.length} projects are delayed and may be blocking ${newRiskMetrics.blockedProjects} other projects`,
        action: 'Review delayed projects and update timelines',
        priority: 'high',
      });
    }

    if (newRiskMetrics.blockedProjects > 0) {
      newInsights.push({
        type: 'error',
        title: 'Blocked Projects',
        message: `${newRiskMetrics.blockedProjects} projects are potentially blocked by dependencies`,
        action: 'Prioritize delayed dependencies and communicate with stakeholders',
        priority: 'critical',
      });
    }

    if (maxPathLength > 5) {
      newInsights.push({
        type: 'info',
        title: 'Long Dependency Chain',
        message: `Critical path length is ${maxPathLength} projects`,
        action: 'Consider breaking down long dependency chains into smaller phases',
        priority: 'medium',
      });
    }

    // 4. Portfolio-specific insights
    if (selectedPortfolio) {
      const portfolioProjects = filtered.filter(p => p.Portfolio === selectedPortfolio);
      const portfolioDelayed = portfolioProjects.filter(p => p.Status?.toLowerCase() === 'delayed');

      if (portfolioDelayed.length > portfolioProjects.length * 0.3) {
        newInsights.push({
          type: 'warning',
          title: 'Portfolio Risk',
          message: `${Math.round((portfolioDelayed.length / portfolioProjects.length) * 100)}% of portfolio projects are delayed`,
          action: 'Review portfolio strategy and resource allocation',
          priority: 'high',
        });
      }
    }

    // 5. Status-based insights
    if (selectedStatuses.length > 0) {
      const statusCounts = {};

      filtered.forEach(p => {
        statusCounts[p.Status] = (statusCounts[p.Status] || 0) + 1;
      });

      Object.entries(statusCounts).forEach(([status, count]) => {
        if (status === 'At Risk' && count > 0) {
          newInsights.push({
            type: 'warning',
            title: 'Projects At Risk',
            message: `${count} projects are at risk`,
            action: 'Implement risk mitigation strategies and increase monitoring',
            priority: 'high',
          });
        }
      });
    }

    setInsights(newInsights);
    setRiskMetrics(newRiskMetrics);
  }, [filtered, selectedPortfolio, selectedStatuses]);

  // Generate dependency data from projects and create D3 visualization in one effect
  useEffect(() => {
    if (!filtered || filtered.length === 0 || !svgRef.current) return;

    // Check if we already have the same data to prevent unnecessary re-renders
    const currentDataKey = JSON.stringify(filtered.map(p => ({ Portfolio: p.Portfolio, Program: p.Program, BPM_ID: p.BPM_ID, Status: p.Status })));

    if (svgRef.current.lastDataKey === currentDataKey) return;

    console.log('Generating dependency graph from projects:', filtered.length);

    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Create nodes for portfolios, programs, and projects
    filtered.forEach(project => {
      // Add portfolio node
      if (!nodeMap.has(project.Portfolio)) {
        const portfolioNode = {
          id: project.Portfolio,
          name: project.Portfolio,
          type: 'portfolio',
          level: 0,
        };

        nodes.push(portfolioNode);
        nodeMap.set(project.Portfolio, portfolioNode);
      }

      // Add program node
      if (!nodeMap.has(project.Program)) {
        const programNode = {
          id: project.Program,
          name: project.Program,
          type: 'program',
          level: 1,
          portfolio: project.Portfolio,
        };

        nodes.push(programNode);
        nodeMap.set(project.Program, programNode);

        // Link program to portfolio
        links.push({
          source: project.Portfolio,
          target: project.Program,
          type: 'hierarchy',
        });
      }

      // Add project node
      if (!nodeMap.has(project.BPM_ID)) {
        const projectNode = {
          id: project.BPM_ID,
          name: project.Project,
          type: 'project',
          level: 2,
          program: project.Program,
          portfolio: project.Portfolio,
          status: project.Status,
        };

        nodes.push(projectNode);
        nodeMap.set(project.BPM_ID, projectNode);

        // Link project to program
        links.push({
          source: project.Program,
          target: project.BPM_ID,
          type: 'hierarchy',
        });
      }
    });

    // Add realistic cross-dependencies based on project relationships
    const projectNodes = nodes.filter(n => n.type === 'project');

    if (projectNodes.length >= 2) {
      // Create dependencies between projects in the same program
      const programGroups = {};

      projectNodes.forEach(project => {
        const program = project.program;

        if (!programGroups[program]) {
          programGroups[program] = [];
        }
        programGroups[program].push(project);
      });

      // Add dependencies within programs (sequential projects)
      Object.values(programGroups).forEach(programProjects => {
        if (programProjects.length > 1) {
          // Sort by some criteria (e.g., project name) to create logical sequence
          const sortedProjects = programProjects.sort((a, b) => a.name.localeCompare(b.name));

          for (let i = 0; i < sortedProjects.length - 1; i++) {
            links.push({
              source: sortedProjects[i].id,
              target: sortedProjects[i + 1].id,
              type: 'dependency',
              description: 'Sequential dependency within program',
            });
          }
        }
      });

      // Add cross-program dependencies (portfolio-level coordination)
      if (Object.keys(programGroups).length > 1) {
        const programs = Object.keys(programGroups);

        // Link first project of each program to create portfolio coordination
        for (let i = 0; i < programs.length - 1; i++) {
          const program1Projects = programGroups[programs[i]];
          const program2Projects = programGroups[programs[i + 1]];

          if (program1Projects.length > 0 && program2Projects.length > 0) {
            links.push({
              source: program1Projects[0].id,
              target: program2Projects[0].id,
              type: 'dependency',
              description: 'Portfolio coordination dependency',
            });
          }
        }
      }
    }

    console.log('Final graph data:', { nodes: nodes.length, links: links.length });

    // Store the data key to prevent unnecessary re-renders
    svgRef.current.lastDataKey = currentDataKey;

    // Immediately create D3 visualization
    createD3Visualization(nodes, links);
  }, [filtered, createD3Visualization]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining D3 elements and simulations
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);

        svg.selectAll('*').remove();

        // Stop simulation if it exists
        if (svgRef.current.simulation) {
          svgRef.current.simulation.stop();
          svgRef.current.simulation = null;
        }
      }
    };
  }, []);

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
              <h1>Dependency Graph</h1>
              <p>Project dependency analysis and relationship visualization</p>
            </div>
            <div className="title-export">
              <ExportDropdown
                element={() => document.querySelector('.dashboard-container')}
                filename="Complete_Dependency_Graph_Dashboard"
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
              <PortfolioFilter
                onSelect={setSelectedPortfolio}
                portfolios={portfolios}
                selected={selectedPortfolio}
              />
              <StatusFilter
                onStatusChange={setSelectedStatuses}
                selectedStatuses={selectedStatuses}
                statuses={allStatuses}
              />
            </div>
          </div>

          {/* Risk Metrics Dashboard */}
          <div className="risk-metrics-section">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">{riskMetrics.delayedProjects || 0}</div>
                <div className="metric-label">Delayed Projects</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{riskMetrics.blockedProjects || 0}</div>
                <div className="metric-label">Blocked Projects</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{riskMetrics.criticalPathLength || 0}</div>
                <div className="metric-label">Critical Path Length</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">{insights.filter(i => i.priority === 'critical').length}</div>
                <div className="metric-label">Critical Issues</div>
              </div>
            </div>
          </div>

          {/* Actionable Insights */}
          {insights.length > 0 && (
            <div className="insights-section">
              <h3>Actionable Insights</h3>
              <div className="insights-grid">
                {insights.map((insight, index) => (
                  <div className={`insight-card ${insight.type} ${insight.priority}`} key={index}>
                    <div className="insight-header">
                      <span className="insight-type">{insight.type.toUpperCase()}</span>
                      <span className="insight-priority">{insight.priority}</span>
                    </div>
                    <h4 className="insight-title">{insight.title}</h4>
                    <p className="insight-message">{insight.message}</p>
                    <div className="insight-action">
                      <strong>Action:</strong> {insight.action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="legend-section">
            <div className="legend-row">
              <div className="legend-item"><span className="legend-bar portfolio"></span> Portfolio</div>
              <div className="legend-item"><span className="legend-bar program"></span> Program</div>
              <div className="legend-item"><span className="legend-bar project"></span> Project</div>
              <div className="legend-item"><span className="legend-bar hierarchy"></span> Hierarchy</div>
              <div className="legend-item"><span className="legend-bar project"></span> Dependency</div>
            </div>
          </div>

          <div className="dashboard-table-wrapper">
            <div className="graph-container">
              <svg height="600" ref={svgRef} width="100%"></svg>
            </div>
          </div>

          {selectedNode && (
            <div className="node-details">
              <div className="node-details-header">
                <h3>{selectedNode.name}</h3>
                <button
                  className="close-details-btn"
                  onClick={() => setSelectedNode(null)}
                >
                ×
                </button>
              </div>
              <div className="node-info">
                <p><strong>Type:</strong> {selectedNode.type}</p>
                {selectedNode.status && <p><strong>Status:</strong> {selectedNode.status}</p>}
                {selectedNode.portfolio && <p><strong>Portfolio:</strong> {selectedNode.portfolio}</p>}
                {selectedNode.program && <p><strong>Program:</strong> {selectedNode.program}</p>}
              </div>

              {selectedNode.incomingDependencies && selectedNode.incomingDependencies.length > 0 && (
                <div className="dependencies-section">
                  <h4>Incoming Dependencies ({selectedNode.incomingDependencies.length})</h4>
                  <div className="dependency-list">
                    {selectedNode.incomingDependencies.map((dep, index) => (
                      <div className="dependency-item" key={index}>
                        <span className="dependency-source">{dep.source.name || dep.source}</span>
                        <span className="dependency-arrow">→</span>
                        <span className="dependency-type">{dep.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.outgoingDependencies && selectedNode.outgoingDependencies.length > 0 && (
                <div className="dependencies-section">
                  <h4>Outgoing Dependencies ({selectedNode.outgoingDependencies.length})</h4>
                  <div className="dependency-list">
                    {selectedNode.outgoingDependencies.map((dep, index) => (
                      <div className="dependency-item" key={index}>
                        <span className="dependency-type">{dep.type}</span>
                        <span className="dependency-arrow">→</span>
                        <span className="dependency-target">{dep.target.name || dep.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
