/**
 * Custom Hook for Portfolio Data Management
 * 
 * Centralizes portfolio data state, filtering, and operations.
 * Improves component reusability and separates concerns.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadCSV } from '../dataLoader';
import { calculateDateRange } from '../utils/dateUtils';

/**
 * Custom hook for managing portfolio data and filtering
 * 
 * @param {string} csvPath - Path to the CSV data file
 * @returns {Object} Portfolio data state and operations
 */
export function usePortfolioData(csvPath = '/data/demo.csv') {
  // Core data state - initialize with empty array instead of null
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedPortfolio, setSelectedPortfolio] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [timelineFormat, setTimelineFormat] = useState('months');
  
  // UI state
  const [expanded, setExpanded] = useState({});
  
  /**
   * Load CSV data from the specified path
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      loadCSV(csvPath, (csvData) => {
        if (csvData && csvData.length > 0) {
          setData(csvData);
        } else {
          setData([]); // Set empty array instead of leaving as null
          setError('No data found in CSV file');
        }
        setLoading(false);
      });
    } catch (err) {
      setError(`Error loading data: ${err.message}`);
      setData([]); // Ensure data is always an array
      setLoading(false);
    }
  }, [csvPath]);
  
  /**
   * Load data on component mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  /**
   * Group projects by Portfolio > Program > Projects hierarchy
   */
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return {};
    
    const portfolios = {};
    data.forEach(project => {
      // Create portfolio level if it doesn't exist
      if (!portfolios[project.Portfolio]) {
        portfolios[project.Portfolio] = {};
      }
      
      // Create program level if it doesn't exist
      if (!portfolios[project.Portfolio][project.Program]) {
        portfolios[project.Portfolio][project.Program] = [];
      }
      
      // Add project to the appropriate program
      portfolios[project.Portfolio][project.Program].push(project);
    });
    
    return portfolios;
  }, [data]);
  
  /**
   * Get unique portfolio names for filtering
   */
  const portfolioNames = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map(p => p.Portfolio))].sort();
  }, [data]);
  
  /**
   * Get unique program names for filtering
   */
  const programNames = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map(p => p.Program))].sort();
  }, [data]);
  
  /**
   * Get unique status values for filtering
   */
  const statusValues = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...new Set(data.map(p => p.Status))].filter(Boolean).sort();
  }, [data]);
  
  /**
   * Apply all filters to the data
   */
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(project => {
      // Portfolio filter
      if (selectedPortfolio !== 'All' && project.Portfolio !== selectedPortfolio) {
        return false;
      }
      
      // Program filter
      if (selectedProgram !== 'All' && project.Program !== selectedProgram) {
        return false;
      }
      
      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.Status)) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const projectText = [
          project.Project,
          project.BPM_ID,
          project.Project_Manager,
          project.Other_Detail
        ].join(' ').toLowerCase();
        
        if (!projectText.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, selectedPortfolio, selectedProgram, selectedStatuses, searchTerm]);
  
  /**
   * Calculate date range for Gantt chart
   */
  const dateRange = useMemo(() => {
    return calculateDateRange(data, filteredData);
  }, [data, filteredData]);
  
  /**
   * Reset all filters to default values
   */
  const resetFilters = useCallback(() => {
    setSelectedPortfolio('All');
    setSelectedProgram('All');
    setSearchTerm('');
    setSelectedStatuses([]);
  }, []);
  
  /**
   * Toggle expanded state for portfolio/program rows
   */
  const toggleExpanded = useCallback((key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);
  
  /**
   * Check if a specific key is expanded
   */
  const isExpanded = useCallback((key) => {
    return expanded[key] || false;
  }, [expanded]);
  
  /**
   * Refresh data by reloading from CSV
   */
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);
  
  return {
    // Data state
    data,
    loading,
    error,
    
    // Filter state
    selectedPortfolio,
    setSelectedPortfolio,
    selectedProgram,
    setSelectedProgram,
    searchTerm,
    setSearchTerm,
    selectedStatuses,
    setSelectedStatuses,
    timelineFormat,
    setTimelineFormat,
    
    // Computed values
    groupedData,
    portfolioNames,
    programNames,
    statusValues,
    filteredData,
    dateRange,
    
    // UI state
    expanded,
    isExpanded,
    toggleExpanded,
    
    // Actions
    resetFilters,
    refreshData,
    loadData,
  };
}
