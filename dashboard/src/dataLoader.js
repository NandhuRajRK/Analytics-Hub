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
 * - Both Promise-based and callback-based data delivery
 */

import Papa from 'papaparse';

/**
 * Promise-based CSV loading function
 * Completely isolated from callback context
 */
async function loadCSVPromise(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            resolve(results.data);
          }
        },
        error: (err) => reject(new Error(`CSV parsing error: ${err.message}`)),
      });
    });
  } catch (error) {
    console.error(`Error loading CSV file ${filePath}:`, error);
    return [];
  }
}

/**
 * Loads and parses a CSV file from the public directory
 *
 * This function fetches a CSV file from the specified path, parses it using
 * PapaParse, and delivers the parsed data through a callback function or Promise.
 *
 * @param {string} filePath - Path to the CSV file (relative to public directory)
 * @param {Function} [callback] - Optional function to receive the parsed data
 * @returns {Promise|undefined} - Returns Promise if no callback provided, undefined if callback provided
 *
 * @example
 * // Promise-based usage
 * const data = await loadCSV('/data/demo.csv');
 * console.log('Loaded projects:', data.length);
 *
 * @example
 * // Callback-based usage
 * loadCSV('/data/budget-statuses.csv', (data) => {
 *   console.log('Budget statuses:', data);
 *   setBudgetStatuses(data);
 * });
 */
export function loadCSV(filePath, callback) {
  // If no callback provided, return Promise
  if (typeof callback !== 'function') {
    return loadCSVPromise(filePath);
  }
  
  // Callback-based usage
  loadCSVPromise(filePath)
    .then(data => {
      callback(data);
    })
    .catch(error => {
      console.error(`Error loading CSV file ${filePath}:`, error);
      callback([]);
    });
}

/**
 * Loads multiple CSV files and combines the results
 *
 * This utility function loads multiple CSV files in parallel and
 * combines the results into a single callback or Promise when all are loaded.
 *
 * @param {Array} filePaths - Array of CSV file paths to load
 * @param {Function} [callback] - Optional function to receive all loaded data
 * @returns {Promise|undefined} - Returns Promise if no callback provided, undefined if callback provided
 *
 * @example
 * // Promise-based usage
 * const allData = await loadMultipleCSVs([
 *   '/data/demo.csv',
 *   '/data/budget-statuses.csv',
 *   '/data/status-colors.csv'
 * ]);
 *
 * @example
 * // Callback-based usage
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
  const promises = filePaths.map(filePath => loadCSVPromise(filePath));
  
  // If no callback provided, return Promise
  if (typeof callback !== 'function') {
    return Promise.all(promises)
      .then(results => {
        const combinedData = {};
        filePaths.forEach((filePath, index) => {
          combinedData[filePath] = results[index];
        });
        return combinedData;
      })
      .catch(error => {
        console.error('Error loading multiple CSV files:', error);
        return {};
      });
  }
  
  // Callback-based usage
  Promise.all(promises)
    .then(results => {
      const combinedData = {};
      filePaths.forEach((filePath, index) => {
        combinedData[filePath] = results[index];
      });
      callback(combinedData);
    })
    .catch(error => {
      console.error('Error loading multiple CSV files:', error);
      callback({});
    });
}
