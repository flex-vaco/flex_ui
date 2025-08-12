import React from 'react';
import './Loader.css';

const Loader = ({ 
  size = 'large', 
  message = 'Loading...', 
  showMessage = false,
  variant = 'spinner',
  containerHeight = '200px'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'loader-small';
      case 'medium':
        return 'loader-medium';
      case 'large':
      default:
        return 'loader-large';
    }
  };

  const renderSpinner = () => (
    <div className={`spinner-border text-primary ${getSizeClass()}`} role="status"></div>
  );

  const renderDots = () => (
    <div className="dots-loader">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`pulse-loader ${getSizeClass()}`}></div>
  );

  const getLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  return (
    <div 
      className="loader-container d-flex flex-column justify-content-center align-items-center" 
      style={{ height: containerHeight }}
    >
      {getLoader()}
      {showMessage && (
        <p className="loader-message mt-3 text-muted">{message}</p>
      )}
    </div>
  );
};

export default Loader;