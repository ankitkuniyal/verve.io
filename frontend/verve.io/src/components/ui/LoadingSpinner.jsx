import React from 'react';

const LoadingSpinner = ({ size = 24, color = "#0e7490", className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      style={{ display: "block" }}
      aria-label="Loading"
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray="90,150"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export default LoadingSpinner;
