# Portfolio Dashboard - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend Documentation](#backend-documentation)
5. [Data Structure](#data-structure)
6. [API Documentation](#api-documentation)
7. [Component Documentation](#component-documentation)
8. [Setup & Installation](#setup--installation)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)

## Project Overview

The Portfolio Dashboard is a comprehensive web application that provides portfolio management, data visualization, and AI-powered insights for R&D projects. It combines React frontend with FastAPI backend, featuring interactive charts, dependency mapping, and intelligent data analysis.

### Key Features
- **Portfolio Management**: Hierarchical view of portfolios, programs, and projects
- **Data Visualization**: Interactive charts and graphs for project data
- **AI Integration**: LLM-powered insights and recommendations
- **Dependency Mapping**: Visual representation of project dependencies
- **Budget Tracking**: Financial analysis and budget management
- **Export Functionality**: Multiple export formats for reports

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  FastAPI Backend│    │   Data Sources  │
│   (Port 3000)   │◄──►│   (Port 8000)   │◄──►│   (CSV Files)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18, React Router, CSS3
- **Backend**: FastAPI, Python 3.12
- **AI/LLM**: OpenAI API, Ollama (local), LangChain
- **Data**: CSV files, JSON
- **Build Tools**: npm, Create React App

## Frontend Documentation

### Project Structure
```
dashboard/
├── src/
│   ├── components/          # React components
│   ├── data/               # Data files and loaders
│   ├── utils/              # Utility functions
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── public/                 # Static assets
│   ├── data/               # CSV data files
│   └── index.html          # HTML template
└── package.json            # Dependencies and scripts
```

### Core Components

#### 1. App.js - Main Application Component
**Location**: `dashboard/src/App.js`
**Purpose**: Main application entry point and routing

**Key Features**:
- React Router setup with multiple routes
- Responsive sidebar management
- AI panel state management
- Mobile-responsive design

**Routes**:
- `/` - Main Dashboard
- `/departments` - Department Dashboard
- `/dependencies` - Dependency Graph
- `/budget` - Budget & Finance
- `/advanced-charts` - Advanced Visualizations

**State Management**:
```javascript
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
```

#### 2. Dashboard.jsx - Main Dashboard Component
**Location**: `dashboard/src/components/Dashboard.jsx`
**Purpose**: Primary dashboard interface with portfolio overview

**Key Functions**:
- `groupData()`: Groups projects by Portfolio > Program > Projects
- `generateTimelineLabels()`: Creates timeline labels for different formats
- `getStatusColor()`: Returns color codes for project statuses

**Data Processing**:
- CSV data loading and parsing
- Portfolio hierarchy organization
- Timeline generation
- Status color mapping

#### 3. SidebarMenu.jsx - Navigation Component
**Location**: `dashboard/src/components/SidebarMenu.jsx`
**Purpose**: Main navigation sidebar with collapsible functionality

**Features**:
- Collapsible sidebar for mobile responsiveness
- Navigation menu items
- Active route highlighting
- Responsive design breakpoints

#### 4. PortfolioFilter.jsx - Data Filtering
**Location**: `dashboard/src/components/PortfolioFilter.jsx`
**Purpose**: Filter and search portfolio data

**Functionality**:
- Portfolio selection
- Program filtering
- Project search
- Status filtering

#### 5. AISidePanel.jsx - AI Integration
**Location**: `dashboard/src/components/AISidePanel.jsx`
**Purpose**: AI-powered insights and recommendations

**Features**:
- Natural language queries
- Data context analysis
- Intelligent insights
- Actionable recommendations

#### 6. AdvancedCharts.jsx - Data Visualization
**Location**: `dashboard/src/components/AdvancedCharts.jsx`
**Purpose**: Advanced charting and data visualization

**Chart Types**:
- Bar charts
- Line charts
- Pie charts
- Scatter plots
- Heatmaps

#### 7. DependencyGraph.jsx - Project Dependencies
**Location**: `dashboard/src/components/DependencyGraph.jsx`
**Purpose**: Visual representation of project dependencies

**Features**:
- Interactive dependency mapping
- Project relationship visualization
- Critical path analysis
- Dependency impact assessment

#### 8. BudgetFinance.jsx - Financial Management
**Location**: `dashboard/src/components/BudgetFinance.jsx`
**Purpose**: Budget tracking and financial analysis

**Features**:
- Budget overview
- Cost tracking
- Financial reporting
- Budget vs. actual analysis

#### 9. ExportDropdown.jsx - Data Export
**Location**: `dashboard/src/components/ExportDropdown.jsx`
**Purpose**: Export functionality for reports and data

**Export Formats**:
- CSV
- Excel
- PDF
- JSON

### Data Loading System

#### dataLoader.js
**Location**: `dashboard/src/dataLoader.js`
**Purpose**: Centralized data loading and processing

**Functions**:
- `loadCSV()`: Loads and parses CSV files
- Data validation and error handling
- Data transformation utilities

## Backend Documentation

### Project Structure
```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── start_server.py         # Server startup script
└── venv/                  # Virtual environment
```

### Core Components

#### 1. main.py - FastAPI Application
**Location**: `backend/main.py`
**Purpose**: Main backend server with AI/LLM integration

**Key Features**:
- FastAPI application setup
- CORS middleware configuration
- LLM integration (OpenAI, Ollama, Template fallback)
- API endpoints for portfolio queries

**Data Models**:
```python
class PortfolioData(BaseModel):
    portfolios: List[Dict[str, Any]]
    programs: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    budgets: List[Dict[str, Any]]
    timelines: List[Dict[str, Any]]
    dependencies: List[Dict[str, Any]]

class QueryRequest(BaseModel):
    query: str
    data_context: PortfolioData
    current_view: Optional[str] = "dashboard"

class QueryResponse(BaseModel):
    response: str
    insights: List[str]
    recommendations: List[str]
    data_summary: Dict[str, Any]
    timestamp: str
```

**LLM Integration**:
- **Ollama**: Local LLM models (llama2:7b)
- **OpenAI**: GPT-3.5-turbo integration
- **Template System**: Fallback intelligent responses

**API Endpoints**:
- `GET /` - Health check
- `GET /health` - Detailed health status
- `POST /api/llm/query` - AI-powered portfolio queries
- `GET /api/models/available` - Available LLM models

#### 2. Response Generation Systems

**Template-Based Responses**:
- Data analysis and insights
- Budget analysis
- Status distribution analysis
- Timeline analysis
- Dependency analysis

**LLM-Based Responses**:
- OpenAI GPT-3.5-turbo integration
- Structured prompt engineering
- Context-aware responses
- Error handling and fallbacks

**Ollama Integration**:
- Local model inference
- Cost-effective AI processing
- Offline capability
- Custom model support

## Data Structure

### CSV Data Files
**Location**: `dashboard/public/data/`

#### 1. demo.csv - Main Project Data
**Structure**:
- Portfolio: Portfolio identifier
- Program: Program identifier
- Project: Project name/identifier
- Status: Project status (On Track, Delayed, Completed, At Risk)
- Value: Project budget/value
- Start: Project start date
- End: Project end date

#### 2. budget-statuses.csv - Budget Status Information
**Structure**:
- Budget status codes and descriptions
- Financial state indicators

#### 3. milestone-phases.csv - Project Milestones
**Structure**:
- Milestone identifiers
- Phase information
- Timeline data

#### 4. rd-categories.csv - R&D Categories
**Structure**:
- Category classifications
- Research domain information

#### 5. status-colors.csv - Status Color Mapping
**Structure**:
- Status codes
- Color hex values
- Visual representation

#### 6. time-periods.csv - Time Period Definitions
**Structure**:
- Period identifiers
- Time range definitions
- Format specifications

### Data Relationships
```
Portfolio (1) ──► Program (Many)
Program (1) ──► Project (Many)
Project (1) ──► Dependencies (Many)
Project (1) ──► Timeline (1)
Project (1) ──► Budget (1)
```

## API Documentation

### Endpoint: POST /api/llm/query
**Purpose**: AI-powered portfolio analysis and insights

**Request Body**:
```json
{
  "query": "string",
  "data_context": {
    "portfolios": [...],
    "programs": [...],
    "projects": [...],
    "budgets": [...],
    "timelines": [...],
    "dependencies": [...]
  },
  "current_view": "dashboard"
}
```

**Response**:
```json
{
  "response": "string",
  "insights": ["string"],
  "recommendations": ["string"],
  "data_summary": {...},
  "timestamp": "string"
}
```

### Endpoint: GET /health
**Purpose**: System health and status information

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "string",
  "llm_status": {
    "ollama_available": boolean,
    "openai_available": boolean,
    "template_system": boolean
  },
  "data_models": {...}
}
```

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Git

### Frontend Setup
```bash
cd dashboard
npm install
npm start
```

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### Environment Variables
**Backend (.env)**:
```
OPENAI_API_KEY=your_openai_api_key_here
```

**Frontend**: No environment variables required for basic functionality

## Development Workflow

### Adding New Components
1. Create new component file in `dashboard/src/components/`
2. Create corresponding CSS file
3. Import and add to routing in `App.js`
4. Update navigation in `SidebarMenu.jsx`

### Adding New Data Sources
1. Add CSV file to `dashboard/public/data/`
2. Update `dataLoader.js` to load new data
3. Modify components to use new data
4. Update backend models if needed

### Adding New API Endpoints
1. Add new endpoint in `backend/main.py`
2. Update data models if needed
3. Test with frontend integration
4. Update documentation

### Styling Guidelines
- Use CSS modules or component-specific CSS files
- Follow responsive design principles
- Maintain consistent color scheme
- Use CSS variables for theming

## Troubleshooting

### Common Issues

#### Frontend Issues
1. **Port 3000 already in use**
   - Solution: Use `npm start` and accept alternative port
   - Alternative: Kill process using port 3000

2. **Module not found errors**
   - Solution: Run `npm install` to install dependencies
   - Check import paths and file locations

3. **Build errors**
   - Solution: Clear build cache with `npm run build --force`
   - Check for syntax errors in components

#### Backend Issues
1. **Port 8000 already in use**
   - Solution: Kill existing process or change port
   - Alternative: Use `python main.py` with different port

2. **LLM not working**
   - Check API keys and environment variables
   - Verify Ollama installation and models
   - Check network connectivity for OpenAI

3. **Import errors**
   - Activate virtual environment
   - Install requirements: `pip install -r requirements.txt`

#### Data Issues
1. **CSV loading errors**
   - Verify file paths and permissions
   - Check CSV format and encoding
   - Validate data structure

2. **Missing data**
   - Check file locations in `public/data/`
   - Verify dataLoader.js configuration
   - Check browser console for errors

### Performance Optimization
1. **Data loading**: Implement lazy loading for large datasets
2. **Component rendering**: Use React.memo for expensive components
3. **API calls**: Implement caching and request deduplication
4. **Bundle size**: Code splitting and dynamic imports

### Security Considerations
1. **API keys**: Never commit API keys to version control
2. **CORS**: Configure CORS properly for production
3. **Input validation**: Validate all user inputs
4. **Rate limiting**: Implement API rate limiting for production

## Deployment

### Frontend Deployment
1. Build production version: `npm run build`
2. Deploy `build/` folder to web server
3. Configure server for React Router (SPA routing)

### Backend Deployment
1. Install production dependencies
2. Configure environment variables
3. Use production WSGI server (Gunicorn, uWSGI)
4. Set up reverse proxy (Nginx, Apache)

### Environment Configuration
1. Set production environment variables
2. Configure database connections
3. Set up logging and monitoring
4. Configure SSL certificates

## Contributing

### Code Style
- Follow React best practices
- Use consistent naming conventions
- Add JSDoc comments for functions
- Maintain component separation of concerns

### Testing
- Test components individually
- Verify data loading and processing
- Test API endpoints
- Validate user interactions

### Documentation
- Update this documentation for new features
- Document API changes
- Maintain component documentation
- Update setup instructions

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Development Team
