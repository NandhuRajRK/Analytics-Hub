/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI instead of crashing the entire application.
 *
 * This is a class component because React requires error boundaries
 * to be class components (hooks cannot be used in error boundaries).
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    
    // Bind methods to ensure proper 'this' context
    this.handleRetry = this.handleRetry.bind(this);
    
    // Track if component is mounted
    this._isMounted = false;
  }

  /**
   * Called when component mounts
   */
  componentDidMount() {
    this._isMounted = true;
  }

  /**
   * Called when component unmounts
   */
  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * Called when an error occurs in any child component
   * Updates state to indicate an error has occurred
   */
  static getDerivedStateFromError(_error) {
    // Return new state to indicate error
    return { hasError: true };
  }

  /**
   * Called after an error occurs
   * Logs error information and updates state
   */
  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, send to error reporting service)
    console.error('Error caught by boundary:', error, errorInfo);

    // Safety check before calling setState
    if (this && this.setState && this._isMounted) {
      this.setState({
        error,
        errorInfo,
      });
    }
  }

  /**
   * Attempts to recover from error by refreshing the component
   */
  handleRetry = () => {
    // Safety check to ensure component is still mounted
    if (this && this.setState && this._isMounted) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    } else {
      // Fallback: reload the page if component is unmounted
      console.warn('Component unmounted, reloading page');
      window.location.reload();
    }
  }

  /**
   * Renders fallback UI when an error occurs
   */
  render() {
    try {
      if (this.state.hasError) {
        return (
          <div className="error-boundary">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h2>Something went wrong</h2>
              <p>
                We encountered an unexpected error while loading this component.
                This helps us identify and fix issues to improve your experience.
              </p>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-details">
                  <summary>Error Details (Development)</summary>
                  <pre className="error-stack">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="error-actions">
                <button
                  onClick={this.handleRetry}
                  className="retry-button"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="reload-button"
                >
                  Reload Page
                </button>
              </div>
            </div>

          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
              background: #f8fafc;
            }

            .error-content {
              text-align: center;
              max-width: 500px;
              background: white;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }

            .error-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }

            .error-content h2 {
              color: #dc2626;
              margin-bottom: 1rem;
            }

            .error-content p {
              color: #6b7280;
              margin-bottom: 1.5rem;
              line-height: 1.6;
            }

            .error-details {
              text-align: left;
              margin: 1.5rem 0;
              padding: 1rem;
              background: #f3f4f6;
              border-radius: 8px;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #374151;
              margin-bottom: 0.5rem;
            }

            .error-stack {
              background: #1f2937;
              color: #f9fafb;
              padding: 1rem;
              border-radius: 6px;
              font-size: 0.875rem;
              overflow-x: auto;
              white-space: pre-wrap;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-top: 1.5rem;
            }

            .retry-button,
            .reload-button {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }

            .retry-button {
              background: #2563eb;
              color: white;
            }

            .retry-button:hover {
              background: #1d4ed8;
            }

            .reload-button {
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
            }

            .reload-button:hover {
              background: #e5e7eb;
            }
          `}</style>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
    } catch (renderError) {
      // If there's an error in the render method itself, show a simple fallback
      console.error('Error in ErrorBoundary render:', renderError);
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          backgroundColor: '#f8fafc',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>
            <h2 style={{ color: '#dc2626' }}>Critical Error</h2>
            <p>An error occurred while displaying the error boundary.</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
  }
}

export default ErrorBoundary;
