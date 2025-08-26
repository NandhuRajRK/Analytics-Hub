/**
 * Constants Index
 * 
 * Central export point for all constants used throughout the portfolio dashboard.
 * This provides a clean import interface and makes it easy to see all available constants.
 */

// Core dashboard constants
export * from './dashboardConstants';

// Chart-specific constants
export * from './chartConstants';

// Data-related constants
export * from './dataConstants';

// Re-export commonly used constants for convenience
export { 
  STATUS_COLORS, 
  GANTT_CONFIG, 
  UI_CONFIG,
  STATUS_MAPPING 
} from './dashboardConstants';

export { 
  CHART_MARGINS, 
  CHART_DIMENSIONS, 
  CHART_COLORS 
} from './chartConstants';

export { 
  TIME_PERIODS, 
  PROJECT_STATUSES, 
  API_ENDPOINTS,
  DEFAULT_VALUES 
} from './dataConstants';
