import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import ExportDropdown from './ExportDropdown';
import './AdvancedCharts.css';

// Check if D3 Sankey is available
const isSankeyAvailable = typeof sankey === 'function' && typeof sankeyLinkHorizontal === 'function';

// StatusFilter component matching the UX style of other dashboard pages
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

const AdvancedCharts = ({ projects, selectedPortfolio, selectedStatuses, sidebarCollapsed }) => {
  const sankeyRef = useRef(null);
  const heatmapRef = useRef(null);
  const networkRef = useRef(null);
  const chart3dRef = useRef(null);



  // If used as standalone page, load projects data
  const [standaloneProjects, setStandaloneProjects] = useState([]);
  
  useEffect(() => {
    console.log('AdvancedCharts: Data loading effect triggered', {
      hasProjects: !!projects,
      projectsLength: projects?.length,
      hasStandaloneProjects: standaloneProjects.length > 0
    });

    if (!projects || projects.length === 0) {
      // Load data if used as standalone component
      const loadData = async () => {
        try {
          console.log('Loading data from CSV file...');
          const response = await fetch(process.env.PUBLIC_URL + '/data/demo.csv');
          const csvText = await response.text();
          console.log('CSV loaded, length:', csvText.length);
          const Papa = await import('papaparse');
          const result = Papa.parse(csvText, { header: true });
          console.log('CSV parsed, rows:', result.data.length);
          setStandaloneProjects(result.data);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };
      loadData();
    }
  }, [projects]);

  const displayProjects = projects && projects.length > 0 ? projects : standaloneProjects;

  // Get unique portfolios and statuses for standalone use
  const portfolios = useMemo(() => {
    return [...new Set(displayProjects.map(p => p.Portfolio).filter(Boolean))];
  }, [displayProjects]);

  const allStatuses = useMemo(() => {
    return [...new Set(displayProjects.map(p => p.Status).filter(Boolean))];
  }, [displayProjects]);

  // Local state for standalone use
  const [localSelectedPortfolio, setLocalSelectedPortfolio] = useState('');
  const [localSelectedStatuses, setLocalSelectedStatuses] = useState([]);

  // Use props if available, otherwise use local state
  const effectivePortfolio = selectedPortfolio || localSelectedPortfolio;
  const effectiveStatuses = selectedStatuses && selectedStatuses.length > 0 ? selectedStatuses : localSelectedStatuses;

  // Filter projects based on portfolio and status
  const filtered = useMemo(() => {
    console.log('AdvancedCharts: Filtering projects', {
      displayProjectsLength: displayProjects?.length,
      effectivePortfolio,
      effectiveStatuses,
      sampleProject: displayProjects?.[0]
    });

    const result = displayProjects.filter(p => {
      const portfolioMatch = !effectivePortfolio || p.Portfolio === effectivePortfolio;
      const statusMatch = effectiveStatuses.length === 0 || effectiveStatuses.includes(p.Status);
      return portfolioMatch && statusMatch;
    });
    
    console.log('Filtered projects result:', {
      total: displayProjects.length,
      filtered: result.length,
      portfolios: [...new Set(result.map(p => p.Portfolio).filter(Boolean))],
      programs: [...new Set(result.map(p => p.Program).filter(Boolean))],
      projects: result.map(p => ({ name: p.Project, budget: p.Budget, portfolio: p.Portfolio, program: p.Program }))
    });
    
    return result;
  }, [displayProjects, effectivePortfolio, effectiveStatuses]);

  // Generate Sankey data for budget flow
  const sankeyData = useMemo(() => {
    console.log('Generating Sankey data with filtered projects:', {
      filteredLength: filtered?.length,
      filteredProjects: filtered?.slice(0, 3),
      sampleProject: filtered?.[0]
    });

    if (!filtered || filtered.length === 0) {
      console.log('No filtered projects, returning empty Sankey data');
      return { nodes: [], links: [] };
    }

    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Create portfolio nodes
    const portfolios = [...new Set(filtered.map(p => p.Portfolio).filter(Boolean))];
    console.log('Portfolios found:', portfolios);
    
    portfolios.forEach(portfolio => {
      const portfolioBudget = filtered
        .filter(p => p.Portfolio === portfolio)
        .reduce((sum, p) => sum + parseFloat(p.Budget || 0), 0);
      const node = { id: portfolio, type: 'portfolio', value: portfolioBudget };
      nodes.push(node);
      nodeMap.set(portfolio, node);
      console.log(`Portfolio ${portfolio}: budget ${portfolioBudget}`);
    });

    // Create program nodes
    const programs = [...new Set(filtered.map(p => p.Program).filter(Boolean))];
    console.log('Programs found:', programs);
    
    programs.forEach(program => {
      const programBudget = filtered
        .filter(p => p.Program === program)
        .reduce((sum, p) => sum + parseFloat(p.Budget || 0), 0);
      const node = { id: program, type: 'program', value: programBudget };
      nodes.push(node);
      nodeMap.set(program, node);
      console.log(`Program ${program}: budget ${programBudget}`);
    });

    // Create project nodes
    let projectCount = 0;
    filtered.forEach(project => {
      if (project.Project) {
        const node = { id: project.Project, type: 'project', value: parseFloat(project.Budget || 0) };
        nodes.push(node);
        nodeMap.set(project.Project, node);
        projectCount++;
      }
    });
    console.log(`Projects created: ${projectCount}`);

    // Create links: Portfolio -> Program -> Project
    let linkCount = 0;
    portfolios.forEach(portfolio => {
      const portfolioProjects = filtered.filter(p => p.Portfolio === portfolio);
      
      const programsInPortfolio = [...new Set(portfolioProjects.map(p => p.Program).filter(Boolean))];
      programsInPortfolio.forEach(program => {
        const programProjects = portfolioProjects.filter(p => p.Program === program);
        const programBudget = programProjects.reduce((sum, p) => sum + parseFloat(p.Budget || 0), 0);
        
        // Only create links if both source and target exist and have valid values
        if (portfolio && program && programBudget > 0) {
          const sourceNode = nodes.find(n => n.id === portfolio);
          const targetNode = nodes.find(n => n.id === program);
          
          if (sourceNode && targetNode) {
            links.push({
              source: sourceNode,
              target: targetNode,
              value: programBudget
            });
            linkCount++;
            console.log(`Link created: ${portfolio} -> ${program} (${programBudget})`);
          }
        }

        programProjects.forEach(project => {
          if (project.Project) {
            const projectBudget = parseFloat(project.Budget || 0);
            // Only create links if both source and target exist and have valid values
            if (program && project.Project && projectBudget > 0) {
              const sourceNode = nodes.find(n => n.id === program);
              const targetNode = nodes.find(n => n.id === project.Project);
              
              if (sourceNode && targetNode) {
                links.push({
                  source: sourceNode,
                  target: targetNode,
                  value: projectBudget
                });
                linkCount++;
                console.log(`Link created: ${program} -> ${project.Project} (${projectBudget})`);
              }
            }
          }
        });
      });
    });

    console.log(`Total links created: ${linkCount}`);

    // Filter out any invalid links and ensure proper data structure
    const validLinks = links.filter(link => 
      link.source && link.target && link.value > 0 &&
      typeof link.source === 'object' && typeof link.target === 'object' &&
      link.source.id && link.target.id
    );

    console.log('Final Sankey data:', {
      nodes: nodes.length,
      links: validLinks.length,
      sampleNodes: nodes.slice(0, 3),
      sampleLinks: validLinks.slice(0, 3)
    });

    // Ensure we have at least some valid data
    if (validLinks.length === 0 || nodes.length === 0) {
      console.warn('No valid Sankey data generated');
      return { nodes: [], links: [] };
    }

    console.log('Sankey data generated:', { nodes: nodes.length, links: validLinks.length });
    return { nodes, links: validLinks };
  }, [filtered]);

  // Generate heatmap data for resource allocation
  const heatmapData = useMemo(() => {
    if (!filtered || filtered.length === 0) return [];

    const data = [];
    const portfolios = [...new Set(filtered.map(p => p.Portfolio))];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    portfolios.forEach(portfolio => {
      months.forEach((month, monthIndex) => {
        const portfolioProjects = filtered.filter(p => p.Portfolio === portfolio);
        const monthBudget = portfolioProjects.reduce((sum, p) => {
          // Simple allocation: distribute budget across months
          const budget = parseFloat(p.Budget || 0);
          const startMonth = new Date(p.G0).getMonth();
          const endMonth = new Date(p.G5_Current).getMonth();
          
          if (monthIndex >= startMonth && monthIndex <= endMonth) {
            return sum + (budget / Math.max(1, endMonth - startMonth + 1));
          }
          return sum;
        }, 0);

        data.push({
          portfolio,
          month,
          monthIndex,
          value: monthBudget
        });
      });
    });

    return data;
  }, [filtered]);

  // Generate network data for collaboration
  const networkData = useMemo(() => {
    if (!filtered || filtered.length === 0) return { nodes: [], links: [] };

    const nodes = [];
    const links = [];
    const nodeMap = new Map();

    // Create project manager nodes
    const managers = [...new Set(filtered.map(p => p['Project Manager']).filter(Boolean))];
    managers.forEach(manager => {
      const node = { 
        id: manager, 
        type: 'manager', 
        size: 20,
        projects: filtered.filter(p => p['Project Manager'] === manager).length
      };
      nodes.push(node);
      nodeMap.set(manager, node);
    });

    // Create project nodes
    filtered.forEach(project => {
      const node = { 
        id: project.Project, 
        type: 'project', 
        size: 15,
        status: project.Status,
        budget: parseFloat(project.Budget || 0)
      };
      nodes.push(node);
      nodeMap.set(project.Project, node);
    });

    // Create links: Manager -> Project
    filtered.forEach(project => {
      if (project['Project Manager']) {
        links.push({
          source: project['Project Manager'],
          target: project.Project,
          value: parseFloat(project.Budget || 0)
        });
      }
    });

    // Create links between projects in same program
    const programs = [...new Set(filtered.map(p => p.Program))];
    programs.forEach(program => {
      const programProjects = filtered.filter(p => p.Program === program);
      for (let i = 0; i < programProjects.length; i++) {
        for (let j = i + 1; j < programProjects.length; j++) {
          links.push({
            source: programProjects[i].Project,
            target: programProjects[j].Project,
            value: 1,
            type: 'collaboration'
          });
        }
      }
    });

    return { nodes, links };
  }, [filtered]);

  // Create Sankey diagram
  const createSankeyChart = useCallback(() => {
    console.log('createSankeyChart called with:', {
      isSankeyAvailable,
      sankeyRef: sankeyRef.current,
      sankeyData: sankeyData,
      nodesCount: sankeyData.nodes?.length,
      linksCount: sankeyData.links?.length
    });

    if (!isSankeyAvailable) {
      console.error('Sankey chart: D3 Sankey library not available');
      // Show fallback message
      if (sankeyRef.current) {
        const svg = d3.select(sankeyRef.current);
        svg.selectAll("*").remove();
        svg.append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "16px")
          .style("fill", "#6b7280")
          .text("D3 Sankey library not available");
      }
      return;
    }
    
    if (!sankeyRef.current) {
      console.log('Sankey chart: No ref available');
      return;
    }

    if (!sankeyData.nodes || sankeyData.nodes.length === 0) {
      console.log('Sankey chart: No nodes available');
      // Show fallback message
      const svg = d3.select(sankeyRef.current);
      svg.selectAll("*").remove();
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .style("fill", "#6b7280")
        .text("No data available for Sankey diagram");
      return;
    }

    // Validate data structure
    if (!sankeyData.links || sankeyData.links.length === 0) {
      console.log('Sankey chart: No links data available');
      // Show fallback message
      const svg = d3.select(sankeyRef.current);
      svg.selectAll("*").remove();
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .style("fill", "#6b7280")
        .text("No budget flow data available");
      return;
    }

    // Validate that all links reference valid nodes
    const validLinks = sankeyData.links.filter(link => {
      const sourceExists = link.source && typeof link.source === 'object' && link.source.id;
      const targetExists = link.target && typeof link.target === 'object' && link.target.id;
      return sourceExists && targetExists && link.value > 0;
    });

    if (validLinks.length === 0) {
      console.warn('Sankey chart: No valid links found');
      // Show fallback message
      const svg = d3.select(sankeyRef.current);
      svg.selectAll("*").remove();
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "16px")
        .style("fill", "#6b7280")
        .text("No valid budget flow connections");
      return;
    }

    if (validLinks.length !== sankeyData.links.length) {
      console.warn('Sankey chart: Some links were invalid and filtered out:', {
        total: sankeyData.links.length,
        valid: validLinks.length,
        invalid: sankeyData.links.length - validLinks.length
      });
    }

    console.log('Sankey chart: Creating with data:', {
      nodes: sankeyData.nodes.length,
      links: validLinks.length,
      sampleNodes: sankeyData.nodes.slice(0, 3),
      sampleLinks: validLinks.slice(0, 3)
    });

    const svg = d3.select(sankeyRef.current);
    svg.selectAll("*").remove();

    // Get the container dimensions
    const container = sankeyRef.current.parentElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    console.log('Sankey chart: Container dimensions:', { width, height, container });

    svg.attr("width", width).attr("height", height);

    try {
      // Ensure we have valid dimensions
      if (width <= 0 || height <= 0) {
        throw new Error('Invalid chart dimensions');
      }

      // Create Sankey layout
      const sankeyLayout = sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

      // Create a clean copy of the data for the Sankey layout
      const cleanNodes = sankeyData.nodes.map(d => ({ ...d }));
      const cleanLinks = validLinks.map(d => ({ ...d }));

      console.log('Sankey chart: Input data:', { 
        nodes: cleanNodes, 
        links: cleanLinks,
        sampleLink: cleanLinks[0],
        sampleNode: cleanNodes[0]
      });

      // Validate data before passing to Sankey layout
      if (cleanNodes.length === 0 || cleanLinks.length === 0) {
        throw new Error('No valid nodes or links to display');
      }

      // Ensure all links have proper source and target objects
      const validLinksForLayout = cleanLinks.filter(link => 
        link.source && link.target && 
        typeof link.source === 'object' && typeof link.target === 'object' &&
        link.source.id && link.target.id
      );

      if (validLinksForLayout.length === 0) {
        throw new Error('No valid links with proper source/target objects');
      }

      console.log('Sankey chart: Final validation -', {
        totalLinks: cleanLinks.length,
        validLinks: validLinksForLayout.length,
        sampleValidLink: validLinksForLayout[0]
      });

      // Apply the sankey layout and get results
      const nodes = sankeyLayout.nodes(cleanNodes);
      const links = sankeyLayout.links(validLinksForLayout);

      console.log('Sankey chart: Layout result:', { nodes, links });

      // Create gradient definitions
      const defs = svg.append("defs");
      if (links && links.length > 0) {
        links.forEach(link => {
          if (link.source && link.target && link.source.id && link.target.id) {
            const gradient = defs.append("linearGradient")
              .attr("id", `gradient-${link.source.id}-${link.target.id}`)
              .attr("gradientUnits", "userSpaceOnUse")
              .attr("x1", link.source.x1)
              .attr("x2", link.target.x0);

            gradient.append("stop")
              .attr("offset", "0%")
              .attr("stop-color", "#3b82f6")
              .attr("stop-opacity", 0.6);

            gradient.append("stop")
              .attr("offset", "100%")
              .attr("stop-color", "#1d4ed8")
              .attr("stop-opacity", 0.3);
          }
        });
      }

      // Draw links
      if (links && links.length > 0) {
        svg.append("g")
          .selectAll("path")
          .data(links)
          .join("path")
          .attr("d", sankeyLinkHorizontal())
          .attr("stroke", d => `url(#gradient-${d.source.id}-${d.target.id})`)
          .attr("stroke-width", d => Math.max(1, d.width))
          .attr("fill", "none")
          .attr("opacity", 0.7);
      }

      // Draw nodes
      if (nodes && nodes.length > 0) {
        svg.append("g")
          .selectAll("rect")
          .data(nodes)
          .join("rect")
          .attr("x", d => d.x0)
          .attr("y", d => d.y0)
          .attr("height", d => d.y1 - d.y0)
          .attr("width", d => d.x1 - d.x0)
          .attr("fill", d => {
            switch (d.type) {
              case 'portfolio': return '#1e40af';
              case 'program': return '#3b82f6';
              case 'project': return '#60a5fa';
              default: return '#93c5fd';
            }
          })
          .attr("stroke", "#1e3a8a")
          .attr("stroke-width", 1);
      }

      // Add node labels
      if (nodes && nodes.length > 0) {
        svg.append("g")
          .selectAll("text")
          .data(nodes)
          .join("text")
          .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
          .attr("y", d => (d.y1 + d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
          .text(d => d.id)
          .style("font-size", "12px")
          .style("font-weight", "500");
      }

        // Add chart title
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", margin.top - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("font-weight", "600")
          .style("fill", "#1f2937")
          .text("Budget Flow: Portfolio → Program → Project");

        // Add axis labels for Sankey
        svg.append("text")
          .attr("x", margin.left)
          .attr("y", height - 10)
          .attr("text-anchor", "start")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .style("fill", "#6b7280")
          .text("Portfolio Level");

        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .style("fill", "#6b7280")
          .text("Program Level");

        svg.append("text")
          .attr("x", width - margin.right)
          .attr("y", height - 10)
          .attr("text-anchor", "end")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .style("fill", "#6b7280")
          .text("Project Level");

        // Add legend to the separate legend container
        const legendContainer = document.getElementById('sankey-legend');
        if (legendContainer) {
          const legendContent = legendContainer.querySelector('.legend-content');
          legendContent.innerHTML = `
            <div class="legend-section">
              <h4 class="legend-title">Node Types</h4>
              <div class="legend-item">
                <span class="legend-color" style="background: #1e40af;"></span>
                <span class="legend-text">Portfolio</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #3b82f6;"></span>
                <span class="legend-text">Program</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #60a5fa;"></span>
                <span class="legend-text">Project</span>
              </div>
            </div>
            <div class="legend-section">
              <h4 class="legend-title">Budget Flow</h4>
              <p class="legend-description">Portfolio → Program → Project</p>
            </div>
          `;
        }

      } catch (error) {
        console.error('Error creating Sankey chart:', error);
        
        // Show error message on chart
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("fill", "#ef4444")
          .text("Error creating chart");
        
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2 + 20)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "#6b7280")
          .text("Check console for details");
      }

   }, [sankeyData]);

  // Create heatmap
  const createHeatmap = useCallback(() => {
    if (!heatmapRef.current || !heatmapData.length) return;

    const svg = d3.select(heatmapRef.current);
    svg.selectAll("*").remove();

    // Get the container dimensions
    const container = heatmapRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 20, bottom: 60, left: 80 };

    svg.attr("width", width).attr("height", height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const portfolios = [...new Set(heatmapData.map(d => d.portfolio))];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const xScale = d3.scaleBand()
      .domain(months)
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(portfolios)
      .range([0, chartHeight])
      .padding(0.1);

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(heatmapData, d => d.value)])
      .interpolator(d3.interpolateBlues);

    // Create chart group
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Draw heatmap cells
    chart.selectAll("rect")
      .data(heatmapData)
      .join("rect")
      .attr("x", d => xScale(d.month))
      .attr("y", d => yScale(d.portfolio))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.value))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke-width", 2).attr("stroke", "#000");
        
        // Show tooltip
        const tooltip = svg.append("g")
          .attr("class", "tooltip")
          .style("pointer-events", "none");

        tooltip.append("rect")
          .attr("x", event.pageX - margin.left + 10)
          .attr("y", event.pageY - margin.top - 30)
          .attr("width", 120)
          .attr("height", 40)
          .attr("fill", "rgba(0,0,0,0.8)")
          .attr("rx", 5);

        tooltip.append("text")
          .attr("x", event.pageX - margin.left + 15)
          .attr("y", event.pageY - margin.top - 15)
          .attr("fill", "white")
          .style("font-size", "12px")
          .text(`${d.portfolio}: ${d.month}`);

        tooltip.append("text")
          .attr("x", event.pageX - margin.left + 15)
          .attr("y", event.pageY - margin.top)
          .attr("fill", "white")
          .style("font-size", "12px")
          .text(`$${d.value.toLocaleString()}`);
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 1).attr("stroke", "#fff");
        svg.selectAll(".tooltip").remove();
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chart.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    chart.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "12px");

    // Add axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Month");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left - 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Portfolio");

    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#1f2937")
      .text("Budget Allocation by Portfolio and Month");

    // Add legend to the separate legend container
    const legendContainer = document.getElementById('heatmap-legend');
    if (legendContainer) {
      const legendContent = legendContainer.querySelector('.legend-content');
      const maxValue = d3.max(heatmapData, d => d.value);
      legendContent.innerHTML = `
        <div class="legend-section">
          <h4 class="legend-title">Budget Allocation</h4>
          <div class="legend-color-scale">
            <div class="color-scale-bar" style="background: linear-gradient(to bottom, #1e40af, #eff6ff);"></div>
            <div class="color-scale-labels">
              <span class="max-value">$${maxValue.toLocaleString()}</span>
              <span class="min-value">$0</span>
            </div>
          </div>
        </div>
        <div class="legend-section">
          <h4 class="legend-title">Chart Info</h4>
          <p class="legend-description">Shows budget allocation across portfolios and time periods</p>
        </div>
      `;
    }

  }, [heatmapData]);

  // Create network graph
  const createNetworkGraph = useCallback(() => {
    if (!networkRef.current || !networkData.nodes.length) return;

    const svg = d3.select(networkRef.current);
    svg.selectAll("*").remove();

    // Get the container dimensions
    const container = networkRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        chartGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create chart group for zooming
    const chartGroup = svg.append("g");

    // Add boundary indicator
    chartGroup.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.5);

    // Create simulation with boundaries
    const simulation = d3.forceSimulation(networkData.nodes)
      .force("link", d3.forceLink(networkData.links).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => d.size + 8))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1));

    // Create links
    const links = chartGroup.append("g")
      .selectAll("line")
      .data(networkData.links)
      .join("line")
      .attr("stroke", d => d.type === 'collaboration' ? "#10b981" : "#3b82f6")
      .attr("stroke-width", d => Math.sqrt(d.value) * 2)
      .attr("stroke-opacity", 0.6);

    // Create nodes
    const nodes = chartGroup.append("g")
      .selectAll("circle")
      .data(networkData.nodes)
      .join("circle")
      .attr("r", d => d.size)
      .attr("fill", d => {
        switch (d.type) {
          case 'manager': return '#1e40af';
          case 'project': 
            switch (d.status?.toLowerCase()) {
              case 'on track': return '#22c55e';
              case 'delayed': return '#ef4444';
              case 'completed': return '#3b82f6';
              case 'at risk': return '#f59e42';
              default: return '#a3a3a3';
            }
          default: return '#93c5fd';
        }
      })
      .attr("stroke", "#1e3a8a")
      .attr("stroke-width", 2)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add node labels
    const labels = chartGroup.append("g")
      .selectAll("text")
      .data(networkData.nodes)
      .join("text")
      .text(d => d.id.length > 15 ? d.id.substring(0, 15) + '...' : d.id)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("pointer-events", "none");



    // Update positions on simulation tick with boundary constraints
    simulation.on("tick", () => {
      // Apply boundary constraints
      networkData.nodes.forEach(d => {
        d.x = Math.max(margin.left + d.size, Math.min(width - margin.right - d.size, d.x));
        d.y = Math.max(margin.top + d.size, Math.min(height - margin.bottom - d.size, d.y));
      });

      links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Drag functions with boundary constraints
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      // Constrain drag within boundaries
      const constrainedX = Math.max(margin.left + d.size, Math.min(width - margin.right - d.size, event.x));
      const constrainedY = Math.max(margin.top + d.size, Math.min(height - margin.bottom - d.size, event.y));
      d.fx = constrainedX;
      d.fy = constrainedY;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    



        // Add legend to the separate legend container
        const legendContainer = document.getElementById('network-legend');
        if (legendContainer) {
          const legendContent = legendContainer.querySelector('.legend-content');
          legendContent.innerHTML = `
            <div class="legend-section">
              <h4 class="legend-title">Node Types</h4>
              <div class="legend-item">
                <span class="legend-color" style="background: #1e40af; border-radius: 50%;"></span>
                <span class="legend-text">Project Manager</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #93c5fd; border-radius: 50%;"></span>
                <span class="legend-text">Project</span>
              </div>
            </div>
            <div class="legend-section">
              <h4 class="legend-title">Project Status</h4>
              <div class="legend-item">
                <span class="legend-color" style="background: #22c55e; border-radius: 50%;"></span>
                <span class="legend-text">On Track</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #ef4444; border-radius: 50%;"></span>
                <span class="legend-text">Delayed</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #3b82f6; border-radius: 50%;"></span>
                <span class="legend-text">Completed</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #f59e42; border-radius: 50%;"></span>
                <span class="legend-text">At Risk</span>
              </div>
            </div>
            <div class="legend-section">
              <h4 class="legend-title">Connection Types</h4>
              <div class="legend-item">
                <span class="legend-color" style="background: #3b82f6; height: 3px; border-radius: 0;"></span>
                <span class="legend-text">Manager → Project</span>
              </div>
              <div class="legend-item">
                <span class="legend-color" style="background: #10b981; height: 3px; border-radius: 0;"></span>
                <span class="legend-text">Project ↔ Project</span>
              </div>
            </div>
          `;
        }

  }, [networkData]);

  // Create 3D visualization (simulated with perspective)
  const create3DChart = useCallback(() => {
    if (!chart3dRef.current || !filtered.length) return;

    const svg = d3.select(chart3dRef.current);
    svg.selectAll("*").remove();

    // Get the container dimensions
    const container = chart3dRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 45, right: 45, bottom: 45, left: 80 }; // Balanced margins for natural overlap

    svg.attr("width", width).attr("height", height);

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create 3D-like data structure with natural bubble overlap
    const data = filtered.map((project, index) => {
      const budget = parseFloat(project.Budget || 0);
      const size = Math.sqrt(budget) / 10;
      
      // Use a more compact layout with better space utilization
      const columns = Math.ceil(Math.sqrt(filtered.length));
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      // Calculate dynamic spacing based on available chart area
      const availableWidth = chartWidth - 60; // Balanced padding
      const availableHeight = chartHeight - 60; // Balanced padding
      const spacingX = availableWidth / Math.max(columns - 1, 1);
      const spacingY = availableHeight / Math.max(columns - 1, 1);
      
      // Start with structured positioning
      let x = margin.left + 30 + (col * spacingX);
      let y = margin.top + 30 + (row * spacingY);
      
      // Add natural random offset for organic feel
      x += (Math.random() * 24 - 12);
      y += (Math.random() * 24 - 12);
      
      // Ensure bubbles stay within bounds
      x = Math.max(margin.left + 30, Math.min(width - margin.right - 30, x));
      y = Math.max(margin.top + 30, Math.min(height - margin.bottom - 30, y));
      
      return {
        x: x,
        y: y,
        z: budget,
        size: size,
        status: project.Status,
        name: project.Project
      };
    });

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, chartWidth])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, chartHeight])
      .range([height - margin.bottom, margin.top]);

    const sizeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.size)])
      .range([15, 32]); // Allow larger bubbles for natural overlap

    const colorScale = d3.scaleOrdinal()
      .domain(['on track', 'delayed', 'completed', 'at risk'])
      .range(['#22c55e', '#ef4444', '#3b82f6', '#f59e42']);

    // Create chart group
    const chart = svg.append("g");

    // Draw 3D-like bubbles with shadows
    data.forEach((d, i) => {
      // Create shadow
      chart.append("circle")
        .attr("cx", xScale(d.x) + 3)
        .attr("cy", yScale(d.y) + 3)
        .attr("r", sizeScale(d.size))
        .attr("fill", "rgba(0,0,0,0.2)")
        .attr("opacity", 0.3);

      // Create main bubble
      chart.append("circle")
        .attr("cx", xScale(d.x))
        .attr("cy", yScale(d.y))
        .attr("r", sizeScale(d.size))
        .attr("fill", colorScale(d.status?.toLowerCase()) || '#a3a3a3')
        .attr("stroke", "#1e3a8a")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8)
        .on("mouseover", function() {
          d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
          
          // Show tooltip
          const tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("pointer-events", "none");

          tooltip.append("rect")
            .attr("x", xScale(d.x) + 10)
            .attr("y", yScale(d.y) - 40)
            .attr("width", 150)
            .attr("height", 60)
            .attr("fill", "rgba(0,0,0,0.9)")
            .attr("rx", 5);

          tooltip.append("text")
            .attr("x", xScale(d.x) + 15)
            .attr("y", yScale(d.y) - 25)
            .attr("fill", "white")
            .style("font-size", "12px")
            .text(d.name);

          tooltip.append("text")
            .attr("x", xScale(d.x) + 15)
            .attr("y", yScale(d.y) - 10)
            .attr("fill", "white")
            .style("font-size", "12px")
            .text(`Budget: $${d.z.toLocaleString()}`);

          tooltip.append("text")
            .attr("x", xScale(d.x) + 15)
            .attr("y", yScale(d.y) + 5)
            .attr("fill", "white")
            .style("font-size", "12px")
            .text(`Status: ${d.status}`);
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.8).attr("stroke-width", 2);
          svg.selectAll(".tooltip").remove();
        });

      // Add labels for all bubbles with natural positioning
      const labelY = yScale(d.y) + sizeScale(d.size) + 20; // Good spacing for labels
      const labelX = xScale(d.x);
      
      // Only check if label would be cut off at chart boundaries
      if (labelY < height - margin.bottom - 20 && 
          labelX > margin.left + 15 && 
          labelX < width - margin.right - 15) {
        
        chart.append("text")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("font-weight", "500")
          .style("fill", "#374151")
          .style("pointer-events", "none")
          .text(d.name);
      }
    });

    // Add subtle grid lines for depth effect
    for (let i = 0; i <= 6; i++) { // Reduced from 8 to 6 for tighter grid
      const x = margin.left + (i / 6) * chartWidth;
      chart.append("line")
        .attr("x1", x)
        .attr("y1", margin.top)
        .attr("x2", x)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "rgba(0,0,0,0.05)")
        .attr("stroke-width", 0.5);

      const y = margin.top + (i / 6) * chartHeight;
      chart.append("line")
        .attr("x1", margin.left)
        .attr("y1", y)
        .attr("x2", width - margin.right)
        .attr("y2", y)
        .attr("stroke", "rgba(0,0,0,0.05)")
        .attr("stroke-width", 0.5);
    }

    

    

        // Add axis labels for 3D chart
        chart.append("text")
          .attr("x", width / 2)
          .attr("y", height - 18) // Moved up slightly to ensure full visibility
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .style("fill", "#6b7280")
          .text("X Position (Portfolio Distribution)");

        chart.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", margin.left - 40)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .style("fill", "#6b7280")
          .text("Y Position (Time Distribution)");

        // Add depth indicator
        chart.append("text")
          .attr("x", width - margin.right - 15) // Moved further left to ensure full visibility
          .attr("y", height / 2)
          .attr("text-anchor", "end") // Changed to end alignment for better positioning
          .style("font-size", "12px")
          .style("font-weight", "500")
          .style("fill", "#6b7280")
          .style("pointer-events", "none")
          .text("Bubble Size = Budget");

        // Add legend to the separate legend container
        const legendContainer = document.getElementById('3d-legend');
        if (legendContainer) {
          const legendContent = legendContainer.querySelector('.legend-content');
          const statuses = ['on track', 'delayed', 'completed', 'at risk'];
          legendContent.innerHTML = `
            <div class="legend-section">
              <h4 class="legend-title">Project Status</h4>
              ${statuses.map(status => `
                <div class="legend-item">
                  <span class="legend-color" style="background: ${colorScale(status)}; border-radius: 50%;"></span>
                  <span class="legend-text">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
              `).join('')}
            </div>
            <div class="legend-section">
              <h4 class="legend-title">Chart Info</h4>
              <p class="legend-description">Interactive 3D-like view of projects with budget and status dimensions</p>
            </div>
          `;
        }

  }, [filtered]);

  // Create charts when data changes
  useEffect(() => {
    console.log('Sankey data changed:', sankeyData);
    if (sankeyData.nodes.length > 0 && sankeyData.links.length > 0) {
      createSankeyChart();
    }
  }, [sankeyData, createSankeyChart]);

  // Charts will be responsive to their container size without ResizeObserver

  // Ensure charts are created when refs are available
  useEffect(() => {
    if (sankeyRef.current && sankeyData.nodes.length > 0 && sankeyData.links.length > 0) {
      console.log('Initial Sankey chart creation');
      createSankeyChart();
    }
  }, [sankeyRef.current, sankeyData, createSankeyChart]);

  useEffect(() => {
    createHeatmap();
  }, [createHeatmap]);

  useEffect(() => {
    createNetworkGraph();
  }, [createNetworkGraph]);

  useEffect(() => {
    create3DChart();
  }, [create3DChart]);

  // Loading state
  const isLoading = !filtered || filtered.length === 0;

    return (
    <div className="dashboard-main-bg" style={{ marginLeft: sidebarCollapsed ? 0 : 200 }}>
      <div className="dashboard-container">


        {/* Filters for standalone use */}
        {(!projects || projects.length === 0) && (
          <div className="filters-section">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Portfolio:</label>
                <select 
                  value={localSelectedPortfolio} 
                  onChange={(e) => setLocalSelectedPortfolio(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Portfolios</option>
                  {portfolios.map(portfolio => (
                    <option key={portfolio} value={portfolio}>{portfolio}</option>
                  ))}
                </select>
              </div>
              <StatusFilter
                statuses={allStatuses}
                selectedStatuses={localSelectedStatuses}
                onStatusChange={setLocalSelectedStatuses}
              />
              <div className="filter-export">
                <ExportDropdown 
                  element={() => document.querySelector('.dashboard-container')} 
                  filename="Complete_Advanced_Charts_Dashboard"
                />
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {isLoading ? (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <h3>Loading Advanced Charts</h3>
            <p>Preparing your data visualizations...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-data-section">
            <h3>No Data Available</h3>
            <p>Please select different filters or check your data source.</p>
          </div>
        ) : (
          <div className="charts-section">
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-header-left">
                    <h3>Budget Flow Analysis</h3>
                  </div>
                  <div className="chart-export-buttons">
                    <ExportDropdown 
                      element={sankeyRef} 
                      filename="Budget_Flow_Analysis"
                    />
                  </div>
                </div>
                <div className="chart-content">
                  <div className="chart-main">
                    <svg ref={sankeyRef} className="chart-svg"></svg>
                    {!isSankeyAvailable && (
                      <div className="chart-fallback">
                        <p>D3 Sankey library not available</p>
                        <p>Please check your dependencies</p>
                      </div>
                    )}
                    {isSankeyAvailable && sankeyData.nodes.length === 0 && (
                      <div className="chart-fallback">
                        <p>No data available for Sankey diagram</p>
                        <p>Please check your filters or data source</p>
                      </div>
                    )}
                    {/* Fallback budget summary */}
                    {sankeyData.nodes.length > 0 && (
                      <div className="budget-summary-fallback" style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        left: '10px', 
                        background: 'rgba(255,255,255,0.95)', 
                        padding: '10px', 
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#374151'
                      }}>
                        <div><strong>Portfolios:</strong> {sankeyData.nodes.filter(n => n.type === 'portfolio').length}</div>
                        <div><strong>Programs:</strong> {sankeyData.nodes.filter(n => n.type === 'program').length}</div>
                        <div><strong>Projects:</strong> {sankeyData.nodes.filter(n => n.type === 'project').length}</div>
                        <div><strong>Total Budget:</strong> ${sankeyData.nodes.reduce((sum, n) => sum + (n.value || 0), 0).toLocaleString()}</div>
                      </div>
                    )}
                    {/* Simple budget flow visualization */}
                    {sankeyData.nodes.length > 0 && (
                      <div className="simple-budget-flow" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        minWidth: '300px'
                      }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#1f2937', textAlign: 'center' }}>Budget Flow Summary</h4>
                        {sankeyData.nodes.filter(n => n.type === 'portfolio').map(portfolio => (
                          <div key={portfolio.id} style={{ marginBottom: '15px' }}>
                            <div style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '5px' }}>
                              {portfolio.id} - ${portfolio.value.toLocaleString()}
                            </div>
                            {sankeyData.nodes.filter(n => n.type === 'program').map(program => {
                              const link = sankeyData.links.find(l => 
                                l.source.id === portfolio.id && l.target.id === program.id
                              );
                              if (link) {
                                return (
                                  <div key={program.id} style={{ marginLeft: '20px', marginBottom: '8px' }}>
                                    <div style={{ color: '#7c3aed', fontSize: '14px' }}>
                                      {program.id} - ${program.value.toLocaleString()}
                                    </div>
                                    {sankeyData.nodes.filter(n => n.type === 'project').map(project => {
                                      const projectLink = sankeyData.links.find(l => 
                                        l.source.id === program.id && l.target.id === project.id
                                      );
                                      if (projectLink) {
                                        return (
                                          <div key={project.id} style={{ marginLeft: '20px', fontSize: '12px', color: '#22c55e' }}>
                                            {project.id} - ${project.value.toLocaleString()}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="chart-legend" id="sankey-legend">
                    <div className="legend-content"></div>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-header-left">
                    <h3>Resource Allocation Heatmap</h3>
                  </div>
                  <div className="chart-export-buttons">
                    <ExportDropdown 
                      element={heatmapRef} 
                      filename="Resource_Allocation_Heatmap"
                    />
                  </div>
                </div>
                <div className="chart-content">
                  <div className="chart-main">
                    <svg ref={heatmapRef} className="chart-svg"></svg>
                  </div>
                  <div className="chart-legend" id="heatmap-legend">
                    <div className="legend-content"></div>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-header-left">
                    <h3>Collaboration Network Graph</h3>
                  </div>
                  <div className="chart-export-buttons">
                    <ExportDropdown 
                      element={networkRef} 
                      filename="Collaboration_Network_Graph"
                    />
                  </div>
                </div>
                <div className="chart-content">
                  <div className="chart-main">
                    <svg ref={networkRef} className="chart-svg"></svg>
                  </div>
                  <div className="chart-legend" id="network-legend">
                    <div className="legend-content"></div>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-header-left">
                    <h3>3D Portfolio Visualization</h3>
                  </div>
                  <div className="chart-buttons">
                    <ExportDropdown 
                      element={chart3dRef} 
                      filename="3D_Portfolio_Visualization"
                    />
                  </div>
                </div>
                <div className="chart-content">
                  <div className="chart-main">
                    <svg ref={chart3dRef} className="chart-svg"></svg>
                  </div>
                  <div className="chart-legend" id="3d-legend">
                    <div className="legend-content"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedCharts;
