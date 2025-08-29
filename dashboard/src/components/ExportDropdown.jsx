import { useState, useRef, useEffect } from 'react';

import { exportChart, waitForElement } from '../utils/exportUtils';

import './ExportDropdown.css';

const ExportDropdown = ({ element, filename, className = '', disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    if (!element) {
      setExportStatus('Error: No element specified for export');

      return;
    }

    setIsExporting(true);
    setExportStatus(`Exporting to ${format.toUpperCase()}...`);
    setIsOpen(false);

    try {
      // Wait for element to be ready with a shorter timeout
      try {
        await waitForElement(element, 2000); // Reduced timeout to 2 seconds
      } catch (timeoutError) {
        console.warn('Element timeout, but attempting export anyway:', timeoutError.message);
        // Continue with export even if timeout occurs
      }

      // Perform the export
      const result = await exportChart(element, filename, format);

      if (result.success) {
        setExportStatus(`Successfully exported to ${format.toUpperCase()}`);
        // Clear success message after 3 seconds
        setTimeout(() => setExportStatus(''), 3000);
      } else {
        setExportStatus(`Export failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Export failed:', error);

      // Provide more helpful error messages
      let errorMessage = error.message;

      if (error.message.includes('Unable to find element in cloned iframe')) {
        errorMessage = 'Chart capture failed - please ensure the chart is fully loaded and try again';
      } else if (error.message.includes('Screenshot capture failed')) {
        errorMessage = 'Unable to capture chart - please refresh the page and try again';
      } else if (error.message.includes('Element not found')) {
        errorMessage = 'Chart element not found - please ensure you are on the correct page';
      }

      setExportStatus(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    { format: 'pdf', label: 'PDF Document', icon: '📄' },
    { format: 'word', label: 'Word/HTML', icon: '📝' },
    { format: 'png', label: 'PNG Image', icon: '🖼️' },
    { format: 'jpeg', label: 'JPEG Image', icon: '📷' },
    { format: 'svg', label: 'SVG Vector', icon: '🔷' },
  ];

  return (
    <div className={`export-dropdown ${className}`} ref={dropdownRef}>
      <button
        className={`export-dropdown-button ${disabled || isExporting ? 'disabled' : ''}`}
        disabled={disabled || isExporting}
        onClick={() => !disabled && !isExporting && setIsOpen(!isOpen)}
        title={isExporting ? 'Export in progress...' : 'Export chart'}
      >
        {isExporting ? (
          <>
            <span className="loading-spinner"></span>
            Exporting...
          </>
        ) : (
          <>
            <span>📤</span>
            Export
          </>
        )}
        <svg className={`dropdown-arrow ${isOpen ? 'open' : ''}`} fill="none" height="12" viewBox="0 0 24 24" width="12">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        </svg>
      </button>

      {isOpen && (
        <div className="export-dropdown-menu">
          {exportOptions.map((option) => (
            <button
              className="export-option"
              disabled={isExporting}
              key={option.format}
              onClick={() => handleExport(option.format)}
              title={`Export as ${option.label}`}
            >
              <span className="export-icon">{option.icon}</span>
              <span className="export-label">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {exportStatus && (
        <div className={`export-status ${exportStatus.includes('Error') || exportStatus.includes('failed') ? 'error' : 'success'}`}>
          {exportStatus}
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
