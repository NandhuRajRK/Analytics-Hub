# Analytics Hub - Portfolio Dashboard

A comprehensive portfolio management dashboard built with React, featuring advanced analytics, budget tracking, project visualization, and DevOps monitoring capabilities.

## 🚀 Features

### 📊 **Core Dashboard Components**
- **Portfolio Overview**: Hierarchical project organization (Portfolio → Program → Project)
- **Gantt Charts**: Interactive timeline visualization with project status tracking
- **Budget Analysis**: Financial metrics, cost variance, and ROI tracking
- **Department Views**: Department-specific project analytics
- **Dependency Mapping**: Project interdependency visualization
- **DevOps Analytics**: Organizational DevOps portfolio management and agile processes

### 📈 **Advanced Analytics**
- **Sankey Diagrams**: Budget flow analysis from portfolio to project level
- **Heatmaps**: Resource allocation and timeline analysis
- **Network Graphs**: Collaboration and dependency networks
- **3D Visualizations**: Multi-dimensional project portfolio views
- **DevOps Portfolio**: Epic management, team velocity, backlog overview, and sprint planning

### 🔧 **Technical Features**
- **CSV Data Integration**: All data sourced from CSV files for easy updates
- **Robust Data Loading**: Promise-based and callback-based CSV loading APIs
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar
- **Export Capabilities**: PDF and image export for reports and presentations
- **Real-time Filtering**: Dynamic filtering by portfolio, status, and categories
- **AI-Powered Insights**: LLM integration for intelligent portfolio analysis

## 🛠️ Technology Stack

- **Frontend**: React 19, CSS3, D3.js
- **Data Visualization**: D3.js, D3-Sankey, Chart.js
- **Data Format**: CSV (Comma Separated Values)
- **Build Tool**: Create React App
- **Package Manager**: npm
- **Backend**: FastAPI (Python) with LLM integration
- **Data Loading**: Custom dataLoader.js with PapaParse

## 📁 Project Structure

```
portfolio-dashboard/
├── dashboard/                 # Main React application
│   ├── public/
│   │   └── data/            # CSV data files
│   │       ├── demo.csv     # Main project data (36 projects, 25 fields)
│   │       ├── devops-organizational.csv  # DevOps organizational data
│   │       ├── budget-statuses.csv # Budget status definitions
│   │       ├── rd-categories.csv   # R&D category definitions
│   │       ├── status-colors.csv   # Project status definitions
│   │       ├── milestone-phases.csv # Project milestone phases
│   │       └── time-periods.csv    # Time period definitions
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DevOpsAnalytics.jsx
│   │   │   ├── BudgetFinance.jsx
│   │   │   └── ...
│   │   ├── utils/           # Utility functions
│   │   ├── dataLoader.js    # CSV data loading system (v2.0)
│   │   └── App.js
│   └── package.json
├── backend/                  # FastAPI backend with LLM integration
│   ├── main.py              # API endpoints and LLM processing
│   ├── requirements.txt     # Python dependencies
│   └── start_server.py      # Server startup script
├── Deneb/                    # Power BI Deneb visualizations
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.8+ (for backend features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NandhuRajRK/R-D-Analytics-Hub.git
   cd R-D-Analytics-Hub/portfolio-dashboard/dashboard
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies (optional)**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Start the frontend development server**
   ```bash
   cd ../dashboard
   npm start
   ```

5. **Start the backend server (optional)**
   ```bash
   cd ../backend
   python start_server.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Data Management

### Adding New Projects
Simply edit the `demo.csv` file in `public/data/` to add new projects:

```csv
Portfolio,Program,Department,Project,BPM_ID,Project_Manager,G0,G5_Previous,G5_Current,Other_Detail,Status,Budget,Spent,BudgetStatus,FundingSource,RDCategory,Milestone_Phase,ROI_Percentage,Cost_Variance,Timeline_Variance,Resource_Allocation,Innovation_Score,Risk_Level,Market_Impact
Portfolio Alpha,Program X,IT,New Project,1038,Manager Name,2025-01-01,2025-04-01,2025-05-01,Project details,On Track,500000,0,Under Budget,Internal,Development,Development,18.5,0,45,Medium,8.5,Low,High
```

