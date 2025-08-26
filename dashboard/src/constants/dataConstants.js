/**
 * Data Constants
 * 
 * Centralized configuration for data formats, arrays, statuses, and other
 * data-related constants used across the portfolio dashboard.
 */

// ============================================================================
// MONTHS & TIME PERIODS
// ============================================================================

export const TIME_PERIODS = {
  // Month names (abbreviated)
  MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  
  // Month names (full)
  MONTHS_FULL: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  
  // Quarter names
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  
  // Quarter full names
  QUARTERS_FULL: ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'],
  
  // Timeline formats
  FORMATS: {
    MONTHS: 'months',
    QUARTERS: 'quarters',
    YEARS: 'years',
    WEEKS: 'weeks',
  },
};

// ============================================================================
// PROJECT STATUSES
// ============================================================================

export const PROJECT_STATUSES = {
  // Available status values
  VALUES: ['on track', 'delayed', 'completed', 'at risk'],
  
  // Status display names
  DISPLAY_NAMES: {
    'on track': 'On Track',
    'delayed': 'Delayed',
    'completed': 'Completed',
    'at risk': 'At Risk',
  },
  
  // Status categories
  CATEGORIES: {
    POSITIVE: ['on track', 'completed'],
    NEGATIVE: ['delayed', 'at risk'],
    NEUTRAL: ['completed'],
  },
};

// ============================================================================
// BUDGET STATUSES
// ============================================================================

export const BUDGET_STATUSES = {
  // Available budget status values
  VALUES: ['Under Budget', 'On Budget', 'Over Budget', 'At Risk'],
  
  // Budget status colors
  COLORS: {
    'Under Budget': '#22c55e',
    'On Budget': '#3b82f6',
    'Over Budget': '#ef4444',
    'At Risk': '#f59e0b',
  },
  
  // Budget status categories
  CATEGORIES: {
    POSITIVE: ['Under Budget', 'On Budget'],
    NEGATIVE: ['Over Budget', 'At Risk'],
  },
};

// ============================================================================
// DATA FORMATS & VALIDATION
// ============================================================================

export const DATA_FORMATS = {
  // Date formats
  DATE: {
    DISPLAY: 'MMM yyyy',
    INPUT: 'yyyy-MM-dd',
    SHORT: 'MMM dd',
    LONG: 'MMMM dd, yyyy',
  },
  
  // Number formats
  NUMBER: {
    CURRENCY: {
      STYLE: 'currency',
      CURRENCY: 'USD',
      MINIMUM_FRACTION_DIGITS: 0,
      MAXIMUM_FRACTION_DIGITS: 0,
    },
    PERCENTAGE: {
      STYLE: 'percent',
      MINIMUM_FRACTION_DIGITS: 1,
      MAXIMUM_FRACTION_DIGITS: 1,
    },
  },
  
  // File formats
  FILE: {
    CSV: 'csv',
    JSON: 'json',
    EXCEL: 'xlsx',
    PDF: 'pdf',
  },
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  // Base URLs
  BASE: {
    LOCAL: 'http://localhost:8000',
    PRODUCTION: process.env.REACT_APP_API_URL || 'https://api.portfolio-dashboard.com',
  },
  
  // LLM/Query endpoints
  LLM: {
    QUERY: '/api/llm/query',
    CHAT: '/api/llm/chat',
    ANALYZE: '/api/llm/analyze',
  },
  
  // Data endpoints
  DATA: {
    PORTFOLIOS: '/api/data/portfolios',
    PROJECTS: '/api/data/projects',
    EXPORT: '/api/data/export',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
    PREFERENCES: '/api/user/preferences',
  },
};

// ============================================================================
// EXPORT OPTIONS
// ============================================================================

export const EXPORT_OPTIONS = {
  // Available export formats
  FORMATS: {
    PDF: 'pdf',
    PNG: 'png',
    SVG: 'svg',
    CSV: 'csv',
    EXCEL: 'xlsx',
    HTML: 'html',
  },
  
  // Export quality settings
  QUALITY: {
    LOW: 0.7,
    MEDIUM: 0.85,
    HIGH: 1.0,
  },
  
  // Export dimensions
  DIMENSIONS: {
    A4: { width: 210, height: 297 },
    LETTER: { width: 216, height: 279 },
    CUSTOM: { width: 800, height: 600 },
  },
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_VALUES = {
  // Portfolio selection
  PORTFOLIO: 'All',
  PROGRAM: 'All',
  
  // Timeline format
  TIMELINE_FORMAT: 'months',
  
  // Search
  SEARCH_TERM: '',
  
  // Status selection
  SELECTED_STATUSES: [],
  
  // Chart dimensions
  CHART_WIDTH: 800,
  CHART_HEIGHT: 400,
  
  // Future buffer (months)
  FUTURE_BUFFER_MONTHS: 6,
  
  // Time calculations
  MS_PER_DAY: 1000 * 60 * 60 * 24, // Milliseconds per day
};
