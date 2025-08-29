/**
 * Chart Constants
 *
 * Centralized configuration for all chart components including margins, dimensions,
 * spacing, and chart-specific settings. This improves maintainability and consistency
 * across all chart visualizations.
 */

// ============================================================================
// CHART MARGINS
// ============================================================================

export const CHART_MARGINS = {
  // Standard chart margins
  STANDARD: { top: 40, right: 20, bottom: 40, left: 40 },

  // Wide margins for charts with legends on the right
  WIDE_RIGHT: { top: 40, right: 200, left: 120, bottom: 120 },

  // Balanced margins for 3D charts with natural overlap
  BALANCED_3D: { top: 45, right: 45, bottom: 45, left: 80 },

  // Compact margins for network charts
  COMPACT: { top: 20, right: 20, bottom: 20, left: 20 },

  // Milestone chart specific margins
  MILESTONE: { top: 40, right: 250, bottom: 80, left: 120 },

  // Timeline chart specific margins
  TIMELINE: { top: 40, right: 250, bottom: 80, left: 120 },
};

// ============================================================================
// CHART DIMENSIONS & SPACING
// ============================================================================

export const CHART_DIMENSIONS = {
  // Default chart dimensions
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 400,

  // Portfolio node dimensions
  PORTFOLIO: {
    WIDTH: 120,
    HEIGHT: 40,
    SPACING: 15,
  },

  // Program node dimensions
  PROGRAM: {
    WIDTH: 120,
    HEIGHT: 35,
    SPACING: 12,
  },

  // Project node dimensions
  PROJECT: {
    WIDTH: 120,
    HEIGHT: 30,
    SPACING: 8,
  },

  // Chart container padding
  CONTAINER_PADDING: 60,
};

// ============================================================================
// CHART COLORS & STYLING
// ============================================================================

export const CHART_COLORS = {
  // Node colors by type
  NODE: {
    PORTFOLIO: '#3b82f6',
    PROGRAM: '#10b981',
    PROJECT: '#f59e0b',
  },

  // Link colors
  LINK: {
    DEFAULT: '#94a3b8',
    HOVER: '#64748b',
    SELECTED: '#3b82f6',
  },

  // Background colors
  BACKGROUND: {
    CHART: '#ffffff',
    CONTAINER: '#f8fafc',
    LEGEND: '#ffffff',
  },
};

// ============================================================================
// CHART ANIMATION & INTERACTION
// ============================================================================

export const CHART_ANIMATION = {
  // Animation durations (in milliseconds)
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },

  // Hover effects
  HOVER: {
    SCALE: 1.1,
    OPACITY: 0.8,
  },

  // Zoom limits
  ZOOM: {
    MIN: 0.5,
    MAX: 3.0,
  },
};

// ============================================================================
// CHART TOOLTIPS
// ============================================================================

export const CHART_TOOLTIPS = {
  // Tooltip styling
  STYLE: {
    MIN_WIDTH: 200,
    PADDING: 12,
    FONT_SIZE: 14,
    BORDER_RADIUS: 8,
    SHADOW: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },

  // Tooltip positioning
  POSITION: {
    OFFSET_X: 10,
    OFFSET_Y: 10,
  },
};

// ============================================================================
// CHART LEGENDS
// ============================================================================

export const CHART_LEGENDS = {
  // Legend positioning
  POSITION: {
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left',
  },

  // Legend styling
  STYLE: {
    PADDING: 16,
    ITEM_SPACING: 8,
    FONT_SIZE: 12,
  },
};
