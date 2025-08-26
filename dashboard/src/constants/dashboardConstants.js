/**
 * Dashboard Constants
 * 
 * Centralized configuration and constants for the portfolio dashboard.
 * This improves maintainability by avoiding magic numbers and hardcoded values.
 * 
 * NOTE: This file contains core dashboard constants. For specialized constants, see:
 * - chartConstants.js: Chart-specific settings (margins, dimensions, colors)
 * - dataConstants.js: Data formats, statuses, API endpoints
 */

// ============================================================================
// STATUS COLORS
// ============================================================================

export const STATUS_COLORS = {
  ON_TRACK: '#22c55e',      // Green - positive status
  DELAYED: '#ef4444',       // Red - critical status
  COMPLETED: '#3b82f6',     // Blue - neutral/completed status
  AT_RISK: '#f59e42',       // Orange - warning status
  DEFAULT: '#a3a3a3',       // Gray - unknown/undefined status
};

// ============================================================================
// TIMELINE CONFIGURATION
// ============================================================================

export const TIMELINE_CONFIG = {
  // Breakpoints for timeline label filtering (in days)
  LONG_TIMELINE_DAYS: 1000,    // ~3 years - show every 2nd month
  MEDIUM_TIMELINE_DAYS: 500,   // ~1.5 years - show all months
  
  // Future buffer for timeline extension (in months)
  FUTURE_BUFFER_MONTHS: 6,
  
  // Mobile breakpoint for responsive design
  MOBILE_BREAKPOINT: 700,
};

// ============================================================================
// GANTT CHART CONFIGURATION
// ============================================================================

export const GANTT_CONFIG = {
  // Bar heights
  PREVIOUS_BAR_HEIGHT: 6,
  CURRENT_BAR_HEIGHT: 12,
  
  // Z-index values for layering
  Z_INDEX: {
    PREVIOUS_BAR: 1,
    CURRENT_BAR: 2,
    TODAY_LINE: 5,
    TOOLTIP: 10,
  },
  
  // Today line styling
  TODAY_LINE: {
    WIDTH: '3px',
    COLOR: '#dc2626',
    SHADOW: '0 0 4px rgba(220, 38, 38, 0.5)',
  },
};

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  // Hover detection area for collapsed sidebar
  SIDEBAR_HOVER_AREA: 24,
  
  // Tooltip styling
  TOOLTIP: {
    MIN_WIDTH: 220,
    PADDING: 12,
    FONT_SIZE: 14,
    BORDER_RADIUS: 8,
    SHADOW: '0 4px 16px #0001',
  },
  
  // Indentation for nested rows
  INDENTATION: {
    PROGRAM_LEVEL: 24,
    PROJECT_LEVEL: 48,
  },
};

// ============================================================================
// STATUS MAPPING
// ============================================================================

export const STATUS_MAPPING = {
  'on track': STATUS_COLORS.ON_TRACK,
  'delayed': STATUS_COLORS.DELAYED,
  'completed': STATUS_COLORS.COMPLETED,
  'at risk': STATUS_COLORS.AT_RISK,
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  NO_DATA: 'No data available',
  LOADING_ERROR: 'Error loading data',
  INVALID_DATE: 'Invalid date format',
  NETWORK_ERROR: 'Network error occurred',
};

// ============================================================================
// DEBUG CONFIGURATION
// ============================================================================

export const DEBUG_CONFIG = {
  // Enable/disable console logging
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  
  // Log levels
  LOG_LEVELS: {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug',
  },
};
