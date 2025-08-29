# Development Guidelines - Portfolio Dashboard

This document outlines the coding standards, best practices, and development workflow for the Portfolio Dashboard project.

## 🎯 **Code Quality Standards**

### **1. Code Organization**
- **File Structure**: Organize code into logical directories (`components/`, `utils/`, `hooks/`, `constants/`)
- **Naming Conventions**: Use PascalCase for components, camelCase for functions/variables
- **File Naming**: Component files should match component names exactly
- **Import Order**: Group imports by type (React, third-party, internal)

### **2. Component Structure**
```jsx
/**
 * Component description
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 * @returns {JSX.Element} Rendered component
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Constants and utilities
import { STATUS_COLORS } from '../constants/dashboardConstants';
import { formatDate } from '../utils/dateUtils';

// Styles
import './ComponentName.css';

function ComponentName({ title, children }) {
  // State declarations
  const [isOpen, setIsOpen] = useState(false);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Event handlers
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  
  // Render
  return (
    <div className="component-name">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// PropTypes for type checking
ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

ComponentName.defaultProps = {
  children: null,
};

export default ComponentName;
```

### **3. State Management**
- **Local State**: Use `useState` for component-specific state
- **Shared State**: Use custom hooks for reusable state logic
- **Complex State**: Consider `useReducer` for complex state transitions
- **State Updates**: Always use functional updates for state that depends on previous values

### **4. Performance Optimization**
- **Memoization**: Use `useMemo` for expensive calculations
- **Callback Memoization**: Use `useCallback` for functions passed as props
- **Component Memoization**: Use `React.memo` for components that don't need frequent re-renders
- **Lazy Loading**: Implement lazy loading for large components or data

## 📊 **Data Loading Best Practices**

### **1. Using the Data Loader System**
The project uses a robust data loading system (`dataLoader.js`) that provides both Promise-based and callback-based APIs.

#### **Promise-based API (Recommended for new code)**
```javascript
import { loadCSV, loadMultipleCSVs } from '../dataLoader';

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Single file loading
        const projectData = await loadCSV('/data/demo.csv');
        setData(projectData);
        
        // Multiple files loading
        const allData = await loadMultipleCSVs([
          '/data/demo.csv',
          '/data/budget-statuses.csv',
          '/data/status-colors.csv'
        ]);
        
        // Process combined data
        setData(allData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Component rendering logic...
}
```

#### **Callback-based API (Legacy support)**
```javascript
import { loadCSV } from '../dataLoader';

function LegacyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadCSV('/data/demo.csv', (csvData) => {
      setData(csvData);
    });
  }, []);

  // Component rendering logic...
}
```

### **2. Error Handling Patterns**
Always implement proper error handling for data loading operations:

```javascript
// Good: Comprehensive error handling
const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const data = await loadCSV('/data/example.csv');
    
    if (data && Array.isArray(data) && data.length > 0) {
      setData(data);
    } else {
      setError('No data found in file');
    }
    
  } catch (err) {
    console.error('Error loading data:', err);
    setError(err.message || 'Failed to load data');
  } finally {
    setLoading(false);
  }
};

// Avoid: No error handling
const loadData = async () => {
  const data = await loadCSV('/data/example.csv'); // ❌ No error handling
  setData(data);
};
```

### **3. Loading State Management**
Implement proper loading states for better user experience:

```javascript
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Loading state
  if (loading) {
    return <div className="loading-spinner">Loading data...</div>;
  }

  // Error state
  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // No data state
  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  // Success state
  return (
    <div className="data-display">
      {/* Render your data */}
    </div>
  );
}
```

### **4. Data Validation**
Always validate loaded data before using it:

```javascript
const validateData = (data) => {
  if (!data || !Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  
  if (data.length === 0) {
    throw new Error('Data array is empty');
  }
  
  // Validate required fields
  const requiredFields = ['id', 'name', 'status'];
  const firstItem = data[0];
  
  for (const field of requiredFields) {
    if (!(field in firstItem)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  return data;
};

// Usage
const loadData = async () => {
  try {
    const rawData = await loadCSV('/data/example.csv');
    const validatedData = validateData(rawData);
    setData(validatedData);
  } catch (err) {
    setError(err.message);
  }
};
```

### **5. Performance Considerations**
- **Lazy Loading**: Load data only when components mount
- **Parallel Loading**: Use `loadMultipleCSVs` for multiple files
- **Caching**: Leverage browser caching for static CSV files
- **Memory Management**: Clean up data when components unmount

