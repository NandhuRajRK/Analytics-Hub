# R&D Analytics Hub - Portfolio Dashboard

A comprehensive portfolio management dashboard built with React, featuring advanced analytics, budget tracking, and project visualization capabilities.

## 🚀 Features

### 📊 **Core Dashboard Components**
- **Portfolio Overview**: Hierarchical project organization (Portfolio → Program → Project)
- **Gantt Charts**: Interactive timeline visualization with project status tracking
- **Budget Analysis**: Financial metrics, cost variance, and ROI tracking
- **Department Views**: Department-specific project analytics
- **Dependency Mapping**: Project interdependency visualization

### 📈 **Advanced Analytics**
- **Sankey Diagrams**: Budget flow analysis from portfolio to project level
- **Heatmaps**: Resource allocation and timeline analysis
- **Network Graphs**: Collaboration and dependency networks
- **3D Visualizations**: Multi-dimensional project portfolio views

### 🔧 **Technical Features**
- **CSV Data Integration**: All data sourced from CSV files for easy updates
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar
- **Export Capabilities**: PDF and image export for reports and presentations
- **Real-time Filtering**: Dynamic filtering by portfolio, status, and categories

## 🛠️ Technology Stack

- **Frontend**: React 19, CSS3, D3.js
- **Data Visualization**: D3.js, D3-Sankey, Chart.js
- **Data Format**: CSV (Comma Separated Values)
- **Build Tool**: Create React App
- **Package Manager**: npm

## 📁 Project Structure

```
portfolio-dashboard/
├── dashboard/                 # Main React application
│   ├── public/
│   │   └── data/            # CSV data files
│   │       ├── demo.csv     # Main project data
│   │       ├── budget-statuses.csv
│   │       ├── rd-categories.csv
│   │       ├── status-colors.csv
│   │       ├── milestone-phases.csv
│   │       └── time-periods.csv
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Utility functions
│   │   └── dataLoader.js    # CSV data loading
│   └── package.json
├── Deneb/                    # Power BI Deneb visualizations
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NandhuRajRK/R-D-Analytics-Hub.git
   cd R-D-Analytics-Hub/portfolio-dashboard/dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Data Management

### Adding New Projects
Simply edit the `demo.csv` file in `public/data/` to add new projects:

```csv
Portfolio,Program,Department,Project,BPM_ID,Project_Manager,G0,G5_Previous,G5_Current,Other_Detail,Status,Budget,Spent,BudgetStatus,FundingSource,RDCategory,Milestone_Phase,ROI_Percentage,Cost_Variance,Timeline_Variance,Resource_Allocation,Innovation_Score,Risk_Level,Market_Impact
Portfolio Alpha,Program X,IT,New Project,1038,Manager Name,2025-01-01,2025-04-01,2025-05-01,Project details,On Track,500000,0,Under Budget,Internal,Development,Development,18.5,0,45,Medium,8.5,Low,High
```

### Configuration Files
- **budget-statuses.csv**: Budget status definitions and colors
- **rd-categories.csv**: R&D category definitions
- **status-colors.csv**: Project status definitions
- **milestone-phases.csv**: Project milestone phases
- **time-periods.csv**: Time period definitions

## 🎯 Use Cases

### **R&D Organizations**
- Track research project portfolios
- Monitor budget allocation across programs
- Analyze innovation metrics and ROI

### **Project Management Offices (PMOs)**
- Portfolio-level project oversight
- Resource allocation optimization
- Risk assessment and mitigation

### **Financial Analysts**
- Budget variance analysis
- Cost trend identification
- Investment decision support

## 🔧 Customization

### Adding New Dashboards
1. Create new React component in `src/components/`
2. Add route in `App.js`
3. Update navigation in `SidebarMenu.jsx`

### Modifying Data Structure
1. Update CSV file structure
2. Modify data loading logic in `dataLoader.js`
3. Update component data processing

## 📈 Performance Features

- **Lazy Loading**: Components load on demand
- **Memoization**: Optimized re-rendering with React hooks
- **Responsive Charts**: D3.js visualizations adapt to container size
- **Efficient Data Processing**: CSV parsing optimized for large datasets

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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js Community**: For powerful data visualization libraries
- **React Team**: For the amazing frontend framework
- **CSV Standard**: For simple, portable data format

## 📞 Contact

- **GitHub**: [@NandhuRajRK](https://github.com/NandhuRajRK)
- **Repository**: [R-D-Analytics-Hub](https://github.com/NandhuRajRK/R-D-Analytics-Hub)

---

**Built with ❤️ for the R&D Analytics Community**
