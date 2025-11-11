import React from "react";

const LoadingSpinner = ({
  size = 60,
  className = "",
  style = {},
  overlay = true // overlays on whole screen by default
}) => {
  // Use a dark blue color for the spinner and a light blue background
  const strokeColor = "#1e3a8a"; // Tailwind blue-900 (dark)
  const bgColor = "bg-blue-100"; // light blue background

  return (
    <div
      className={`z-[999] ${overlay ? "fixed inset-0" : ""} flex items-center justify-center ${bgColor} ${className}`}
      style={overlay ? { ...style } : { minHeight: "4rem", ...style }}
    >
      <div className="flex flex-col items-center justify-center">
        <svg
          className="animate-spin"
          width={size}
          height={size}
          viewBox="0 0 50 50"
          aria-label="Loading"
          style={{ display: "block" }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeDasharray={`${Math.PI * 20 * (90 / 360)},${Math.PI * 20 * (1 - 90 / 360)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        </svg>
        <div className="mt-6 font-bold text-lg text-blue-900">
          Loading...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
