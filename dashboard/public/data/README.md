# Portfolio Dashboard Data Files

This directory contains all the CSV data files used by the Portfolio Dashboard application.

## Data Files Overview

### 1. demo.csv (Main Project Data)
**Primary data source for all dashboard components**
- **Fields**: Portfolio, Program, Department, Project, BPM_ID, Project_Manager, G0, G5_Previous, G5_Current, Other_Detail, Status, Budget, Spent, BudgetStatus, FundingSource, RDCategory, Milestone_Phase, ROI_Percentage, Cost_Variance, Timeline_Variance, Resource_Allocation, Innovation_Score, Risk_Level, Market_Impact
- **Update Frequency**: Weekly
- **Usage**: All dashboard components (Dashboard, DepartmentDashboard, DependencyGraph, BudgetFinance, AdvancedCharts)

### 2. budget-statuses.csv (Budget Status Definitions)
**Replaces hardcoded budget statuses in BudgetFinance component**
- **Fields**: Status, Description, Color, Priority
- **Update Frequency**: Monthly
- **Usage**: BudgetFinance component for budget status filtering and visualization

### 3. rd-categories.csv (R&D Category Definitions)
**Replaces hardcoded R&D categories in BudgetFinance component**
- **Fields**: Category, Description, Type, Complexity, Average_Duration_Months
- **Update Frequency**: Monthly
- **Usage**: BudgetFinance component for R&D category filtering and analysis

### 4. status-colors.csv (Project Status Definitions)
**Replaces hardcoded status colors in BudgetFinance component**
- **Fields**: Status, Color, Description, Priority_Level
- **Update Frequency**: Monthly
- **Usage**: BudgetFinance component for status-based filtering and color coding

### 5. milestone-phases.csv (Project Milestone Definitions)
**Replaces hardcoded milestone phases in BudgetFinance component**
- **Fields**: Phase, Description, Duration_Months, Success_Rate, Cost_Multiplier
- **Update Frequency**: Monthly
- **Usage**: BudgetFinance component for milestone-based analysis and charts

### 6. time-periods.csv (Time Period Definitions)
**Replaces hardcoded month arrays in AdvancedCharts component**
- **Fields**: Period, Abbreviation, Full_Name, Quarter, Season
- **Update Frequency**: Quarterly
- **Usage**: AdvancedCharts component for time-based visualizations

### 7. data-config.csv (Data Configuration)
**Master configuration file for all data sources**
- **Fields**: Data_File, Component, Description, Fields, Update_Frequency
- **Update Frequency**: As needed
- **Usage**: Documentation and data management reference

## Data Update Process

1. **Weekly Updates**: Update `demo.csv` with latest project data
2. **Monthly Updates**: Update configuration files (budget-statuses, rd-categories, status-colors, milestone-phases)
3. **Quarterly Updates**: Update time-periods.csv if needed
4. **Validation**: Ensure all CSV files maintain consistent structure and data types

## CSV Format Requirements

- **Headers**: First row must contain field names
- **Encoding**: UTF-8
- **Delimiter**: Comma (,)
- **Quotes**: Use double quotes for fields containing commas
- **Date Format**: YYYY-MM-DD for date fields
- **Number Format**: Use decimal point (.) for decimal numbers

## Adding New Data Sources

1. Create new CSV file in this directory
2. Update `data-config.csv` with new file information
3. Modify relevant component to load data from new CSV file
4. Update this README with new file documentation

## Data Validation

Before updating any CSV file, ensure:
- All required fields are present
- Data types are consistent
- No duplicate entries exist (where applicable)
- Date formats are valid
- Numeric values are properly formatted
