# API Documentation - Portfolio Dashboard Backend

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Data Models](#data-models)
5. [Endpoints](#endpoints)
6. [Error Handling](#error-handling)
7. [LLM Integration](#llm-integration)
8. [Frontend Data Loading](#frontend-data-loading)
9. [Examples](#examples)
10. [Rate Limiting](#rate-limiting)
11. [Testing](#testing)

---

## Overview

The Portfolio Dashboard Backend provides a RESTful API for portfolio management, data analysis, and AI-powered insights. Built with FastAPI, it offers real-time portfolio analytics, dependency mapping, and intelligent recommendations through multiple LLM providers.

### Key Features
- **Portfolio Data Management**: CRUD operations for portfolios, programs, and projects
- **AI-Powered Analysis**: LLM integration for intelligent insights
- **Real-time Analytics**: Live portfolio performance metrics
- **Flexible Data Models**: Support for various data structures
- **Multiple LLM Providers**: OpenAI, Ollama, and template-based fallbacks

---

## Base URL

**Development**: `http://localhost:8000`
**Production**: `https://your-domain.com` (configure as needed)

---

## Authentication

Currently, the API operates without authentication for development purposes. For production deployment, consider implementing:

- **API Keys**: Header-based authentication
- **JWT Tokens**: Session-based authentication
- **OAuth 2.0**: Third-party authentication

### Example with API Key (Future Implementation)
```http
Authorization: Bearer your-api-key-here
```

---

## Data Models

### PortfolioData
Represents the complete portfolio structure and data.

```python
class PortfolioData(BaseModel):
    portfolios: List[Dict[str, Any]]      # Portfolio information
    programs: List[Dict[str, Any]]        # Program information
    projects: List[Dict[str, Any]]        # Project details
    budgets: List[Dict[str, Any]]         # Budget information
    timelines: List[Dict[str, Any]]       # Timeline data
    dependencies: List[Dict[str, Any]]    # Dependency relationships
```

**Example**:
```json
{
  "portfolios": [
    {
      "id": "P001",
      "name": "R&D Portfolio",
      "value": 1000000,
      "status": "active"
    }
  ],
  "programs": [
    {
      "id": "PRG001",
      "name": "AI Research",
      "portfolio": "P001",
      "value": 500000
    }
  ],
  "projects": [
    {
      "id": "PRJ001",
      "name": "Machine Learning Platform",
      "portfolio": "P001",
      "program": "PRG001",
      "status": "On Track",
      "value": 250000,
      "start": "2024-01-01",
      "end": "2024-12-31"
    }
  ],
  "budgets": [...],
  "timelines": [...],
  "dependencies": [...]
}
```

### QueryRequest
Represents a user query with portfolio context.

```python
class QueryRequest(BaseModel):
    query: str                           # User's natural language query
    data_context: PortfolioData          # Current portfolio data
    current_view: Optional[str] = "dashboard"  # Current view context
```

**Example**:
```json
{
  "query": "What are the budget risks in my portfolio?",
  "data_context": { /* PortfolioData object */ },
  "current_view": "budget"
}
```

### QueryResponse
Represents the AI-generated response with insights and recommendations.

```python
class QueryResponse(BaseModel):
    response: str                         # Main response text
    insights: List[str]                   # Key insights
    recommendations: List[str]            # Actionable recommendations
    data_summary: Dict[str, Any]         # Summary statistics
    timestamp: str                        # Response timestamp
```

**Example**:
```json
{
  "response": "Based on your portfolio analysis, I've identified several budget risks...",
  "insights": [
    "Total portfolio budget: $1,000,000",
    "3 projects are over budget by 15%",
    "2 programs show declining budget utilization"
  ],
  "recommendations": [
    "Review over-budget projects immediately",
    "Implement budget monitoring alerts",
    "Consider resource reallocation for under-utilized programs"
  ],
  "data_summary": {
    "total_budget": 1000000,
    "portfolio_count": 1,
    "program_count": 3,
    "project_count": 15,
    "status_distribution": {
      "On Track": 10,
      "At Risk": 3,
      "Delayed": 2
    }
  },
  "timestamp": "2024-12-25T10:30:00Z"
}
```

---

## Endpoints

### 1. Health Check

#### GET /
**Purpose**: Basic health check and API status

**Response**: `200 OK`
```json
{
  "message": "Portfolio Dashboard LLM API",
  "status": "running"
}
```

**Use Case**: Verify API is running and accessible

---

### 2. Detailed Health Status

#### GET /health
**Purpose**: Comprehensive system health and configuration status

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-12-25T10:30:00Z",
  "llm_status": {
    "ollama_available": true,
    "openai_available": false,
    "template_system": true
  },
  "data_models": {
    "PortfolioData": "Available",
    "QueryRequest": "Available",
    "QueryResponse": "Available"
  }
}
```

**Response Fields**:
- `status`: Overall system health
- `timestamp`: Current server time
- `llm_status`: Available LLM providers
- `data_models`: Available data models

**Use Case**: System monitoring, debugging, and configuration verification

---

### 3. AI-Powered Portfolio Query

#### POST /api/llm/query
**Purpose**: Process natural language queries about portfolio data using AI

**Request Body**: `QueryRequest` model
```json
{
  "query": "What are the main risks in my portfolio?",
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

**Response**: `200 OK` with `QueryResponse` model
```json
{
  "response": "Based on your portfolio analysis...",
  "insights": [...],
  "recommendations": [...],
  "data_summary": {...},
  "timestamp": "2024-12-25T10:30:00Z"
}
```

**Query Examples**:
- "Show me projects that are behind schedule"
- "What's the budget utilization across portfolios?"
- "Identify critical path dependencies"
- "Which programs have the highest ROI?"
- "Analyze risk factors in my portfolio"

**Use Case**: Natural language portfolio analysis, intelligent insights, and recommendations

---

### 4. Available LLM Models

#### GET /api/models/available
**Purpose**: Get information about available LLM models and their status

**Response**: `200 OK`
```json
{
  "ollama_available": true,
  "openai_available": false,
  "template_system": true,
  "models": {
    "ollama": "llama2:7b",
    "openai": "not_configured",
    "template": "data_analysis_templates"
  }
}
```

**Response Fields**:
- `ollama_available`: Whether Ollama local models are available
- `openai_available`: Whether OpenAI API is configured
- `template_system`: Whether template-based responses are available
- `models`: Specific model information for each provider

**Use Case**: Frontend configuration, model selection, and system status

---

## Frontend Data Loading

The frontend uses a robust data loading system (`dataLoader.js`) that provides both Promise-based and callback-based APIs for loading CSV data files.

### Data Loading Architecture

#### **Promise-based API (Recommended)**
```javascript
// Modern async/await pattern
const devopsData = await loadCSV('/data/devops-metrics.csv');
setData(devopsData);

// Multiple files in parallel
const allData = await loadMultipleCSVs([
  '/data/demo.csv',
  '/data/budget-statuses.csv',
  '/data/status-colors.csv'
]);
```

#### **Callback-based API (Legacy Support)**
```javascript
// Traditional callback pattern
loadCSV('/data/demo.csv', (data) => {
  setProjects(data);
});

// Multiple files with callback
loadMultipleCSVs([
  '/data/demo.csv',
  '/data/budget-statuses.csv'
], (data) => {
  setProjects(data['/data/demo.csv']);
  setBudgetStatuses(data['/data/budget-statuses.csv']);
});
```

### Available Data Files

| File | Purpose | Update Frequency | Fields |
|------|---------|------------------|---------|
| `demo.csv` | Main project portfolio data | Weekly | 25 fields (projects, budgets, timelines) |
| `devops-metrics.csv` | DevOps performance metrics | Daily | 11 fields (deployment, lead time, success rates) |
| `budget-statuses.csv` | Budget status definitions | Monthly | Status codes, colors, descriptions |
| `status-colors.csv` | Project status definitions | Monthly | Status codes, colors, descriptions |
| `rd-categories.csv` | R&D category definitions | Monthly | Categories, descriptions, metadata |
| `milestone-phases.csv` | Project milestone phases | Monthly | Phase definitions, durations |
| `time-periods.csv` | Time period definitions | Quarterly | Periods, date ranges |

### Error Handling

The data loader includes comprehensive error handling:
- **Network errors**: Automatic retry with fallback to empty arrays
- **CSV parsing errors**: Detailed error logging with graceful degradation
- **Missing files**: Graceful fallback to empty data structures
- **Validation**: Automatic data structure validation

### Performance Features

- **Parallel loading**: Multiple CSV files loaded simultaneously
- **Caching**: Browser-level caching for static CSV files
- **Lazy loading**: Data loaded only when components are mounted
- **Memory optimization**: Efficient data structures and cleanup

---

## Error Handling

### HTTP Status Codes

| Status Code | Description | Use Case |
|-------------|-------------|----------|
| `200 OK` | Successful request | All successful operations |
| `400 Bad Request` | Invalid request data | Malformed JSON, missing fields |
| `422 Unprocessable Entity` | Validation error | Invalid data types, constraints |
| `500 Internal Server Error` | Server error | LLM failures, processing errors |

### Error Response Format

```json
{
  "detail": "Error description",
  "error_type": "validation_error",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

### Common Error Scenarios

#### 1. Missing Required Fields
```json
{
  "detail": "field required",
  "loc": ["body", "query"],
  "msg": "field required",
  "type": "value_error.missing"
}
```

#### 2. Invalid Data Types
```json
{
  "detail": "value is not a valid integer",
  "loc": ["body", "data_context", "projects", 0, "value"],
  "msg": "value is not a valid integer",
  "type": "type_error.integer"
}
```

#### 3. LLM Processing Errors
```json
{
  "detail": "Error processing query: LLM service unavailable",
  "error_type": "llm_error",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

#### 4. Frontend Data Loading Errors
```json
{
  "detail": "Error loading CSV file /data/devops-metrics.csv: callback is not a function",
  "error_type": "data_loader_error",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

---

## LLM Integration

### Provider Priority
The system attempts to use LLM providers in the following order:

1. **Ollama (Local)**: Primary choice for cost-effective, offline processing
2. **OpenAI**: Fallback for advanced capabilities when API key is available
3. **Template System**: Final fallback for reliable, rule-based responses

### Ollama Integration
**Model**: `llama2:7b`
**Features**: Local processing, offline capability, cost-effective
**Configuration**: Automatic detection of available models

### OpenAI Integration
**Model**: `gpt-3.5-turbo`
**Features**: Advanced reasoning, consistent quality, cloud-based
**Configuration**: Requires `OPENAI_API_KEY` environment variable

### Template System
**Features**: Rule-based analysis, reliable responses, no external dependencies
**Capabilities**: Budget analysis, status distribution, timeline analysis, dependency mapping

---

## Examples

### Example 1: Budget Analysis Query

**Request**:
```http
POST /api/llm/query
Content-Type: application/json

{
  "query": "Analyze my portfolio budget and identify any risks",
  "data_context": {
    "portfolios": [
      {
        "id": "P001",
        "name": "R&D Portfolio",
        "value": 1000000
      }
    ],
    "projects": [
      {
        "id": "PRJ001",
        "name": "AI Platform",
        "portfolio": "P001",
        "status": "On Track",
        "value": 250000,
        "start": "2024-01-01",
        "end": "2024-12-31"
      }
    ]
  },
  "current_view": "budget"
}
```

**Response**:
```json
{
  "response": "Your R&D Portfolio has a total budget of $1,000,000 with 1 active project...",
  "insights": [
    "Total portfolio budget: $1,000,000",
    "Current project allocation: $250,000 (25%)",
    "Available budget: $750,000 (75%)"
  ],
  "recommendations": [
    "Consider additional project investments to utilize available budget",
    "Monitor project spending to ensure on-budget delivery",
    "Plan for budget allocation in upcoming quarters"
  ],
  "data_summary": {
    "total_budget": 1000000,
    "allocated_budget": 250000,
    "available_budget": 750000,
    "utilization_rate": 0.25
  },
  "timestamp": "2024-12-25T10:30:00Z"
}
```

### Example 2: Project Status Query

**Request**:
```http
POST /api/llm/query
Content-Type: application/json

{
  "query": "Which projects are at risk and why?",
  "data_context": {
    "projects": [
      {
        "id": "PRJ001",
        "name": "AI Platform",
        "status": "At Risk",
        "value": 250000,
        "start": "2024-01-01",
        "end": "2024-12-31"
      },
      {
        "id": "PRJ002",
        "name": "Data Pipeline",
        "status": "On Track",
        "value": 150000,
        "start": "2024-02-01",
        "end": "2024-11-30"
      }
    ]
  }
}
```

**Response**:
```json
{
  "response": "I've analyzed your project portfolio and identified 1 project at risk...",
  "insights": [
    "1 project is currently 'At Risk' (AI Platform)",
    "1 project is 'On Track' (Data Pipeline)",
    "Total project value: $400,000"
  ],
  "recommendations": [
    "Investigate the AI Platform project risks immediately",
    "Review resource allocation for the at-risk project",
    "Implement risk mitigation strategies",
    "Monitor progress more frequently for at-risk projects"
  ],
  "data_summary": {
    "total_projects": 2,
    "at_risk_count": 1,
    "on_track_count": 1,
    "total_value": 400000
  },
  "timestamp": "2024-12-25T10:30:00Z"
}
```

### Example 3: Frontend Data Loading Integration

**Frontend Component**:
```javascript
import { loadCSV } from '../dataLoader';

function DevOpsAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const devopsData = await loadCSV('/data/devops-metrics.csv');
        setData(devopsData);
      } catch (error) {
        console.error('Error loading DevOps data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Component rendering logic...
}
```

**Backend API Call**:
```javascript
// Send loaded data to backend for AI analysis
const analyzeData = async () => {
  const response = await fetch('/api/llm/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "Analyze my DevOps metrics and identify improvement areas",
      data_context: { projects: data },
      current_view: "devops"
    })
  });
  
  const analysis = await response.json();
  // Handle AI analysis results...
};
```

---

## Rate Limiting

**Current Status**: No rate limiting implemented
**Recommendation**: Implement rate limiting for production use

### Suggested Rate Limits
- **General Endpoints**: 100 requests per minute per IP
- **LLM Queries**: 20 requests per minute per IP
- **Health Checks**: 1000 requests per minute per IP

### Implementation Options
- **Token Bucket**: Smooth rate limiting
- **Fixed Window**: Simple time-based limits
- **Sliding Window**: More accurate rate tracking

---

## Testing

### Test Endpoints

#### 1. Health Check Test
```bash
curl -X GET "http://localhost:8000/"
```

#### 2. Health Status Test
```bash
curl -X GET "http://localhost:8000/health"
```

#### 3. LLM Query Test
```bash
curl -X POST "http://localhost:8000/api/llm/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the total portfolio value?",
    "data_context": {
      "portfolios": [{"id": "P001", "name": "Test", "value": 100000}],
      "programs": [],
      "projects": [],
      "budgets": [],
      "timelines": [],
      "dependencies": []
    }
  }'
```

#### 4. Available Models Test
```bash
curl -X GET "http://localhost:8000/api/models/available"
```

### Test Data
Use the provided CSV files in `dashboard/public/data/` for comprehensive testing.

### Performance Testing
- **Response Time**: Target < 2 seconds for LLM queries
- **Throughput**: Test with multiple concurrent requests
- **Memory Usage**: Monitor during extended usage

### Frontend Testing
- **Data Loading**: Test CSV file loading with various file sizes
- **Error Handling**: Test network failures and malformed CSV files
- **Performance**: Test loading multiple CSV files simultaneously
- **Browser Compatibility**: Test across different browsers and devices

---

## Development Notes

### Adding New Endpoints
1. Define data models in `main.py`
2. Add endpoint function with proper error handling
3. Update CORS configuration if needed
4. Add to API documentation
5. Test with frontend integration

### Environment Variables
```bash
# Backend .env file
OPENAI_API_KEY=your_openai_api_key_here
OLLAMA_HOST=http://localhost:11434
LOG_LEVEL=INFO
```

### Logging
The API includes comprehensive logging for:
- Request/response details
- LLM processing steps
- Error conditions
- Performance metrics

### Frontend Integration
- **Data Loading**: Use `loadCSV()` for single files, `loadMultipleCSVs()` for multiple files
- **Error Handling**: Implement try-catch blocks around data loading operations
- **State Management**: Use React state for loading, data, and error states
- **Performance**: Load data only when components mount, implement loading indicators

---

**Last Updated**: December 2024
**Version**: 2.0.0
**API Base**: FastAPI
**Frontend Data Loading**: dataLoader.js v2.0
**Documentation Format**: OpenAPI 3.0 compatible
