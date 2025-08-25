import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Simple screenshot capture function
const captureScreenshot = async (element) => {
  try {
    const domElement = getElement(element);
    if (!domElement) {
      throw new Error('Element not found');
    }

    console.log('Original element for capture:', domElement);

    // Find the best chart element to capture
    const chartElement = findChartElement(domElement);
    if (!chartElement) {
      throw new Error('No chart element found to capture');
    }

    console.log('Target chart element for capture:', chartElement);

    // Wait a bit for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to capture the chart element directly first
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: chartElement.offsetWidth || chartElement.scrollWidth || 800,
        height: chartElement.offsetHeight || chartElement.scrollHeight || 600,
        foreignObjectRendering: false, // Disable foreign object rendering to avoid iframe issues
        removeContainer: true, // Remove temporary containers
        ignoreElements: (element) => {
          // Ignore elements that might cause issues
          return element.classList.contains('export-dropdown') || 
                 element.classList.contains('chart-export-buttons') ||
                 element.classList.contains('export-status');
        }
      });

      console.log('Screenshot captured successfully:', {
        width: canvas.width,
        height: canvas.height
      });

      return canvas;
    } catch (html2canvasError) {
      console.warn('Direct html2canvas failed, trying alternative approach:', html2canvasError.message);
      
      // Alternative approach: create a clone of the chart element
      const clonedElement = chartElement.cloneNode(true);
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.zIndex = '-1';
      clonedElement.style.width = (chartElement.offsetWidth || 800) + 'px';
      clonedElement.style.height = (chartElement.offsetHeight || 600) + 'px';
      
      // Add to DOM temporarily
      document.body.appendChild(clonedElement);
      
      try {
        const canvas = await html2canvas(clonedElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          foreignObjectRendering: false,
          removeContainer: true
        });
        
        // Clean up
        document.body.removeChild(clonedElement);
        
        console.log('Alternative screenshot capture successful:', {
          width: canvas.width,
          height: canvas.height
        });
        
        return canvas;
      } catch (cloneError) {
        // Clean up on failure
        if (document.body.contains(clonedElement)) {
          document.body.removeChild(clonedElement);
        }
        throw cloneError;
      }
    }
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    
    // Last resort: create a simple fallback canvas
    try {
      console.log('Creating fallback canvas for failed screenshot');
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 800;
      fallbackCanvas.height = 600;
      const ctx = fallbackCanvas.getContext('2d');
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 600);
      
      // Add error message
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Chart Export Failed', 400, 250);
      ctx.font = '16px Arial';
      ctx.fillText('Unable to capture chart screenshot', 400, 290);
      ctx.fillText('Please try again or contact support', 400, 320);
      
      return fallbackCanvas;
    } catch (fallbackError) {
      throw new Error(`Failed to capture screenshot: ${error.message}`);
    }
  }
};

// Helper function to get the actual DOM element
const getElement = (element) => {
  if (typeof element === 'string') {
    return document.getElementById(element);
  } else if (typeof element === 'function') {
    try {
      return element();
    } catch (error) {
      console.error('Error calling element function:', error);
      return null;
    }
  } else if (element && element.current) {
    return element.current;
  } else if (element && element.nodeType) {
    return element;
  }
  return null;
};

// Helper function to find the best chart element to capture
const findChartElement = (element) => {
  if (!element) return null;
  
  // If it's already an SVG, use it directly
  if (element.tagName === 'SVG') {
    return element;
  }
  
  // Special handling for dashboard table wrapper
  if (element.classList && element.classList.contains('dashboard-table-wrapper')) {
    // Look for the actual table content
    const tableContent = element.querySelector('.dashboard-table');
    if (tableContent) {
      console.log('Found dashboard table content for capture:', tableContent);
      return tableContent;
    }
    // If no table found, look for any chart content
    const chartContent = element.querySelector('.chart-content, .timeline-content');
    if (chartContent) {
      console.log('Found chart content in dashboard wrapper for capture:', chartContent);
      return chartContent;
    }
  }
  
  // Look for SVG elements within the container
  const svgElement = element.querySelector('svg');
  if (svgElement) {
    console.log('Found SVG element for capture:', svgElement);
    return svgElement;
  }
  
  // Look for canvas elements
  const canvasElement = element.querySelector('canvas');
  if (canvasElement) {
    console.log('Found canvas element for capture:', canvasElement);
    return canvasElement;
  }
  
  // Look for timeline/Gantt chart specific elements
  const timelineElement = element.querySelector('.dashboard-table, .gantt-timeline, .timeline-chart');
  if (timelineElement) {
    console.log('Found timeline element for capture:', timelineElement);
    return timelineElement;
  }
  
  // Look for chart-specific containers
  const chartContainer = element.querySelector('.chart-main, .chart-container, .chart-content');
  if (chartContainer) {
    console.log('Found chart container for capture:', chartContainer);
    return chartContainer;
  }
  
  // Look for table elements (for timeline charts)
  const tableElement = element.querySelector('table');
  if (tableElement) {
    console.log('Found table element for capture:', tableElement);
    return tableElement;
  }
  
  // If no specific chart element found, use the original element
  console.log('Using original element for capture:', element);
  return element;
};

