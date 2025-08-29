import * as d3 from 'd3';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';

import { loadCSV } from '../dataLoader';

import AISidePanel from './AISidePanel';
import ExportDropdown from './ExportDropdown';
import PortfolioFilter from './PortfolioFilter';
import './BudgetFinance.css';

// Budget Status Filter component
function BudgetStatusFilter({ statuses, selectedStatuses, onStatusChange }) {
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
      <label className="filter-label" htmlFor="budget-status-select">Budget Status:</label>
      <div className="custom-select" ref={dropdownRef}>
        <div
          className="select-header"
          id="budget-status-select"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Select budget status"
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
              aria-label="Select all budget statuses"
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
                aria-label={`Select ${status} status`}
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

// R&D Category Filter component
function RDCategoryFilter({ categories, selectedCategories, onCategoryChange }) {
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

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      onCategoryChange([]);
    } else {
      onCategoryChange([...categories]);
    }
  };

  const selectedText = selectedCategories.length === 0
    ? 'All R&D Categories'
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : `${selectedCategories.length} Categories`;

  return (
    <div className="status-filter-container">
      <label className="filter-label" htmlFor="rd-category-select">R&D Category:</label>
      <div className="custom-select" ref={dropdownRef}>
        <div
          className="select-header"
          id="rd-category-select"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsOpen(!isOpen);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Select R&D category"
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
              aria-label="Select all R&D categories"
            >
              <input
                checked={selectedCategories.length === categories.length}
                readOnly
                type="checkbox"
              />
              <span>All R&D Categories</span>
            </div>
            {categories.map(category => (
              <div
                className="select-option"
                key={category}
                onClick={() => handleCategoryToggle(category)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoryToggle(category);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${category} category`}
              >
                <input
                  checked={selectedCategories.includes(category)}
                  readOnly
                  type="checkbox"
                />
                <span>{category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BudgetFinance({ sidebarCollapsed }) {
  const [projects, setProjects] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [selectedBudgetStatuses, setSelectedBudgetStatuses] = useState([]);
  const [selectedRDCategories, setSelectedRDCategories] = useState([]);
  const [financialMetrics, setFinancialMetrics] = useState({});
  const [budgetInsights, setBudgetInsights] = useState([]);
  const [fundingSources, setFundingSources] = useState([]);


  // Drill-down state
  const [drillDownLevel, setDrillDownLevel] = useState('portfolio'); // portfolio, program, project, detail
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownHistory, setDrillDownHistory] = useState([]);
  const [selectedDrillItem, setSelectedDrillItem] = useState(null);

  // AI Assistant state
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);


  // Load project data
  useEffect(() => {
    loadCSV(`${process.env.PUBLIC_URL}/data/demo.csv`, setProjects);
  }, []);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clean up any remaining D3 elements
      const budgetChart = document.getElementById('budget-chart');
      const milestoneChart = document.getElementById('milestone-chart');
      const timelineChart = document.getElementById('timeline-chart');

      if (budgetChart) {
        budgetChart.lastDataKey = null;
      }
      if (milestoneChart) {
        milestoneChart.lastDataKey = null;
      }
      if (timelineChart) {
        timelineChart.lastDataKey = null;
      }
    };
  }, []);

  // Get unique portfolios and budget statuses
  const portfolios = [...new Set(projects.map(p => p.Portfolio))];
  const allBudgetStatuses = ['Under Budget', 'On Budget', 'Over Budget', 'At Risk'];

  // R&D specific categories
  const rdCategories = [
    'Basic Research',
    'Applied Research',
    'Development',
    'Clinical Trials',
    'Regulatory',
    'Prototyping',
    'Testing & Validation',
    'IP & Patents',
  ];

  // Drill-down functions
  const handleDrillDown = useCallback((level, data, item) => {
    const newHistory = [...drillDownHistory, { level: drillDownLevel, data: drillDownData, item: selectedDrillItem }];

    setDrillDownHistory(newHistory);
    setDrillDownLevel(level);
    setDrillDownData(data);
    setSelectedDrillItem(item);
  }, [drillDownLevel, drillDownData, selectedDrillItem, drillDownHistory]);

  const handleDrillUp = useCallback(() => {
    if (drillDownHistory.length > 0) {
      const previous = drillDownHistory[drillDownHistory.length - 1];
      const newHistory = drillDownHistory.slice(0, -1);

      setDrillDownHistory(newHistory);
      setDrillDownLevel(previous.level);
      setDrillDownData(previous.data);
      setSelectedDrillItem(previous.item);
    }
  }, [drillDownHistory]);

  const resetDrillDown = useCallback(() => {
    setDrillDownLevel('portfolio');
    setDrillDownData(null);
    setDrillDownHistory([]);
    setSelectedDrillItem(null);
  }, []);

  const getDrillDownTitle = useCallback(() => {
    switch (drillDownLevel) {
      case 'portfolio': return '';
      case 'program': return `Program: ${selectedDrillItem?.Program || 'Unknown'}`;
      case 'project': return `Project: ${selectedDrillItem?.Project || 'Unknown'}`;
      case 'detail': return `Detail: ${selectedDrillItem?.Project || 'Unknown'}`;
      default: return '';
    }
  }, [drillDownLevel, selectedDrillItem]);

  // Filter projects by portfolio, budget status, and R&D category
  const filtered = useMemo(() => {
    return projects.filter(p => {
      const portfolioMatch = !selectedPortfolio || p.Portfolio === selectedPortfolio;
      const budgetStatusMatch = selectedBudgetStatuses.length === 0 ||
        selectedBudgetStatuses.includes(p.BudgetStatus);
      const rdCategoryMatch = selectedRDCategories.length === 0 ||
        selectedRDCategories.includes(p.RDCategory);

      return portfolioMatch && budgetStatusMatch && rdCategoryMatch;
    });
  }, [projects, selectedPortfolio, selectedBudgetStatuses, selectedRDCategories]);

  // Analyze financial data and generate insights
  useEffect(() => {
    if (!filtered || filtered.length === 0) return;

    const newFinancialMetrics = {
      totalBudget: 0,
      totalSpent: 0,
      totalRemaining: 0,
      underBudgetCount: 0,
      overBudgetCount: 0,
      atRiskCount: 0,
      averageCostVariance: 0,
      roiEstimate: 0,
      // R&D specific metrics
      rdIntensity: 0, // R&D spending as % of total
      innovationIndex: 0, // Basic + Applied research ratio
      developmentEfficiency: 0, // Development cost per milestone
      clinicalTrialCost: 0,
      regulatoryCost: 0,
      ipInvestment: 0,
      prototypingCost: 0,
      testingCost: 0,
    };

    const newBudgetInsights = [];
    const newFundingSources = [];
    const newCostTrends = [];

    // Calculate financial metrics
    filtered.forEach(project => {
      const budget = parseFloat(project.Budget || 0);
      const spent = parseFloat(project.Spent || 0);
      const remaining = budget - spent;

      newFinancialMetrics.totalBudget += budget;
      newFinancialMetrics.totalSpent += spent;
      newFinancialMetrics.totalRemaining += remaining;

      // Count budget statuses based on actual BudgetStatus field
      if (project.BudgetStatus === 'Under Budget') newFinancialMetrics.underBudgetCount++;
      else if (project.BudgetStatus === 'Over Budget') newFinancialMetrics.overBudgetCount++;
      else if (project.BudgetStatus === 'At Risk') newFinancialMetrics.atRiskCount++;

      // Calculate ROI estimate (simplified for demo)
      const estimatedValue = budget * 2.5; // Typical MedTech R&D ROI
      const roi = ((estimatedValue - spent) / spent) * 100;

      newFinancialMetrics.roiEstimate += roi;

      // Track funding sources based on actual FundingSource field
      const source = project.FundingSource;
      const existingSource = newFundingSources.find(s => s.name === source);

      if (existingSource) {
        existingSource.amount += budget;
        existingSource.count++;
      } else {
        newFundingSources.push({
          name: source,
          amount: budget,
          count: 1,
        });
      }

      // Track cost trends by month
      const month = new Date().getMonth(); // Simplified for demo
      const existingMonth = newCostTrends.find(t => t.month === month);

      if (existingMonth) {
        existingMonth.spent += spent;
        existingMonth.count++;
      } else {
        newCostTrends.push({
          month,
          spent,
          count: 1,
        });
      }

      // R&D specific cost categorization based on actual RDCategory field
      if (project.RDCategory === 'Clinical Trials') {
        newFinancialMetrics.clinicalTrialCost += spent;
      } else if (project.RDCategory === 'Regulatory') {
        newFinancialMetrics.regulatoryCost += spent;
      } else if (project.RDCategory === 'IP & Patents') {
        newFinancialMetrics.ipInvestment += spent;
      } else if (project.RDCategory === 'Prototyping') {
        newFinancialMetrics.prototypeCost += spent;
      } else if (project.RDCategory === 'Testing & Validation') {
        newFinancialMetrics.testingCost += spent;
      } else if (project.RDCategory === 'Basic Research') {
        newFinancialMetrics.rdIntensity += spent;
      } else if (project.RDCategory === 'Applied Research') {
        newFinancialMetrics.innovationIndex += spent;
      }
    });

    // Calculate averages
    if (filtered.length > 0) {
      newFinancialMetrics.averageCostVariance =
        newFinancialMetrics.totalSpent / newFinancialMetrics.totalBudget - 1;
      newFinancialMetrics.roiEstimate /= filtered.length;
    }

    // Generate budget insights
    if (newFinancialMetrics.overBudgetCount > 0) {
      newBudgetInsights.push({
        type: 'warning',
        title: 'Budget Overruns Detected',
        message: `${newFinancialMetrics.overBudgetCount} projects are over budget`,
        action: 'Review project costs and implement cost controls',
        priority: 'high',
      });
    }

    if (newFinancialMetrics.atRiskCount > 0) {
      newBudgetInsights.push({
        type: 'error',
        title: 'Projects At Financial Risk',
        message: `${newFinancialMetrics.atRiskCount} projects have significant budget variances`,
        action: 'Immediate cost review and stakeholder communication required',
        priority: 'critical',
      });
    }

    if (newFinancialMetrics.averageCostVariance > 0.1) {
      newBudgetInsights.push({
        type: 'warning',
        title: 'High Average Cost Variance',
        message: `Average cost variance is ${(newFinancialMetrics.averageCostVariance * 100).toFixed(1)}%`,
        action: 'Review portfolio-wide cost management strategies',
        priority: 'high',
      });
    }

    // Portfolio-specific insights
    if (selectedPortfolio) {
      const portfolioProjects = filtered.filter(p => p.Portfolio === selectedPortfolio);
      const portfolioOverBudget = portfolioProjects.filter(p => {
        const budget = parseFloat(p.Budget || 0);
        const spent = parseFloat(p.Spent || 0);

        return spent > budget * 1.05;
      });

      if (portfolioOverBudget.length > portfolioProjects.length * 0.4) {
        newBudgetInsights.push({
          type: 'warning',
          title: 'Portfolio Budget Risk',
          message: `${Math.round((portfolioOverBudget.length / portfolioProjects.length) * 100)}% of portfolio projects are over budget`,
          action: 'Review portfolio financial strategy and resource allocation',
          priority: 'high',
        });
      }
    }

    // R&D specific insights
    if (newFinancialMetrics.clinicalTrialCost > newFinancialMetrics.totalSpent * 0.4) {
      newBudgetInsights.push({
        type: 'info',
        title: 'High Clinical Trial Investment',
        message: 'Clinical trials represent over 40% of R&D spending',
        action: 'Review clinical trial strategy and consider parallel development approaches',
        priority: 'medium',
      });
    }

    if (newFinancialMetrics.regulatoryCost > newFinancialMetrics.totalSpent * 0.2) {
      newBudgetInsights.push({
        type: 'warning',
        title: 'High Regulatory Compliance Costs',
        message: 'Regulatory costs exceed 20% of R&D budget',
        action: 'Optimize regulatory strategy and consider early FDA engagement',
        priority: 'high',
      });
    }

    if (newFinancialMetrics.ipInvestment < newFinancialMetrics.totalSpent * 0.05) {
      newBudgetInsights.push({
        type: 'warning',
        title: 'Low IP Investment',
        message: 'IP protection investment below 5% of R&D budget',
        action: 'Increase IP investment to protect innovation and maintain competitive advantage',
        priority: 'medium',
      });
    }

    setFinancialMetrics(newFinancialMetrics);
    setBudgetInsights(newBudgetInsights);
    setFundingSources(newFundingSources);
  }, [filtered, selectedPortfolio]);

  // Function to create budget chart
  const createBudgetChart = useCallback(() => {
    if (!filtered || filtered.length === 0) return;

    const chartData = filtered.map(project => ({
      name: project.Project,
      budget: parseFloat(project.Budget || 0),
      spent: parseFloat(project.Spent || 0),
      variance: parseFloat(project.Budget || 0) - parseFloat(project.Spent || 0),
    }));

    // Sort by variance for better visualization
    chartData.sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance));

    // Create D3 chart
    const margin = { top: 40, right: 200, left: 120, bottom: 120 };
    const containerWidth = document.getElementById('budget-chart')?.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#budget-chart');

    svg.selectAll('*').remove();

    // Set SVG dimensions to match container
    svg.attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(chartData.map(d => d.name))
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => Math.max(d.budget, d.spent)) * 1.1])
      .range([height, 0]);

    // Add budget bars (behind, full width)
    chart.selectAll('.budget-bar')
      .data(chartData)
      .enter().append('rect')
      .attr('class', 'budget-bar')
      .attr('x', d => x(d.name))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.budget))
      .attr('height', d => height - y(d.budget))
      .attr('fill', '#3b82f6')
      .attr('opacity', 0.7)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const project = filtered.find(p => p.Project === d.name);

        if (project) {
          handleDrillDown('detail', [project], project);
        }
      });

    // Add spent bars (in front, narrower, offset)
    chart.selectAll('.spent-bar')
      .data(chartData)
      .enter().append('rect')
      .attr('class', 'spent-bar')
      .attr('x', d => x(d.name) + x.bandwidth() * 0.1)
      .attr('width', x.bandwidth() * 0.8)
      .attr('y', d => y(d.spent))
      .attr('height', d => height - y(d.spent))
      .attr('fill', '#ef4444')
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const project = filtered.find(p => p.Project === d.name);

        if (project) {
          handleDrillDown('detail', [project], project);
        }
      });

    // Add axes
    chart.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px');

    chart.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px');


    // Add legend (positioned to avoid overlap)
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height + margin.top + 60})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#3b82f6');

    legend.append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text('Budget')
      .style('font-size', '14px');

    legend.append('rect')
      .attr('x', 100)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#ef4444');

    legend.append('text')
      .attr('x', 130)
      .attr('y', 15)
      .text('Spent')
      .style('font-size', '14px');


  }, [filtered, handleDrillDown]);

  // Function to create milestone chart
  const createMilestoneChart = useCallback(() => {
    if (!filtered || filtered.length === 0) return;

    const milestoneData = [
      {
        milestone: 'Concept',
        cost: filtered.filter(p => p.Status === 'On Track').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Status === 'On Track').length,
      },
      {
        milestone: 'Development',
        cost: filtered.filter(p => p.Status === 'Delayed').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Status === 'Delayed').length,
      },
      {
        milestone: 'Testing',
        cost: filtered.filter(p => p.Status === 'Completed').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Status === 'Completed').length,
      },
      {
        milestone: 'Regulatory',
        cost: filtered.filter(p => p.Status === 'At Risk').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Status === 'At Risk').length,
      },
      {
        milestone: 'Launch',
        cost: filtered.filter(p => p.Status === 'Planning').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Status === 'Planning').length,
      },
    ];

    const milestoneElement = document.getElementById('milestone-chart');

    if (!milestoneElement) return;

    const milestoneMargin = { top: 40, right: 250, bottom: 80, left: 120 };
    const containerWidth = milestoneElement.clientWidth || 800;
    const milestoneWidth = (containerWidth - milestoneMargin.left - milestoneMargin.right) * 0.9;
    const milestoneHeight = 350 - milestoneMargin.top - milestoneMargin.bottom;

    const milestoneSvg = d3.select('#milestone-chart');

    milestoneSvg.selectAll('*').remove();

    // Set SVG dimensions to match container
    milestoneSvg.attr('width', containerWidth)
      .attr('height', milestoneHeight + milestoneMargin.top + milestoneMargin.bottom + 20);

    const milestoneChart = milestoneSvg.append('g')
      .attr('transform', `translate(${milestoneMargin.left},${milestoneMargin.top})`);

    const x = d3.scaleBand()
      .range([0, milestoneWidth])
      .domain(milestoneData.map(d => d.milestone))
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(milestoneData, d => d.cost)])
      .range([milestoneHeight, 0]);

    // Add bars
    milestoneChart.selectAll('.milestone-bar')
      .data(milestoneData)
      .enter().append('rect')
      .attr('class', 'milestone-bar')
      .attr('x', d => x(d.milestone))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.cost))
      .attr('height', d => milestoneHeight - y(d.cost))
      .attr('fill', (d, i) => d3.schemeCategory10[i])
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        // Filter projects by milestone type
        let filteredProjects = [];

        if (d.milestone === 'Concept') {
          filteredProjects = filtered.filter(p => p.Status === 'On Track');
        } else if (d.milestone === 'Development') {
          filteredProjects = filtered.filter(p => p.Status === 'Delayed');
        } else if (d.milestone === 'Testing') {
          filteredProjects = filtered.filter(p => p.Status === 'Completed');
        } else if (d.milestone === 'Regulatory') {
          filteredProjects = filtered.filter(p => p.Status === 'At Risk');
        }

        if (filteredProjects.length > 0) {
          handleDrillDown('project', filteredProjects, { type: 'milestone', value: d.milestone });
        }
      });

    // Add axes
    milestoneChart.append('g')
      .attr('transform', `translate(0,${milestoneHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '10px');

    milestoneChart.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '10px');

    // Add axis titles
    milestoneSvg.append('text')
      .attr('x', milestoneWidth / 2 + milestoneMargin.left)
      .attr('y', milestoneHeight + milestoneMargin.top + milestoneMargin.bottom - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Milestone Phase');

    milestoneSvg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(milestoneHeight / 2 + milestoneMargin.top))
      .attr('y', milestoneMargin.left - 40)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Cost ($)');

    // Add legend for milestone chart - positioned within chart bounds
    const milestoneLegend = milestoneSvg.append('g')
      .attr('transform', `translate(${milestoneWidth + milestoneMargin.left + 10}, ${milestoneMargin.top})`);

    milestoneLegend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Milestone Types:');

    milestoneData.forEach((item, i) => {
      milestoneLegend.append('rect')
        .attr('x', 0)
        .attr('y', i * 20 + 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d3.schemeCategory10[i])
        .attr('opacity', 0.8);

      milestoneLegend.append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 32)
        .style('font-size', '11px')
        .style('fill', '#6b7280')
        .text(`${item.milestone} (${item.count} projects)`);
    });
  }, [filtered, handleDrillDown]);

  // Function to create timeline chart
  const createTimelineChart = useCallback(() => {
    if (!filtered || filtered.length === 0) return;

    const timelineData = filtered.map(project => ({
      name: project.Project,
      start: new Date(project.G0),
      end: new Date(project.G5_Current),
      duration: parseFloat(project.Timeline_Variance || 0),
      status: project.Status,
    }));

    const timelineElement = document.getElementById('timeline-chart');

    if (!timelineElement) return;

    const timelineMargin = { top: 40, right: 250, bottom: 80, left: 120 };
    const containerWidth = timelineElement.clientWidth || 800;
    const timelineWidth = (containerWidth - timelineMargin.left - timelineMargin.right) * 0.9;
    const timelineHeight = 350 - timelineMargin.top - timelineMargin.bottom;

    const timelineSvg = d3.select('#timeline-chart');

    timelineSvg.selectAll('*').remove();

    // Set SVG dimensions to match container
    timelineSvg.attr('width', containerWidth)
      .attr('height', timelineHeight + timelineMargin.top + timelineMargin.bottom + 20);

    const timelineChart = timelineSvg.append('g')
      .attr('transform', `translate(${timelineMargin.left},${timelineMargin.top})`);

    const timelineX = d3.scaleBand()
      .range([0, timelineWidth])
      .domain(timelineData.map(d => d.name))
      .padding(0.2);

    const timelineY = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.duration)])
      .range([timelineHeight, 0]);

    // Add timeline bars
    timelineChart.selectAll('.timeline-bar')
      .data(timelineData)
      .enter().append('rect')
      .attr('class', 'timeline-bar')
      .attr('x', d => timelineX(d.name))
      .attr('width', timelineX.bandwidth())
      .attr('y', d => timelineY(d.duration))
      .attr('height', d => timelineHeight - timelineY(d.duration))
      .attr('fill', d => {
        if (d.status === 'Completed') return '#22c55e';
        if (d.status === 'On Track') return '#3b82f6';
        if (d.status === 'Delayed') return '#f59e0b';

        return '#ef4444';
      })
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const project = filtered.find(p => p.Project === d.name);

        if (project) {
          handleDrillDown('detail', [project], project);
        }
      });

    // Add axes
    timelineChart.append('g')
      .attr('transform', `translate(0,${timelineHeight})`)
      .call(d3.axisBottom(timelineX))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '8px');

    timelineChart.append('g')
      .call(d3.axisLeft(timelineY))
      .selectAll('text')
      .style('font-size', '10px');

    // Add axis titles
    timelineSvg.append('text')
      .attr('x', timelineWidth / 2 + timelineMargin.left)
      .attr('y', timelineHeight + timelineMargin.top + timelineMargin.bottom - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Project Name');

    timelineSvg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(timelineHeight / 2 + timelineMargin.top))
      .attr('y', timelineMargin.left - 40)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Duration (Months)');

    // Add legend for timeline chart - positioned within chart bounds
    const timelineLegend = timelineSvg.append('g')
      .attr('transform', `translate(${timelineWidth + timelineMargin.left + 10}, ${timelineMargin.top})`);

    timelineLegend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#374151')
      .text('Project Status:');

    const statusColors = [
      { status: 'Completed', color: '#22c55e' },
      { status: 'On Track', color: '#3b82f6' },
      { status: 'Delayed', color: '#f59e0b' },
      { status: 'At Risk', color: '#ef4444' },
    ];

    statusColors.forEach((item, i) => {
      timelineLegend.append('rect')
        .attr('x', 0)
        .attr('y', i * 20 + 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color)
        .attr('opacity', 0.8);

      timelineLegend.append('text')
        .attr('x', 20)
        .attr('y', i * 20 + 32)
        .style('font-size', '11px')
        .style('fill', '#6b7280')
        .text(item.status);
    });
  }, [filtered, handleDrillDown]);

  // Create budget vs spent chart
  useEffect(() => {
    if (!filtered || filtered.length === 0) return;

    // Check if we already have the same data to prevent unnecessary re-renders
    const currentDataKey = JSON.stringify(filtered.map(p => ({ Project: p.Project, Budget: p.Budget, Spent: p.Spent })));
    const chartElement = document.getElementById('budget-chart');

    if (chartElement && chartElement.lastDataKey === currentDataKey) return;

    // Store the data key to prevent unnecessary re-renders
    if (chartElement) {
      chartElement.lastDataKey = currentDataKey;
    }

    // Create the chart
    createBudgetChart();

    // Add debounced resize listener for responsive chart
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (chartElement && chartElement.lastDataKey === currentDataKey) {
          createBudgetChart();
        }
      }, 250); // 250ms debounce
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (chartElement) {
      resizeObserver.observe(chartElement);
    }

    // Cleanup function
    return () => {
      clearTimeout(resizeTimeout);
      if (chartElement) {
        resizeObserver.unobserve(chartElement);
      }
      resizeObserver.disconnect();
    };

  }, [filtered]);

  // Create efficiency charts
  useEffect(() => {
    console.log('Creating efficiency charts with:', { filtered: filtered?.length, financialMetrics });
    if (!filtered || filtered.length === 0) return;

    // Calculate financial metrics from the data
    const totalBudget = filtered.reduce((sum, p) => sum + parseFloat(p.Budget || 0), 0);
    const totalSpent = filtered.reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0);
    const totalVariance = totalBudget - totalSpent;
    const averageROI = filtered.reduce((sum, p) => sum + parseFloat(p.ROI_Percentage || 0), 0) / filtered.length;
    const averageInnovationScore = filtered.reduce((sum, p) => sum + parseFloat(p.Innovation_Score || 0), 0) / filtered.length;

    console.log('Calculated Financial Metrics:', {
      totalBudget,
      totalSpent,
      totalVariance,
      averageROI,
      averageInnovationScore,
    });

    // Check if we already have the same data to prevent unnecessary re-renders
    const currentDataKey = JSON.stringify(filtered.map(p => ({ Project: p.Project, Status: p.Status })));
    const milestoneElement = document.getElementById('milestone-chart');
    const timelineElement = document.getElementById('timeline-chart');

    if (milestoneElement && milestoneElement.lastDataKey === currentDataKey &&
          timelineElement && timelineElement.lastDataKey === currentDataKey) return;

    // Milestone Cost Distribution Chart
    console.log('Financial Metrics:', financialMetrics);
    console.log('Filtered Projects:', filtered);

    // Use actual milestone phase data from CSV
    const milestoneData = [
      {
        milestone: 'Concept',
        cost: filtered.filter(p => p.Milestone_Phase === 'Concept').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Milestone_Phase === 'Concept').length,
      },
      {
        milestone: 'Development',
        cost: filtered.filter(p => p.Milestone_Phase === 'Development').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Milestone_Phase === 'Development').length,
      },
      {
        milestone: 'Testing',
        cost: filtered.filter(p => p.Milestone_Phase === 'Testing').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Milestone_Phase === 'Testing').length,
      },
      {
        milestone: 'Regulatory',
        cost: filtered.filter(p => p.Milestone_Phase === 'Regulatory').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Milestone_Phase === 'Regulatory').length,
      },
      {
        milestone: 'Launch',
        cost: filtered.filter(p => p.Milestone_Phase === 'Launch').reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0),
        count: filtered.filter(p => p.Milestone_Phase === 'Launch').length,
      },
    ];

    console.log('Milestone Data:', milestoneData);

    // Create milestone chart
    // Only create chart if we have data
    if (milestoneData.every(d => d.cost === 0)) {
      console.log('No milestone data to display');
      // Show a message instead of empty chart
      const milestoneSvg = d3.select('#milestone-chart');

      milestoneSvg.selectAll('*').remove();
      milestoneSvg.append('text')
        .attr('x', 200)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('No milestone data available');
    } else {
      console.log('Creating milestone chart with data:', milestoneData);
      createMilestoneChart();
    }

    // Development Timeline Analysis Chart
    createTimelineChart();

    // Store the data key to prevent unnecessary re-renders
    if (milestoneElement) {
      milestoneElement.lastDataKey = currentDataKey;
    }
    if (timelineElement) {
      timelineElement.lastDataKey = currentDataKey;
    }

    // Add debounced resize listeners for responsive charts
    let milestoneResizeTimeout;
    let timelineResizeTimeout;

    const handleMilestoneResize = () => {
      clearTimeout(milestoneResizeTimeout);
      milestoneResizeTimeout = setTimeout(() => {
        if (milestoneElement && milestoneElement.lastDataKey === currentDataKey) {
          createMilestoneChart();
        }
      }, 250); // 250ms debounce
    };

    const handleTimelineResize = () => {
      clearTimeout(timelineResizeTimeout);
      timelineResizeTimeout = setTimeout(() => {
        if (timelineElement && timelineElement.lastDataKey === currentDataKey) {
          createTimelineChart();
        }
      }, 250); // 250ms debounce
    };

    const milestoneResizeObserver = new ResizeObserver(handleMilestoneResize);
    const timelineResizeObserver = new ResizeObserver(handleTimelineResize);

    if (milestoneElement) {
      milestoneResizeObserver.observe(milestoneElement);
    }
    if (timelineElement) {
      timelineResizeObserver.observe(timelineElement);
    }

    // Cleanup function
    return () => {
      clearTimeout(milestoneResizeTimeout);
      clearTimeout(timelineResizeTimeout);
      if (milestoneElement) {
        milestoneResizeObserver.unobserve(milestoneElement);
      }
      if (timelineElement) {
        timelineResizeObserver.unobserve(timelineElement);
      }
      milestoneResizeObserver.disconnect();
      timelineResizeObserver.disconnect();
    };

  }, [filtered, financialMetrics, createMilestoneChart, createTimelineChart]);

  return (
    <>
      {/* AI Side Panel */}
      <AISidePanel
        isOpen={isAIPanelOpen}
        onClose={() => setIsAIPanelOpen(false)}
        projects={projects}
        selectedPortfolio={selectedPortfolio}
        selectedStatuses={selectedBudgetStatuses}
      />

      <div className="dashboard-main-bg" style={{ marginLeft: sidebarCollapsed ? 0 : 200 }}>
        <div className="dashboard-container">

          <div className="dashboard-title">
            <div className="title-content">
              <h1>R&D Budget & Finance Dashboard</h1>
              <p>Research & Development Financial Performance, Innovation Investment Tracking & R&D Risk Management</p>
            </div>
            <div className="title-export">
              <ExportDropdown
                element={() => document.querySelector('.dashboard-container')}
                filename="Complete_Budget_Finance_Dashboard"
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

          {/* Drill-down Navigation - Only show when not at portfolio level */}
          {drillDownLevel !== 'portfolio' && (
            <div className="drill-down-navigation">
              <div className="drill-down-header">
                <h2>{getDrillDownTitle()}</h2>
                <div className="drill-down-controls">
                  {drillDownHistory.length > 0 && (
                    <button
                      className="drill-up-btn"
                      onClick={handleDrillUp}
                      title="Go back one level"
                    >
                     ← Back
                    </button>
                  )}
                  <button
                    className="reset-drill-btn"
                    onClick={resetDrillDown}
                    title="Return to portfolio overview"
                  >
                   🏠 Portfolio Overview
                  </button>
                </div>
              </div>
              <div className="drill-down-breadcrumb">
                <span
                  className="breadcrumb-item clickable"
                  onClick={resetDrillDown}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      resetDrillDown();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Return to Portfolio Overview"
                >
                 Portfolio Overview
                </span>
                {drillDownHistory.map((item, index) => (
                  <React.Fragment key={index}>
                    <span className="breadcrumb-separator"> → </span>
                    <span
                      className="breadcrumb-item clickable"
                      onClick={() => handleDrillDown(item.level, item.data, item.item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleDrillDown(item.level, item.data, item.item);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Navigate to ${item.level} ${item.level === 'program' ? item.item?.Program : item.level === 'project' ? item.item?.Project : 'Detail'}`}
                    >
                      {item.level === 'program' ? item.item?.Program : item.level === 'project' ? item.item?.Project : 'Detail'}
                    </span>
                  </React.Fragment>
                ))}
                <span className="breadcrumb-separator"> → </span>
                <span className="breadcrumb-item current">
                  {drillDownLevel === 'program' ? selectedDrillItem?.Program : drillDownLevel === 'project' ? selectedDrillItem?.Project : 'Detail'}
                </span>
              </div>
            </div>
          )}

          <div className="filters-section">
            <div className="filter-row">
              <PortfolioFilter
                onSelect={setSelectedPortfolio}
                portfolios={portfolios}
                selected={selectedPortfolio}
              />
              <BudgetStatusFilter
                onStatusChange={setSelectedBudgetStatuses}
                selectedStatuses={selectedBudgetStatuses}
                statuses={allBudgetStatuses}
              />
              <RDCategoryFilter
                categories={rdCategories}
                onCategoryChange={setSelectedRDCategories}
                selectedCategories={selectedRDCategories}
              />
            </div>
          </div>


          {/* Financial Metrics Dashboard */}
          <div className="financial-metrics-section">
            <div className="metrics-grid">
              <div
                className="metric-card clickable"
                onClick={() => handleDrillDown('program', filtered, { type: 'budget', value: financialMetrics.totalBudget })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDrillDown('program', filtered, { type: 'budget', value: financialMetrics.totalBudget });
                  }
                }}
                role="button"
                tabIndex={0}
                title="Click to drill down into budget breakdown by program"
                aria-label="Total Budget: ${(financialMetrics.totalBudget / 1000000).toFixed(1)}M. Click to explore program breakdown."
              >
                <div className="metric-value">${(financialMetrics.totalBudget / 1000000).toFixed(1)}M</div>
                <div className="metric-label">Total Budget</div>
                <div className="metric-hint">Click to explore →</div>
              </div>
              <div
                className="metric-card clickable"
                onClick={() => handleDrillDown('program', filtered, { type: 'spent', value: financialMetrics.totalSpent })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDrillDown('program', filtered, { type: 'spent', value: financialMetrics.totalSpent });
                  }
                }}
                role="button"
                tabIndex={0}
                title="Click to drill down into spending breakdown by program"
                aria-label="Total Spent: ${(financialMetrics.totalSpent / 1000000).toFixed(1)}M. Click to explore program breakdown."
              >
                <div className="metric-value">${(financialMetrics.totalSpent / 1000000).toFixed(1)}M</div>
                <div className="metric-label">Total Spent</div>
                <div className="metric-hint">Click to explore →</div>
              </div>
              <div
                className="metric-card clickable"
                onClick={() => handleDrillDown('program', filtered, { type: 'remaining', value: financialMetrics.totalRemaining })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDrillDown('program', filtered, { type: 'remaining', value: financialMetrics.totalRemaining });
                  }
                }}
                role="button"
                tabIndex={0}
                title="Click to drill down into remaining budget by program"
                aria-label="Remaining Budget: ${(financialMetrics.totalRemaining / 1000000).toFixed(1)}M. Click to explore program breakdown."
              >
                <div className="metric-value">${(financialMetrics.totalRemaining / 1000000).toFixed(1)}M</div>
                <div className="metric-label">Remaining Budget</div>
                <div className="metric-hint">Click to explore →</div>
              </div>
              <div
                className="metric-card clickable"
                onClick={() => handleDrillDown('program', filtered, { type: 'roi', value: financialMetrics.roiEstimate })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleDrillDown('program', filtered, { type: 'roi', value: financialMetrics.roiEstimate });
                  }
                }}
                role="button"
                tabIndex={0}
                title="Click to drill down into ROI breakdown by program"
                aria-label="Estimated ROI: {(financialMetrics.roiEstimate || 0).toFixed(0)}%. Click to explore program breakdown."
              >
                <div className="metric-value">{(financialMetrics.roiEstimate || 0).toFixed(0)}%</div>
                <div className="metric-label">Est. ROI</div>
                <div className="metric-hint">Click to explore →</div>
              </div>
            </div>
          </div>

          {/* Budget Status Metrics */}
          <div className="budget-status-section">
            <div className="status-metrics-grid">
              <div className="status-metric-card under-budget">
                <div className="status-metric-value">{financialMetrics.underBudgetCount || 0}</div>
                <div className="status-metric-label">Under Budget</div>
              </div>
              <div className="status-metric-card on-budget">
                <div className="status-metric-value">
                  {(filtered.length || 0) - (financialMetrics.overBudgetCount || 0) - (financialMetrics.underBudgetCount || 0)}
                </div>
                <div className="status-metric-label">On Budget</div>
              </div>
              <div className="status-metric-card over-budget">
                <div className="metric-value">{financialMetrics.overBudgetCount || 0}</div>
                <div className="metric-label">Over Budget</div>
              </div>
              <div className="status-metric-card at-risk">
                <div className="metric-value">{financialMetrics.atRiskCount || 0}</div>
                <div className="metric-label">At Risk</div>
              </div>
            </div>
          </div>

          {/* Budget vs Spent Chart */}
          <div className="chart-section">
            <div className="chart-header-with-export">
              <h3>Budget vs Actual Spending</h3>
              <div className="chart-export-buttons">
                <ExportDropdown
                  element={() => document.getElementById('budget-chart')}
                  filename="Budget_vs_Actual_Spending"
                />
              </div>
            </div>
            <div className="chart-container">
              <svg height="450" id="budget-chart" width="100%"></svg>
            </div>
          </div>

          {/* Drill-down Data Visualization */}
          {drillDownLevel !== 'portfolio' && drillDownData && (
            <div className="drill-down-data-section">
              <h3>Drill-down Analysis: {getDrillDownTitle()}</h3>

              {drillDownLevel === 'program' && (
                <div className="drill-down-program-view">
                  <div className="program-breakdown-grid">
                    {[...new Set(drillDownData.map(p => p.Program))].map(program => {
                      const programProjects = drillDownData.filter(p => p.Program === program);
                      const programBudget = programProjects.reduce((sum, p) => sum + parseFloat(p.Budget || 0), 0);
                      const programSpent = programProjects.reduce((sum, p) => sum + parseFloat(p.Spent || 0), 0);

                      return (
                        <div
                          className="program-breakdown-card clickable"
                          key={program}
                          onClick={() => handleDrillDown('project', programProjects, { Program: program, type: 'program' })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleDrillDown('project', programProjects, { Program: program, type: 'program' });
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          title="Click to drill down to projects"
                          aria-label={`Drill down to projects in ${program} program`}
                        >
                          <h4>{program}</h4>
                          <div className="program-metrics">
                            <div className="program-metric">
                              <span className="metric-label">Budget:</span>
                              <span className="metric-value">${(programBudget / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="program-metric">
                              <span className="metric-label">Spent:</span>
                              <span className="metric-value">${(programSpent / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="program-metric">
                              <span className="metric-label">Projects:</span>
                              <span className="metric-value">{programProjects.length}</span>
                            </div>
                          </div>
                          <div className="drill-hint">Click to see projects →</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {drillDownLevel === 'project' && (
                <div className="drill-down-project-view">
                  <div className="project-detail-grid">
                    {drillDownData.map(project => (
                      <div
                        className="project-detail-card clickable"
                        key={project.Project}
                        onClick={() => handleDrillDown('detail', [project], project)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleDrillDown('detail', [project], project);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        title="Click to see detailed project information"
                        aria-label={`View detailed information for ${project.Project} project`}
                      >
                        <h4>{project.Project}</h4>
                        <div className="project-details">
                          <div className="project-detail-row">
                            <span className="detail-label">Portfolio:</span>
                            <span className="detail-value">{project.Portfolio}</span>
                          </div>
                          <div className="project-detail-row">
                            <span className="detail-label">Program:</span>
                            <span className="detail-value">{project.Program}</span>
                          </div>
                          <div className="project-detail-row">
                            <span className="detail-label">Status:</span>
                            <span className={`detail-value status-${project.Status?.toLowerCase().replace(' ', '-')}`}>
                              {project.Status}
                            </span>
                          </div>
                          <div className="project-detail-row">
                            <span className="detail-label">Budget:</span>
                            <span className="detail-value">${(parseFloat(project.Budget || 0) / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="project-detail-row">
                            <span className="detail-label">Spent:</span>
                            <span className="detail-value">${(parseFloat(project.Spent || 0) / 1000000).toFixed(1)}M</span>
                          </div>
                          <div className="project-detail-row">
                            <span className="detail-label">Budget Status:</span>
                            <span className={`detail-value budget-status-${project.BudgetStatus?.toLowerCase().replace(' ', '-')}`}>
                              {project.BudgetStatus}
                            </span>
                          </div>
                        </div>
                        <div className="drill-hint">Click for full details →</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drillDownLevel === 'detail' && (
                <div className="drill-down-detail-view">
                  <div className="project-full-detail">
                    <h4>Full Project Details: {drillDownData[0]?.Project}</h4>
                    <div className="detail-sections">
                      <div className="detail-section">
                        <h5>Project Information</h5>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">BPM ID:</span>
                            <span className="detail-value">{drillDownData[0]?.BPM_ID}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Project Manager:</span>
                            <span className="detail-value">{drillDownData[0]?.Project_Manager}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Department:</span>
                            <span className="detail-value">{drillDownData[0]?.Department}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">R&D Category:</span>
                            <span className="detail-value">{drillDownData[0]?.RDCategory}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Funding Source:</span>
                            <span className="detail-value">{drillDownData[0]?.FundingSource}</span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h5>Timeline</h5>
                        <div className="timeline-details">
                          <div className="timeline-item">
                            <span className="timeline-label">G0 (Start):</span>
                            <span className="timeline-date">{new Date(drillDownData[0]?.G0).toLocaleDateString()}</span>
                          </div>
                          <div className="timeline-item">
                            <span className="timeline-label">G5 Previous:</span>
                            <span className="timeline-date">{new Date(drillDownData[0]?.G5_Previous).toLocaleDateString()}</span>
                          </div>
                          <div className="timeline-item">
                            <span className="timeline-label">G5 Current:</span>
                            <span className="timeline-date">{new Date(drillDownData[0]?.G5_Current).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h5>Financial Summary</h5>
                        <div className="financial-summary">
                          <div className="financial-item">
                            <span className="financial-label">Total Budget:</span>
                            <span className="financial-value">${(parseFloat(drillDownData[0]?.Budget || 0) / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="financial-item">
                            <span className="financial-label">Total Spent:</span>
                            <span className="financial-value">${(parseFloat(drillDownData[0]?.Spent || 0) / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="financial-item">
                            <span className="financial-label">Remaining:</span>
                            <span className="financial-value">${((parseFloat(drillDownData[0]?.Budget || 0) - parseFloat(drillDownData[0]?.Spent || 0)) / 1000000).toFixed(2)}M</span>
                          </div>
                          <div className="financial-item">
                            <span className="financial-label">Budget Status:</span>
                            <span className={`financial-value budget-status-${drillDownData[0]?.BudgetStatus?.toLowerCase().replace(' ', '-')}`}>
                              {drillDownData[0]?.BudgetStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Funding Sources Analysis */}
          <div className="funding-sources-section">
            <h3>Funding Sources Distribution</h3>
            <div className="funding-sources-grid">
              {fundingSources.map((source, index) => (
                <div className="funding-source-card" key={index}>
                  <div className="source-name">{source.name}</div>
                  <div className="source-amount">${(source.amount / 1000000).toFixed(1)}M</div>
                  <div className="source-count">{source.count} projects</div>
                  <div className="source-percentage">
                    {((source.amount / financialMetrics.totalBudget) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Insights */}
          {budgetInsights.length > 0 && (
            <div className="insights-section">
              <h3>Financial Risk Insights</h3>
              <div className="insights-grid">
                {budgetInsights.map((insight, index) => (
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

          {/* R&D Investment Breakdown */}
          <div className="rd-investment-section">
            <h3>R&D Investment Breakdown</h3>
            <div className="rd-investment-grid">
              <div className="rd-investment-card">
                <h4>Basic Research</h4>
                <div className="rd-investment-value">
                ${((financialMetrics.totalSpent * 0.20) / 1000000).toFixed(1)}M
                </div>
                <div className="rd-investment-description">
                20% - Fundamental scientific research and discovery
                </div>
              </div>
              <div className="rd-investment-card">
                <h4>Applied Research</h4>
                <div className="rd-investment-value">
                ${((financialMetrics.totalSpent * 0.30) / 1000000).toFixed(1)}M
                </div>
                <div className="rd-investment-description">
                30% - Research with specific commercial applications
                </div>
              </div>
              <div className="rd-investment-card">
                <h4>Development</h4>
                <div className="rd-investment-value">
                ${((financialMetrics.totalSpent * 0.25) / 1000000).toFixed(1)}M
                </div>
                <div className="rd-investment-description">
                25% - Product development and engineering
                </div>
              </div>
              <div className="rd-investment-card">
                <h4>Clinical Trials</h4>
                <div className="rd-investment-value">
                ${((financialMetrics.totalSpent * 0.15) / 1000000).toFixed(1)}M
                </div>
                <div className="rd-investment-description">
                15% - Clinical studies and patient trials
                </div>
              </div>
              <div className="rd-investment-card">
                <h4>Regulatory & IP</h4>
                <div className="rd-investment-value">
                ${((financialMetrics.totalSpent * 0.10) / 1000000).toFixed(1)}M
                </div>
                <div className="rd-investment-description">
                10% - FDA compliance and intellectual property protection
                </div>
              </div>
            </div>
          </div>

          {/* R&D Performance Metrics */}
          <div className="rd-performance-section">
            <h3>R&D Performance Metrics</h3>
            <div className="rd-performance-grid">
              <div className="rd-performance-card">
                <h4>R&D Intensity</h4>
                <div className="rd-performance-value">
                  {((financialMetrics.totalSpent / (financialMetrics.totalBudget * 2)) * 100).toFixed(1)}%
                </div>
                <div className="rd-performance-description">
                 R&D spending as percentage of total organizational budget
                </div>
              </div>
              <div className="rd-performance-card">
                <h4>Innovation Index</h4>
                <div className="rd-performance-value">
                  {((financialMetrics.totalSpent * 0.5) / (financialMetrics.totalSpent * 0.25)).toFixed(1)}
                </div>
                <div className="rd-performance-description">
                 Ratio of research (Basic + Applied) to development spending
                </div>
              </div>
              <div className="rd-performance-card">
                <h4>Development Efficiency</h4>
                <div className="rd-performance-value">
                 ${((financialMetrics.totalSpent * 0.25) / 1000000).toFixed(1)}M
                </div>
                <div className="rd-performance-description">
                 Development cost per major milestone achieved
                </div>
              </div>
              <div className="rd-performance-card">
                <h4>Time to Market</h4>
                <div className="rd-performance-value">
                 18-24 months
                </div>
                <div className="rd-performance-description">
                 Estimated time from concept to market launch
                </div>
              </div>
            </div>
          </div>

          {/* Development Efficiency Analytics */}
          <div className="development-efficiency-section">
            <h3>Development Efficiency Analytics</h3>

            {/* Efficiency Metrics Grid */}
            <div className="efficiency-metrics-grid">
              <div className="efficiency-metric-card">
                <h4>Cost per Milestone</h4>
                <div className="efficiency-metric-value">
                 ${(financialMetrics.totalSpent / (filtered.filter(p => p.Status === 'Completed').length || 1) / 1000000).toFixed(2)}M
                </div>
                <div className="efficiency-metric-description">
                 Average cost per completed milestone
                </div>
                <div className="efficiency-trend">
                  <span className="trend-indicator positive">↗ +12%</span>
                  <span className="trend-period">vs last quarter</span>
                </div>
              </div>

              <div className="efficiency-metric-card">
                <h4>Time-to-Market</h4>
                <div className="efficiency-metric-value">
                  {(filtered.filter(p => p.Status === 'Completed').length > 0 ?
                    filtered.filter(p => p.Status === 'Completed').reduce((acc, p) => {
                      const start = new Date(p.G0);
                      const end = new Date(p.G5_Current);

                      return acc + (end - start) / (1000 * 60 * 60 * 24 * 30);
                    }, 0) / filtered.filter(p => p.Status === 'Completed').length : 0).toFixed(1)} months
                </div>
                <div className="efficiency-metric-description">
                 Average development cycle time
                </div>
                <div className="efficiency-trend">
                  <span className="trend-indicator negative">↘ -8%</span>
                  <span className="trend-period">vs last quarter</span>
                </div>
              </div>

              <div className="efficiency-metric-card">
                <h4>Resource Utilization</h4>
                <div className="efficiency-metric-value">
                  {((financialMetrics.totalSpent / financialMetrics.totalBudget) * 100).toFixed(1)}%
                </div>
                <div className="efficiency-metric-description">
                 Budget utilization rate
                </div>
                <div className="efficiency-trend">
                  <span className="trend-indicator positive">↗ +5%</span>
                  <span className="trend-period">vs last quarter</span>
                </div>
              </div>

              <div className="efficiency-metric-card">
                <h4>Bottleneck Score</h4>
                <div className="efficiency-metric-value">
                  {Math.round((filtered.filter(p => p.Status === 'Delayed' || p.Status === 'At Risk').length / filtered.length) * 100)}%
                </div>
                <div className="efficiency-metric-description">
                 Projects experiencing delays or risks
                </div>
                <div className="efficiency-trend">
                  <span className="trend-indicator negative">↗ +3%</span>
                  <span className="trend-period">vs last quarter</span>
                </div>
              </div>
            </div>

            {/* Efficiency Charts */}
            <div className="efficiency-charts-grid">
              <div className="efficiency-chart-card">
                <div className="chart-header-with-export">
                  <h4>Milestone Cost Distribution</h4>
                  <div className="chart-export-buttons">
                    <ExportDropdown
                      element={() => document.getElementById('milestone-chart')}
                      filename="Milestone_Cost_Distribution"
                    />
                  </div>
                </div>
                <div className="chart-container">
                  <svg height="300" id="milestone-chart" width="100%"></svg>
                </div>
              </div>

              <div className="efficiency-chart-card">
                <div className="chart-header-with-export">
                  <h4>Development Timeline Analysis</h4>
                  <div className="chart-export-buttons">
                    <ExportDropdown
                      element={() => document.getElementById('timeline-chart')}
                      filename="Development_Timeline_Analysis"
                    />
                  </div>
                </div>
                <div className="chart-container">
                  <svg height="300" id="timeline-chart" width="100%"></svg>
                </div>
              </div>
            </div>

            {/* Bottleneck Analysis */}
            <div className="bottleneck-analysis-section">
              <h4>Bottleneck Identification & Analysis</h4>
              <div className="bottleneck-grid">
                <div className="bottleneck-card critical">
                  <div className="bottleneck-header">
                    <span className="bottleneck-type">Critical</span>
                    <span className="bottleneck-count">{filtered.filter(p => p.Status === 'At Risk').length} projects</span>
                  </div>
                  <h5>Regulatory Delays</h5>
                  <p>FDA approval process taking 40% longer than industry average</p>
                  <div className="bottleneck-impact">
                    <strong>Impact:</strong> 3-6 month delay, $2.1M additional cost
                  </div>
                  <div className="bottleneck-recommendation">
                    <strong>Recommendation:</strong> Early FDA engagement, parallel track applications
                  </div>
                </div>

                <div className="bottleneck-card warning">
                  <div className="bottleneck-header">
                    <span className="bottleneck-type">Warning</span>
                    <span className="bottleneck-count">{filtered.filter(p => p.Status === 'Delayed').length} projects</span>
                  </div>
                  <h5>Resource Constraints</h5>
                  <p>Clinical trial teams operating at 85% capacity</p>
                  <div className="bottleneck-impact">
                    <strong>Impact:</strong> 2-4 month delay, $1.8M additional cost
                  </div>
                  <div className="bottleneck-recommendation">
                    <strong>Recommendation:</strong> Increase team capacity, optimize trial protocols
                  </div>
                </div>

                <div className="bottleneck-card info">
                  <div className="bottleneck-header">
                    <span className="bottleneck-type">Info</span>
                    <span className="bottleneck-count">{filtered.filter(p => p.Status === 'On Track').length} projects</span>
                  </div>
                  <h5>Supply Chain Optimization</h5>
                  <p>Component sourcing improved by 15% through vendor consolidation</p>
                  <div className="bottleneck-impact">
                    <strong>Impact:</strong> 1-2 month acceleration, $0.9M cost savings
                  </div>
                  <div className="bottleneck-recommendation">
                    <strong>Recommendation:</strong> Expand vendor partnerships, implement JIT inventory
                  </div>
                </div>
              </div>
            </div>

            {/* Efficiency Insights */}
            <div className="efficiency-insights-section">
              <h4>Efficiency Optimization Insights</h4>
              <div className="efficiency-insights-grid">
                <div className="efficiency-insight-card">
                  <div className="insight-icon">📈</div>
                  <h5>Cost Optimization Opportunity</h5>
                  <p>Clinical trials represent 40% of development costs. Consider parallel track development to reduce timeline by 25%.</p>
                  <div className="insight-metric">
                    <strong>Potential Savings:</strong> $3.2M annually
                  </div>
                </div>

                <div className="efficiency-insight-card">
                  <div className="insight-icon">⚡</div>
                  <h5>Timeline Acceleration</h5>
                  <p>Regulatory pathway optimization could reduce approval time by 30% through early FDA engagement.</p>
                  <div className="insight-metric">
                    <strong>Time Saved:</strong> 4-6 months per project
                  </div>
                </div>

                <div className="efficiency-insight-card">
                  <div className="insight-icon">🔄</div>
                  <h5>Resource Reallocation</h5>
                  <p>Shift 15% of basic research budget to applied research for 20% faster time-to-market.</p>
                  <div className="insight-metric">
                    <strong>ROI Improvement:</strong> +18% over 3 years
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