```javascript
useEffect(() => {
  let isMounted = true;
  
  const loadData = async () => {
    try {
      const data = await loadCSV('/data/example.csv');
      
      // Only update state if component is still mounted
      if (isMounted) {
        setData(data);
      }
    } catch (err) {
      if (isMounted) {
        setError(err.message);
      }
    }
  };

  loadData();

  // Cleanup function
  return () => {
    isMounted = false;
  };
}, []);
```

## 🛠 **Development Tools**

### **1. Code Quality Tools**
```bash
# Install development dependencies
npm install

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Run all quality checks
npm run quality

# Fix all quality issues
npm run quality:fix
```

### **2. ESLint Rules**
- **React**: Enforces React best practices and hooks rules
- **Accessibility**: Ensures proper ARIA attributes and keyboard navigation
- **Import/Export**: Maintains clean import/export structure
- **Code Style**: Enforces consistent code formatting

### **3. Prettier Configuration**
- **Line Length**: Maximum 100 characters
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always required
- **Trailing Commas**: ES5 compatible

## 📁 **Project Structure**

```
dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx
│   │   ├── SidebarMenu.jsx
│   │   ├── DevOpsAnalytics.jsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── usePortfolioData.js
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── dateUtils.js
│   │   └── ...
│   ├── constants/          # Application constants
│   │   ├── dashboardConstants.js
│   │   └── ...
│   ├── dataLoader.js       # CSV data loading system
│   └── App.js              # Main application
├── public/
│   └── data/               # CSV data files
│       ├── demo.csv
│       ├── devops-metrics.csv
│       ├── budget-statuses.csv
│       └── ...
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
└── package.json           # Dependencies and scripts
```

## 🔧 **Best Practices**

### **1. Error Handling**
- **Error Boundaries**: Wrap components in error boundaries for graceful error handling
- **Try-Catch**: Use try-catch blocks for async operations, especially data loading
- **User Feedback**: Provide clear error messages to users
- **Fallbacks**: Implement fallback UI for error states

### **2. Accessibility**
- **ARIA Labels**: Use proper ARIA attributes for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain sufficient color contrast ratios
- **Semantic HTML**: Use appropriate HTML elements for their intended purpose

### **3. Testing**
- **Unit Tests**: Write tests for utility functions and hooks
- **Component Tests**: Test component rendering and interactions
- **Integration Tests**: Test component interactions and data flow
- **Accessibility Tests**: Use tools like axe-core for accessibility testing

### **4. Performance**
- **Bundle Size**: Monitor and optimize bundle size
- **Code Splitting**: Implement lazy loading for routes and components
- **Image Optimization**: Use appropriate image formats and sizes
- **Caching**: Implement proper caching strategies

## 📝 **Code Review Checklist**

### **Before Submitting Code**
- [ ] Code follows project structure and naming conventions
- [ ] All ESLint rules pass (`npm run lint`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] Components have proper PropTypes or TypeScript types
- [ ] Error handling is implemented where appropriate
- [ ] Data loading uses proper error handling and loading states
- [ ] Accessibility considerations are addressed
- [ ] Performance implications are considered
- [ ] Tests are written for new functionality
- [ ] Documentation is updated if needed

### **During Code Review**
- [ ] Code is readable and well-documented
- [ ] Logic is clear and efficient
- [ ] Error cases are handled appropriately
- [ ] Data loading follows established patterns
- [ ] Security considerations are addressed
- [ ] Performance impact is acceptable
- [ ] Accessibility requirements are met

## 🚀 **Deployment Checklist**

### **Production Build**
- [ ] All tests pass
- [ ] Code quality checks pass
- [ ] Bundle size is optimized
- [ ] Environment variables are properly configured
- [ ] Error tracking is configured
- [ ] Performance monitoring is set up

### **Post-Deployment**
- [ ] Monitor error rates and performance metrics
- [ ] Verify all features work as expected
- [ ] Check accessibility compliance
- [ ] Monitor user feedback and issues

## 📚 **Resources**

### **Documentation**
- [React Documentation](https://reactjs.org/docs/)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

### **Tools**
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [ESLint Playground](https://eslint.org/demo/)
- [Prettier Playground](https://prettier.io/playground/)

### **Data Loading Resources**
- [PapaParse Documentation](https://www.papaparse.com/)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promise Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

---

**Remember**: These guidelines are living documents. Update them as the project evolves and new best practices emerge.
