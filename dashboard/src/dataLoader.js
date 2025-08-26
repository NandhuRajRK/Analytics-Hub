/**
 * Data Loader Module
 * 
 * This module handles loading and parsing CSV data files for the portfolio dashboard.
 * It uses PapaParse library for robust CSV parsing with automatic header detection
 * and empty line filtering.
 * 
 * Features:
 * - Asynchronous CSV loading from public directory
 * - Automatic header detection and parsing
 * - Empty line filtering for clean data
 * - Error handling for file loading issues
 * - Callback-based data delivery
 */

import Papa from 'papaparse';

/**
 * Loads and parses a CSV file from the public directory
 * 
 * This function fetches a CSV file from the specified path, parses it using
 * PapaParse, and delivers the parsed data through a callback function.
 * 
 * @param {string} filePath - Path to the CSV file (relative to public directory)
 * @param {Function} callback - Function to receive the parsed data
 * @param {Array} callback.data - Array of objects representing CSV rows
 * 
 * @example
 * // Load project data
 * loadCSV('/data/demo.csv', (data) => {
 *   console.log('Loaded projects:', data.length);
 *   setProjects(data);
 * });
 * 
 * @example
 * // Load budget data
 * loadCSV('/data/budget-statuses.csv', (data) => {
 *   console.log('Budget statuses:', data);
 *   setBudgetStatuses(data);
 * });
 */
export function loadCSV(filePath, callback) {
  // Fetch the CSV file from the public directory
  fetch(filePath)
    .then(response => {
      // Convert response to text for CSV parsing
      return response.text();
    })
    .then(csvText => {
      // Parse CSV text using PapaParse library
      Papa.parse(csvText, {
        header: true,        // Use first row as headers, convert to object keys
        skipEmptyLines: true, // Filter out empty rows for clean data
        complete: (results) => {
          // Deliver parsed data through callback
          // results.data contains array of objects with header keys
          callback(results.data);
        },
        // Note: PapaParse also provides error handling through 'error' callback
        // and progress tracking through 'step' callback if needed
      });
    })
    .catch(error => {
      // Handle fetch errors (file not found, network issues, etc.)
      console.error(`Error loading CSV file ${filePath}:`, error);
      
      // Provide empty data as fallback to prevent app crashes
      callback([]);
    });
}

/**
 * Loads multiple CSV files and combines the results
 * 
 * This utility function loads multiple CSV files in parallel and
 * combines the results into a single callback when all are loaded.
 * 
 * @param {Array} filePaths - Array of CSV file paths to load
 * @param {Function} callback - Function to receive all loaded data
 * @param {Object} callback.data - Object with file paths as keys and data as values
 * 
 * @example
 * // Load multiple data files
 * loadMultipleCSVs([
 *   '/data/demo.csv',
 *   '/data/budget-statuses.csv',
 *   '/data/status-colors.csv'
 * ], (data) => {
 *   setProjects(data['/data/demo.csv']);
 *   setBudgetStatuses(data['/data/budget-statuses.csv']);
 *   setStatusColors(data['/data/status-colors.csv']);
 * });
 */
export function loadMultipleCSVs(filePaths, callback) {
  const promises = filePaths.map(filePath => 
    new Promise((resolve) => {
      loadCSV(filePath, (data) => {
        resolve({ [filePath]: data });
      });
    })
  );

  Promise.all(promises)
    .then(results => {
      // Combine all results into single object
      const combinedData = results.reduce((acc, result) => {
        return { ...acc, ...result };
      }, {});
      
      callback(combinedData);
    })
    .catch(error => {
      console.error('Error loading multiple CSV files:', error);
      callback({});
    });
} 