// Export to PDF - Simple screenshot approach
export const exportToPDF = async (element, filename, options = {}) => {
  try {
    const canvas = await captureScreenshot(element);
    
    // Create PDF
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions to fit in PDF
    const pdfWidth = 297; // A4 width in mm
    const pdfHeight = 210; // A4 height in mm
    const imgWidth = pdfWidth - 20; // Leave 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Center the image
    const x = 10;
    const y = Math.max(10, (pdfHeight - imgHeight) / 2);
    
    // Add title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(filename, pdfWidth / 2, 15, { align: 'center' });
    
    // Add image
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exported on: ${new Date().toLocaleString()}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
    
    pdf.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return { success: true, format: 'pdf' };
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error(`Failed to export to PDF: ${error.message}`);
  }
};

// Export to Word/HTML - Simple screenshot approach
export const exportToWord = async (element, filename, options = {}) => {
  try {
    const canvas = await captureScreenshot(element);
    const imgData = canvas.toDataURL('image/png');
    
    // Create HTML document with the screenshot
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${filename}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background-color: #ffffff;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
          }
          .chart-container { 
            text-align: center; 
            margin: 30px 0; 
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
          }
          .chart-image { 
            max-width: 100%; 
            height: auto; 
            border: 1px solid #d1d5db;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .footer { 
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280; 
            font-size: 12px;
          }
          h1 {
            color: #1f2937;
            margin: 0;
            font-size: 24px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${filename}</h1>
        </div>
        
        <div class="chart-container">
          <img src="${imgData}" alt="${filename}" class="chart-image" />
        </div>
        
        <div class="footer">
          Exported on: ${new Date().toLocaleString()}<br>
          Format: HTML Document (compatible with Microsoft Word)
        </div>
      </body>
      </html>
    `;
    
    // Download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, format: 'html' };
  } catch (error) {
    console.error('Word/HTML export failed:', error);
    throw new Error(`Failed to export to Word/HTML: ${error.message}`);
  }
};

// Export to PNG - Simple screenshot approach
export const exportToPNG = async (element, filename, options = {}) => {
  try {
    const canvas = await captureScreenshot(element);
    
    // Download the PNG
    const link = document.createElement('a');
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, format: 'png' };
  } catch (error) {
    console.error('PNG export failed:', error);
    throw new Error(`Failed to export to PNG: ${error.message}`);
  }
};

// Export to JPEG - Simple screenshot approach
export const exportToJPEG = async (element, filename, options = {}) => {
  try {
    const canvas = await captureScreenshot(element);
    
    // Download the JPEG
    const link = document.createElement('a');
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, format: 'jpeg' };
  } catch (error) {
    console.error('JPEG export failed:', error);
    throw new Error(`Failed to export to JPEG: ${error.message}`);
  }
};

// Export to SVG - For SVG elements, export directly; for others, convert to PNG
export const exportToSVG = async (element, filename, options = {}) => {
  try {
    const domElement = getElement(element);
    
    // If it's an SVG element, export it directly
    if (domElement && domElement.tagName === 'SVG') {
      const svgData = new XMLSerializer().serializeToString(domElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      
      const link = document.createElement('a');
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.svg`;
      link.href = URL.createObjectURL(svgBlob);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      return { success: true, format: 'svg' };
    } else {
      // For non-SVG elements, fall back to PNG
      console.log('Element is not SVG, exporting as PNG instead');
      return await exportToPNG(element, filename, options);
    }
  } catch (error) {
    console.error('SVG export failed:', error);
    // Fall back to PNG
    try {
      return await exportToPNG(element, filename, options);
    } catch (pngError) {
      throw new Error(`Failed to export to SVG and fallback PNG: ${error.message}`);
    }
  }
};

// Main export function
export const exportChart = async (element, filename, format, options = {}) => {
  try {
    console.log(`Exporting ${format} for element:`, element);
    
    switch (format.toLowerCase()) {
      case 'pdf':
        return await exportToPDF(element, filename, options);
      case 'word':
      case 'html':
        return await exportToWord(element, filename, options);
      case 'png':
        return await exportToPNG(element, filename, options);
      case 'jpeg':
      case 'jpg':
        return await exportToJPEG(element, filename, options);
      case 'svg':
        return await exportToSVG(element, filename, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error(`Export failed for format ${format}:`, error);
    throw error;
  }
};

// Utility function to check if element is ready for export
export const isElementReady = (element) => {
  const domElement = getElement(element);
  return domElement && document.contains(domElement);
};

// Utility function to wait for element to be ready
export const waitForElement = async (element, timeout = 2000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (isElementReady(element)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // If timeout reached, try to export anyway
  const domElement = getElement(element);
  if (domElement && document.contains(domElement)) {
    console.warn('Element timeout reached, but attempting export anyway');
    return true;
  }
  
  throw new Error('Element not ready for export within timeout period');
};
