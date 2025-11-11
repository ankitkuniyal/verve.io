import React, { useState, useEffect, useCallback } from 'react';

const SecurityWrapper = ({ children, violations }) => {
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Extracted to allow invocation when button is pressed
  const requestFullScreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      }
    } catch (err) {
      console.log('Full screen not supported');
    }
  }, []);

  useEffect(() => {
    // Request full screen only on mount
    requestFullScreen();

    // Listen for full screen changes
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    // Prevent right click
    const handleContextMenu = (e) => {
      e.preventDefault();
      setWarningCount(prev => prev + 1);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        setWarningCount(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J')) {
        e.preventDefault();
        setWarningCount(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    // Prevent copy
    const handleCopy = (e) => {
      e.preventDefault();
      setWarningCount(prev => prev + 1);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [requestFullScreen]);

  useEffect(() => {
    if (violations.length > 0) {
      setWarningCount(prev => prev + violations.length);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  }, [violations]);

  if (warningCount > 3) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-shield-alt text-red-600 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Security Violation Detected</h2>
          <p className="text-red-700 mb-2">
            Multiple security violations detected ({warningCount} warnings).
          </p>
          <p className="text-red-600 text-sm mb-6">
            The quiz has been terminated to maintain integrity.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="security-wrapper">
      {/* Full Screen Warning */}
      {!isFullScreen && (
        <div className="fixed inset-0 bg-yellow-500 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-expand text-yellow-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Full Screen Required</h3>
            <p className="text-gray-600 mb-6">
              Please enable full screen mode to continue with the quiz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={requestFullScreen}
                className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl font-semibold shadow hover:bg-yellow-700 hover:scale-[1.03] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <i className="fas fa-expand mr-2"></i>
                Enable Full Screen
              </button>
              <button
                onClick={() => window.location.assign('/dashboard')}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-800 rounded-xl font-semibold shadow hover:bg-gray-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Warning */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-xl shadow-lg z-50 animate-bounce">
          <div className="flex items-center">
            <i className="fas fa-shield-alt mr-3 text-xl"></i>
            <div>
              <div className="font-semibold">Security Alert</div>
              <div className="text-sm opacity-90">Violation #{warningCount} detected</div>
            </div>
          </div>
        </div>
      )}

      {/* Violation Count Indicator */}
      {warningCount > 0 && (
        <div className="fixed top-4 left-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-40 shadow-lg">
          {warningCount}
        </div>
      )}

      {/* Security Info */}
      <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm z-30 hidden lg:block">
        <div className="flex items-center">
          <i className="fas fa-lock mr-2"></i>
          <span>Protected by AI Proctoring</span>
        </div>
      </div>

      {children}
    </div>
  );
};

export default SecurityWrapper;