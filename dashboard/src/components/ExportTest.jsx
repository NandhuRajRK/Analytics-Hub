import React, { useRef, useEffect, useState } from 'react';

import ExportDropdown from './ExportDropdown';

const ExportTest = () => {
  const testDivRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Create a simple test chart
    if (testDivRef.current) {
      testDivRef.current.innerHTML = `
        <div style="padding: 20px; background: white; border: 2px solid #3b82f6; border-radius: 8px; min-width: 400px; min-height: 200px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0;">Test Chart for Export</h3>
          <div style="display: flex; gap: 20px; align-items: center;">
            <div style="width: 100px; height: 60px; background: linear-gradient(45deg, #3b82f6, #8b5cf6); border-radius: 6px;"></div>
            <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #10b981, #059669); border-radius: 50%;"></div>
            <div style="width: 120px; height: 40px; background: linear-gradient(45deg, #f59e0b, #d97706); border-radius: 4px;"></div>
          </div>
          <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">
            This is a test chart to verify export functionality works correctly.
          </p>
        </div>
      `;
    }
  }, []);

  const checkElementStatus = () => {
    const element = testDivRef.current;

    if (element) {
      const info = {
        exists: !!element,
        inDOM: document.contains(element),
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        children: element.children.length,
        textContent: element.textContent.trim().length,
        innerHTML: element.innerHTML.length,
      };

      setDebugInfo(JSON.stringify(info, null, 2));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Export Functionality Test</h2>
      <p>This component tests the export functionality with a simple chart element.</p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Chart:</h3>
        <div ref={testDivRef} style={{ marginBottom: '20px' }}></div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
          <span>Export this chart:</span>
          <ExportDropdown
            element={testDivRef}
            filename="Test_Chart"
          />
        </div>

        <button
          onClick={checkElementStatus}
          style={{
            padding: '8px 16px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Check Element Status
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test with DOM selector:</h3>
        <div id="test-dom-element" style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '15px',
          minWidth: '300px',
          minHeight: '150px',
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#92400e' }}>DOM Element Test</h4>
          <p style={{ margin: 0, color: '#78350f' }}>This element uses a DOM selector for export testing.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span>Export this element:</span>
          <ExportDropdown
            element={() => document.getElementById('test-dom-element')}
            filename="Test_DOM_Element"
          />
        </div>
      </div>

      {debugInfo && (
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Element Debug Info:</h4>
          {debugInfo}
        </div>
      )}

      <div style={{
        padding: '15px',
        background: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#374151',
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Export Instructions:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Click the Export button above either chart</li>
          <li>Select your preferred export format (PDF, Word/HTML, PNG, JPEG, or SVG)</li>
          <li>Check the browser console for debugging information</li>
          <li>Use "Check Element Status" to see element properties</li>
          <li>Verify that the export completes successfully</li>
        </ol>
      </div>
    </div>
  );
};

export default ExportTest;
