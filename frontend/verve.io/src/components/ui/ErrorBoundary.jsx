import React from 'react';
import { useNavigate } from 'react-router-dom';

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// Functional component to handle navigation with useNavigate
const NavigateButton = ({ to, onBeforeNavigate, className, children }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onBeforeNavigate) {
      onBeforeNavigate();
    }
    navigate(to);
  };
  
  return (
    <button
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };


  render() {
    if (this.state.hasError) {
      // Customize fallback UI based on props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {this.props.title || 'Something went wrong'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {this.props.message || 'We\'re sorry, but something unexpected happened. Please try again.'}
            </p>

            {isDevelopment && this.state.error && (
              <details className="mb-6 text-left bg-gray-100 p-4 rounded text-sm overflow-auto max-h-48">
                <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-red-600 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              {this.props.showReset !== false && (
                <button
                  onClick={this.handleReset}
                  className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              )}
              
              {this.props.showHome !== false && (
                <NavigateButton 
                  to="/dashboard" 
                  onBeforeNavigate={() => {
                    this.setState({ 
                      hasError: false, 
                      error: null,
                      errorInfo: null 
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Go to Dashboard
                </NavigateButton>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

