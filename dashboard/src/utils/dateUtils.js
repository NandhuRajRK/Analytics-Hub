/**
 * Date Utility Functions
 * 
 * Centralized date manipulation and formatting utilities for the dashboard.
 * Improves code reusability and maintainability.
 */

import { TIME_PERIODS, DEFAULT_VALUES, TIMELINE_CONFIG } from '../constants';

/**
 * Generates timeline labels for different time formats
 * Supports months, quarters, and years with intelligent spacing
 * 
 * @param {string|Date} start - Start date
 * @param {string|Date} end - End date
 * @param {string} format - Time format: 'months', 'quarters', 'years'
 * @returns {Array} Array of formatted timeline labels
 */
export function generateTimelineLabels(start, end, format) {
  const s = new Date(start);
  const e = new Date(end);
  const labels = [];
  
  switch (format) {
    case TIME_PERIODS.MONTHS:
      labels.push(...generateMonthlyLabels(s, e));
      break;
      
    case TIME_PERIODS.QUARTERS:
      labels.push(...generateQuarterlyLabels(s, e));
      break;
      
    case TIME_PERIODS.YEARS:
      labels.push(...generateYearlyLabels(s, e));
      break;
      
    default:
      labels.push(...generateMonthlyLabels(s, e));
  }
  
  // Apply intelligent filtering for better readability
  return filterTimelineLabels(labels, s, e, format);
}

/**
 * Generates monthly labels (e.g., "Jan 2024", "Feb 2024")
 * 
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Array} Array of monthly labels
 */
function generateMonthlyLabels(start, end) {
  const labels = [];
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    labels.push(`${current.toLocaleString('default', { month: 'short' })} ${current.getFullYear()}`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return labels;
}

/**
 * Generates quarterly labels (e.g., "Q1 2024", "Q2 2024")
 * 
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Array} Array of quarterly labels
 */
function generateQuarterlyLabels(start, end) {
  const labels = [];
  let current = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
  
  while (current <= end) {
    const quarter = Math.floor(current.getMonth() / 3) + 1;
    labels.push(`Q${quarter} ${current.getFullYear()}`);
    current.setMonth(current.getMonth() + 3);
  }
  
  return labels;
}

/**
 * Generates yearly labels (e.g., "2024", "2025")
 * 
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Array} Array of yearly labels
 */
function generateYearlyLabels(start, end) {
  const labels = [];
  let current = new Date(start.getFullYear(), 0, 1);
  
  while (current <= end) {
    labels.push(current.getFullYear().toString());
    current.setFullYear(current.getFullYear() + 1);
  }
  
  return labels;
}

/**
 * Filters timeline labels for better readability
 * Applies intelligent spacing based on timeline length
 * 
 * @param {Array} labels - Array of labels to filter
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @param {string} format - Time format
 * @returns {Array} Filtered array of labels
 */
function filterTimelineLabels(labels, start, end, format) {
  if (format !== TIME_PERIODS.MONTHS) {
    return labels;
  }
  
  const totalDays = (end - start) / DEFAULT_VALUES.MS_PER_DAY;
  const filteredLabels = [];
  
  // Apply filtering based on timeline length
  if (totalDays > TIMELINE_CONFIG.LONG_TIMELINE_DAYS) {
    // Very long timeline: show every 2nd month to avoid crowding
    for (let i = 0; i < labels.length; i += 2) {
      filteredLabels.push(labels[i]);
    }
  } else if (totalDays > TIMELINE_CONFIG.MEDIUM_TIMELINE_DAYS) {
    // Medium timeline: show all months
    filteredLabels.push(...labels);
  } else {
    // Short timeline: show all labels
    filteredLabels.push(...labels);
  }
  
  return filteredLabels;
}

/**
 * Calculates the minimum and maximum dates from project data
 * 
 * @param {Array} projects - Array of project objects
 * @param {Array} filtered - Array of filtered project objects
 * @returns {Object} Object with minDate and maxDate
 */
export function calculateDateRange(projects, filtered = []) {
  // Use filtered data if available, otherwise use all projects
  const dataToUse = filtered.length > 0 ? filtered : projects;
  
  // Safety check - ensure we have valid data
  if (!dataToUse || dataToUse.length === 0) {
    // Return default date range if no data
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), 1);
    return { minDate, maxDate };
  }
  
  // Extract all dates from projects
  const allDates = dataToUse.flatMap(p => [
    p.G0, 
    p.G5_Previous, 
    p.G5_Current
  ]).map(d => new Date(d));
  
  // Filter out invalid dates
  const validDates = allDates.filter(date => 
    date instanceof Date && !isNaN(date)
  );
  
  let minDate, maxDate;
  
  if (validDates.length > 0) {
    minDate = new Date(Math.min(...validDates));
    maxDate = new Date(Math.max(...validDates));
  } else {
    // Fallback to current date range if no valid dates found
    const now = new Date();
    minDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    maxDate = new Date(now.getFullYear() + 1, now.getMonth(), 1);
  }
  
  // Extend timeline to show future time
  const extendedMaxDate = extendTimelineToFuture(maxDate);
  
  return {
    minDate: minDate,
    maxDate: extendedMaxDate > maxDate ? extendedMaxDate : maxDate
  };
}

/**
 * Extends the timeline to show future time beyond today
 * 
 * @param {Date} maxDate - Current maximum date
 * @returns {Date} Extended maximum date
 */
function extendTimelineToFuture(maxDate) {
  const today = new Date();
  const extendedDate = new Date(today);
  extendedDate.setMonth(today.getMonth() + TIMELINE_CONFIG.FUTURE_BUFFER_MONTHS);
  
  return extendedDate;
}

/**
 * Validates if a date string is valid
 * 
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date, false otherwise
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Formats a date for display
 * 
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'iso')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  const dateObj = new Date(date);
  
  if (!isValidDate(dateObj)) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    case 'iso':
      return dateObj.toISOString().split('T')[0];
      
    case 'short':
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
}
