// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import ResumeParser from './components/ResumeAnalyzer';
import EssayWritingPage from './components/EssayWritingPage';
import MBAVideoInterview from './components/MBAVideoInterview';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AIQuizPlatform from './components/AIQuizPlatform';
import LearningHub from './components/LearningHub';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (for login/register when already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <ErrorBoundary>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/learning-hub" 
              element={
                <ProtectedRoute>
                  <LearningHub />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/user/:userid/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-parser"
              element={
                <ProtectedRoute>
                  <ResumeParser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/essay-writing"
              element={
                <ProtectedRoute>
                  <EssayWritingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-quiz"
              element={
                <ProtectedRoute>
                  <AIQuizPlatform />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mba-interview"
              element={
                <ProtectedRoute>
                  <MBAVideoInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<LandingPage />} />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;