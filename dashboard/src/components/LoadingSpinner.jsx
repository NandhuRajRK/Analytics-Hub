/**
 * Loading Spinner Component
 *
 * A reusable loading indicator that can be used throughout the application
 * to show loading states with consistent styling and animations.
 *
 * Features:
 * - Customizable size and color
 * - Smooth CSS animations
 * - Accessible loading text
 * - Multiple spinner styles
 */

import './LoadingSpinner.css';

/**
 * Loading Spinner Component
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {string} props.color - Color of the spinner (hex, rgb, or CSS color)
 * @param {string} props.text - Loading text to display below spinner
 * @param {string} props.variant - Spinner style variant ('dots', 'ring', 'bars')
 * @param {boolean} props.fullScreen - Whether to render as full screen overlay
 * @returns {JSX.Element} Loading spinner component
 */
function LoadingSpinner({
  size = 'medium',
  color = '#2563eb',
  text = 'Loading...',
  variant = 'ring',
  fullScreen = false,
}) {
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${variant}`,
  ].join(' ');

  const spinnerContent = (
    <div className="loading-spinner-container">
      <div className={spinnerClasses} style={{ '--spinner-color': color }}>
        {variant === 'dots' && (
          <>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </>
        )}

        {variant === 'ring' && (
          <div className="loading-ring"></div>
        )}

        {variant === 'bars' && (
          <>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
            <div className="loading-bar"></div>
          </>
        )}
      </div>

      {text && (
        <p className="loading-text" style={{ color }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}

export default LoadingSpinner;