### DevOps Organizational Data
Update `devops-organizational.csv` for weekly DevOps portfolio management:

```csv
Type,ID,Title,Description,Status,Team,Priority,Progress,StoryCount,StoryPoints,CurrentSprint
Epic,EPIC-001,Customer Portal Redesign,Complete redesign of customer-facing portal,Active,Frontend Team,High,65,24,89,Sprint 12
```

### Configuration Files
- **budget-statuses.csv**: Budget status definitions and colors
- **rd-categories.csv**: R&D category definitions
- **status-colors.csv**: Project status definitions
- **milestone-phases.csv**: Project milestone phases
- **time-periods.csv**: Time period definitions

## 🔌 Data Loading System

The dashboard uses a robust data loading system (`dataLoader.js v2.0`) that provides:

### **Promise-based API (Recommended)**
```javascript
import { loadCSV, loadMultipleCSVs } from '../dataLoader';

// Single file loading
const data = await loadCSV('/data/demo.csv');

// Multiple files in parallel
const allData = await loadMultipleCSVs([
  '/data/demo.csv',
  '/data/budget-statuses.csv'
]);
```

### **Callback-based API (Legacy support)**
```javascript
loadCSV('/data/demo.csv', (data) => {
  setProjects(data);
});
```

### **Key Features**
- **Dual API Support**: Both modern Promise-based and legacy callback-based patterns
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Performance**: Parallel loading of multiple files
- **Browser Caching**: Leverages browser caching for static CSV files

## 🎯 Use Cases

### **R&D Organizations**
- Track research project portfolios
- Monitor budget allocation across programs
- Analyze innovation metrics and ROI
- DevOps portfolio management and agile process optimization

### **Project Management Offices (PMOs)**
- Portfolio-level project oversight
- Resource allocation optimization
- Risk assessment and mitigation
- DevOps portfolio oversight and team coordination

### **Financial Analysts**
- Budget variance analysis
- Cost trend identification
- Investment decision support
- DevOps portfolio ROI and resource optimization

### **DevOps Teams**
- Epic management and portfolio oversight
- Team velocity and capacity planning
- Backlog management and sprint coordination
- DevOps maturity assessment and transformation

## 🔧 Customization

### Adding New Dashboards
1. Create new React component in `src/components/`
2. Add route in `App.js`
3. Update navigation in `SidebarMenu.jsx`

### Modifying Data Structure
1. Update CSV file structure
2. Modify data loading logic in `dataLoader.js`
3. Update component data processing

### Adding New Data Sources
1. Place CSV files in `public/data/`
2. Use `loadCSV()` or `loadMultipleCSVs()` in components
3. Implement proper error handling and loading states

## 📈 Performance Features

- **Lazy Loading**: Components load on demand
- **Memoization**: Optimized re-rendering with React hooks
- **Responsive Charts**: D3.js visualizations adapt to container size
- **Efficient Data Processing**: CSV parsing optimized for large datasets
- **Parallel Data Loading**: Multiple CSV files loaded simultaneously
- **Browser Caching**: Static CSV files cached for performance

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

### Deploy to Netlify/Vercel
- Connect your GitHub repository
- Set build command: `npm run build`
- Set publish directory: `build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the established code structure and naming conventions
- Implement proper error handling for data loading operations
- Use Promise-based data loading APIs for new code
- Maintain backward compatibility for existing callback-based code
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js Community**: For powerful data visualization libraries
- **React Team**: For the amazing frontend framework
- **CSV Standard**: For simple, portable data format
- **PapaParse**: For robust CSV parsing capabilities
- **FastAPI**: For high-performance backend API framework

## 📞 Contact

- **GitHub**: [@NandhuRajRK](https://github.com/NandhuRajRK)
- **Repository**: [R-D-Analytics-Hub](https://github.com/NandhuRajRK/R-D-Analytics-Hub)

---

**Built with ❤️ for the R&D Analytics Community**

**Latest Update**: December 2024 - Added DevOps Analytics, Enhanced Data Loading System, and Comprehensive Documentation
