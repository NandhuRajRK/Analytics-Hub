# Component Documentation - Portfolio Dashboard

## Table of Contents
1. [App.js - Main Application](#appjs---main-application)
2. [Dashboard.jsx - Main Dashboard](#dashboardjsx---main-dashboard)
3. [SidebarMenu.jsx - Navigation](#sidebarmenujsx---navigation)
4. [PortfolioFilter.jsx - Data Filtering](#portfoliofilterjsx---data-filtering)
5. [AISidePanel.jsx - AI Integration](#aisidepaneljsx---ai-integration)
6. [AdvancedCharts.jsx - Data Visualization](#advancedchartsjsx---data-visualization)
7. [DependencyGraph.jsx - Dependencies](#dependencygraphjsx---dependencies)
8. [BudgetFinance.jsx - Financial Management](#budgetfinancejsx---financial-management)
9. [ExportDropdown.jsx - Data Export](#exportdropdownjsx---data-export)
10. [DepartmentDashboard.jsx - Department View](#departmentdashboardjsx---department-view)
11. [DevOpsAnalytics.jsx - DevOps Monitoring](#devopsanalyticsjsx---devops-monitoring)
12. [Data Loading System](#data-loading-system)

---

## App.js - Main Application

**Location**: `dashboard/src/App.js`
**Purpose**: Main application entry point and routing configuration

### Component Structure
```javascript
function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  
  // Sidebar auto-collapse logic for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 700) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
}
```

### Key Features
- **Responsive Design**: Auto-collapses sidebar on mobile devices
- **State Management**: Manages sidebar and AI panel states
- **Routing**: React Router configuration for all application routes
- **Layout**: Flexbox-based layout with sidebar and main content

### Routes Configuration
```javascript
<Routes>
  <Route path="/" element={
    <Dashboard 
      sidebarCollapsed={sidebarCollapsed} 
      isAIPanelOpen={isAIPanelOpen}
      setIsAIPanelOpen={setIsAIPanelOpen}
    />
  } />
  <Route path="/departments" element={<DepartmentDashboard sidebarCollapsed={sidebarCollapsed} />} />
  <Route path="/dependencies" element={<DependencyGraph sidebarCollapsed={sidebarCollapsed} />} />
  <Route path="/budget" element={<BudgetFinance sidebarCollapsed={sidebarCollapsed} />} />
  <Route path="/advanced-charts" element={<AdvancedCharts sidebarCollapsed={sidebarCollapsed} />} />
  <Route path="/devops" element={<DevOpsAnalytics sidebarCollapsed={sidebarCollapsed} />} />
</Routes>
```

### Props Passed to Components
- `sidebarCollapsed`: Boolean for sidebar state
- `isAIPanelOpen`: Boolean for AI panel visibility
- `setIsAIPanelOpen`: Function to toggle AI panel

---

## Dashboard.jsx - Main Dashboard

**Location**: `dashboard/src/components/Dashboard.jsx`
**Purpose**: Primary dashboard interface with portfolio overview and data visualization

### Component Structure
```javascript
function Dashboard({ sidebarCollapsed, isAIPanelOpen, setIsAIPanelOpen }) {
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [timelineFormat, setTimelineFormat] = useState('months');
}
```

### Key Functions

#### 1. groupData(projects)
**Purpose**: Groups projects by Portfolio > Program > Projects hierarchy
```javascript
function groupData(projects) {
  const portfolios = {};
  projects.forEach(p => {
    if (!portfolios[p.Portfolio]) portfolios[p.Portfolio] = {};
    if (!portfolios[p.Portfolio][p.Program]) portfolios[p.Portfolio][p.Program] = [];
    portfolios[p.Portfolio][p.Program].push(p);
  });
  return portfolios;
}
```

#### 2. generateTimelineLabels(start, end, format)
**Purpose**: Creates timeline labels for different time formats
```javascript
function generateTimelineLabels(start, end, format) {
  const s = new Date(start);
  const e = new Date(end);
  const labels = [];
  
  switch (format) {
    case 'months':
      // Generate monthly labels
      break;
    case 'quarters':
      // Generate quarterly labels
      break;
    case 'years':
      // Generate yearly labels
      break;
  }
  return labels;
}
```

#### 3. getStatusColor(status)
**Purpose**: Returns color codes for project statuses
```javascript
function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'on track': return '#22c55e';     // green
    case 'delayed': return '#ef4444';     // red
    case 'completed': return '#3b82f6';   // blue
    case 'at risk': return '#f59e42';     // orange
    default: return '#a3a3a3';           // gray
  }
}
```

### Data Processing
- **CSV Loading**: Uses `loadCSV` function to load project data
- **Filtering**: Implements portfolio, program, and search filtering
- **Grouping**: Organizes data hierarchically for display
- **Timeline Generation**: Creates time-based labels for charts

### UI Components
- **Portfolio Filter**: Dropdown for portfolio selection
- **Program Filter**: Dropdown for program selection
- **Search Bar**: Text search across projects
- **Timeline Format Selector**: Choose between months/quarters/years
- **Export Dropdown**: Export functionality
- **AI Side Panel**: AI-powered insights

---

## SidebarMenu.jsx - Navigation

**Location**: `dashboard/src/components/SidebarMenu.jsx`
**Purpose**: Main navigation sidebar with collapsible functionality

### Component Structure
```javascript
function SidebarMenu({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
}
```

### Navigation Items
```javascript
const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/departments', label: 'Departments', icon: '🏢' },
  { path: '/dependencies', label: 'Dependencies', icon: '🔗' },
  { path: '/budget', label: 'Budget', icon: '💰' },
  { path: '/advanced-charts', label: 'Charts', icon: '📈' },
  { path: '/devops', label: 'DevOps', icon: '🚀' }
];
```

### Key Features
- **Collapsible Design**: Toggle between expanded and collapsed states
- **Active Route Highlighting**: Shows current active page
- **Responsive Design**: Adapts to different screen sizes
- **Icon Support**: Visual indicators for each menu item
- **Smooth Animations**: CSS transitions for state changes

### Props
- `collapsed`: Boolean for sidebar state
- `setCollapsed`: Function to toggle sidebar state

---

## PortfolioFilter.jsx - Data Filtering

**Location**: `dashboard/src/components/PortfolioFilter.jsx`
**Purpose**: Filter and search portfolio data with multiple criteria

### Component Structure
```javascript
function PortfolioFilter({ 
  data, 
  selectedPortfolio, 
  setSelectedPortfolio,
  selectedProgram, 
  setSelectedProgram,
  searchTerm, 
  setSearchTerm 
}) {
  // Component logic
}
```

### Filtering Options
1. **Portfolio Filter**: Dropdown to select specific portfolio
2. **Program Filter**: Dropdown to select specific program
3. **Search Filter**: Text search across project names and details
4. **Status Filter**: Filter by project status

### Data Processing
- **Unique Values**: Extracts unique portfolio and program names
- **Filtered Results**: Applies multiple filter criteria
- **Real-time Updates**: Updates as user types or selects options

---

## AISidePanel.jsx - AI Integration

**Location**: `dashboard/src/components/AISidePanel.jsx`
**Purpose**: AI-powered insights and recommendations for portfolio data

### Component Structure
```javascript
function AISidePanel({ isOpen, onClose, data }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
}
```

### Key Features
- **Natural Language Queries**: Users can ask questions in plain English
- **Data Context**: Sends current portfolio data to AI for analysis
- **Intelligent Insights**: Provides data-driven insights and recommendations
- **Loading States**: Shows progress during AI processing
- **Error Handling**: Graceful fallback for AI failures

### API Integration
- **Backend Communication**: Sends queries to FastAPI backend
- **LLM Processing**: Uses OpenAI, Ollama, or template system
- **Response Formatting**: Displays insights and recommendations clearly

---

## AdvancedCharts.jsx - Data Visualization

**Location**: `dashboard/src/components/AdvancedCharts.jsx`
**Purpose**: Advanced charting and data visualization capabilities

### Chart Types
1. **Bar Charts**: Portfolio and program comparisons
2. **Line Charts**: Timeline and trend analysis
3. **Pie Charts**: Status distribution and budget allocation
4. **Scatter Plots**: Correlation analysis
5. **Heatmaps**: Multi-dimensional data visualization

### Data Processing
- **Chart Data Preparation**: Transforms raw data for chart libraries
- **Responsive Design**: Charts adapt to different screen sizes
- **Interactive Features**: Hover effects, zoom, and pan capabilities
- **Export Functionality**: Save charts as images or PDFs

---

## DependencyGraph.jsx - Dependencies

**Location**: `dashboard/src/components/DependencyGraph.jsx`
**Purpose**: Visual representation of project dependencies and relationships

### Key Features
- **Dependency Mapping**: Shows project-to-project relationships
- **Critical Path Analysis**: Identifies critical dependency chains
- **Interactive Visualization**: Click to explore dependencies
- **Impact Assessment**: Shows how delays affect other projects
- **Filtering Options**: Focus on specific dependency types

### Visualization Elements
- **Nodes**: Represent individual projects
- **Edges**: Show dependency relationships
- **Colors**: Indicate dependency types and status
- **Layout**: Hierarchical or force-directed graph layouts

---

## BudgetFinance.jsx - Financial Management

**Location**: `dashboard/src/components/BudgetFinance.jsx`
**Purpose**: Budget tracking, financial analysis, and reporting

### Key Features
- **Budget Overview**: Total portfolio budget and allocation
- **Cost Tracking**: Actual vs. planned spending
- **Financial Reporting**: Detailed budget reports
- **Trend Analysis**: Budget utilization over time
- **Alert System**: Budget overruns and risks

### Financial Metrics
- **Budget Utilization**: Percentage of budget used
- **Cost Variance**: Difference between planned and actual
- **ROI Analysis**: Return on investment calculations
- **Cash Flow**: Projected and actual cash flows

---

## ExportDropdown.jsx - Data Export

**Location**: `dashboard/src/components/ExportDropdown.jsx`
**Purpose**: Export functionality for reports and data in multiple formats

### Export Formats
1. **CSV**: Comma-separated values for spreadsheet applications
2. **Excel**: Microsoft Excel format with formatting
3. **PDF**: Portable Document Format for reports
4. **JSON**: JavaScript Object Notation for data processing

### Export Options
- **Data Selection**: Choose what data to export
- **Format Selection**: Pick export format
- **Customization**: Date ranges, filters, and sorting
- **Batch Export**: Export multiple reports at once

---

## DepartmentDashboard.jsx - Department View

**Location**: `dashboard/src/components/DepartmentDashboard.jsx`
**Purpose**: Department-specific dashboard and analytics

### Key Features
- **Department Overview**: Summary of department activities
- **Project Portfolio**: Projects within specific departments
- **Resource Allocation**: Staff and budget allocation
- **Performance Metrics**: Department-specific KPIs
- **Cross-Department Analysis**: Inter-department dependencies

### Data Visualization
- **Department Charts**: Department-specific data visualization
- **Comparison Views**: Compare departments side by side
- **Trend Analysis**: Department performance over time
- **Resource Utilization**: Staff and budget efficiency

---

## DevOpsAnalytics.jsx - DevOps Organizational Dashboard

**Location**: `dashboard/src/components/DevOpsAnalytics.jsx`
**Purpose**: Organizational-level DevOps analytics for portfolio management and agile processes

### Component Structure
```javascript
function DevOpsAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
}
```

### Key Features
- **Epic Management**: Organizational backlog management and epic tracking
- **Team Velocity**: Cross-team performance and capacity analysis
- **Backlog Overview**: Portfolio-level backlog status and distribution
- **Sprint Planning**: Release planning and sprint coordination
- **DevOps Maturity**: Organizational DevOps transformation assessment
- **Cross-team Coordination**: Team dependencies and resource allocation

### Data Sources
- **Primary Data**: `devops-organizational.csv` - DevOps organizational data and agile processes
- **Update Frequency**: Weekly updates for epics/sprints, monthly for teams/maturity
- **Data Fields**: 20 fields including epics, teams, backlog, sprints, and maturity assessment

### Organizational Views
1. **Epic Management**: Epic status, progress, and team assignments
2. **Team Velocity**: Team performance, capacity, and utilization rates
3. **Backlog Overview**: Portfolio-level backlog status and priority distribution
4. **Sprint Planning**: Sprint goals, capacity, and team coordination
5. **DevOps Maturity**: Organizational transformation progress and dimensions
6. **Cross-team Dependencies**: Team coordination and resource allocation

### UI Components
- **Epic Cards**: Epic status, progress, and team information
- **Team Velocity Charts**: Team performance and capacity visualization
- **Backlog Overview**: Status and priority distribution charts
- **Sprint Timeline**: Sprint planning and coordination view
- **Maturity Assessment**: DevOps transformation progress dashboard

### Data Loading
```javascript
// Uses Promise-based data loading
const devopsData = await loadCSV('/data/devops-organizational.csv');
```

---

## Data Loading System

**Location**: `dashboard/src/dataLoader.js`
**Purpose**: Robust CSV data loading with dual API support

### Architecture Overview
The data loading system provides both Promise-based and callback-based APIs for maximum compatibility and modern development practices.

### API Functions

#### 1. loadCSV(filePath, callback?)
**Purpose**: Load and parse a single CSV file
**Returns**: Promise (if no callback) or undefined (if callback provided)

```javascript
// Promise-based usage (Recommended)
const data = await loadCSV('/data/demo.csv');

// Callback-based usage (Legacy support)
loadCSV('/data/demo.csv', (data) => {
  setProjects(data);
});
```

#### 2. loadMultipleCSVs(filePaths, callback?)
**Purpose**: Load multiple CSV files in parallel
**Returns**: Promise (if no callback) or undefined (if callback provided)

```javascript
// Promise-based usage
const allData = await loadMultipleCSVs([
  '/data/demo.csv',
  '/data/budget-statuses.csv'
]);

// Callback-based usage
loadMultipleCSVs([
  '/data/demo.csv',
  '/data/budget-statuses.csv'
], (data) => {
  setProjects(data['/data/demo.csv']);
  setBudgetStatuses(data['/data/budget-statuses.csv']);
});
```

### Key Features
- **Dual API Support**: Both modern Promise-based and legacy callback-based patterns
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Performance**: Parallel loading of multiple files
- **Browser Caching**: Leverages browser caching for static CSV files
- **Data Validation**: Automatic CSV structure validation

### Error Handling
- **Network Errors**: Automatic retry with fallback to empty arrays
- **CSV Parsing Errors**: Detailed error logging with graceful degradation
- **Missing Files**: Graceful fallback to empty data structures
- **Validation**: Automatic data structure validation

### Performance Optimizations
- **Parallel Loading**: Multiple CSV files loaded simultaneously
- **Lazy Loading**: Data loaded only when components mount
- **Memory Management**: Efficient data structures and cleanup
- **Caching Strategy**: Browser-level caching for static files

---

## Component Development Guidelines

### Creating New Components
1. **File Naming**: Use PascalCase (e.g., `NewComponent.jsx`)
2. **CSS Files**: Create corresponding CSS file with same name
3. **Props Interface**: Define clear prop requirements
4. **Error Handling**: Implement graceful error handling
5. **Loading States**: Show loading indicators for async operations

### Component Communication
- **Props Down**: Pass data and functions as props
- **Events Up**: Use callback functions for child-to-parent communication
- **State Management**: Use React hooks for local state
- **Context API**: Consider for deeply nested component communication

### Performance Optimization
- **React.memo**: Wrap components that don't need frequent re-renders
- **useCallback**: Memoize functions passed as props
- **useMemo**: Memoize expensive calculations
- **Lazy Loading**: Load components only when needed

### Styling Best Practices
- **CSS Modules**: Use component-specific CSS files
- **Responsive Design**: Ensure mobile-first approach
- **Consistent Theming**: Use CSS variables for colors and spacing
- **Accessibility**: Maintain proper contrast and keyboard navigation

### Data Loading Best Practices
- **Use Promise-based API**: Prefer `await loadCSV(filePath)` for new code
- **Error Handling**: Always wrap data loading in try-catch blocks
- **Loading States**: Implement loading indicators for better UX
- **State Management**: Use appropriate state for loading, data, and error states

---

**Last Updated**: December 2024
**Version**: 2.0.0
**Data Loading System**: dataLoader.js v2.0
