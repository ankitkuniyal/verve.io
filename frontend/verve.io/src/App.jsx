// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import ResumeParser from './components/ResumeParser';
import EssayWritingPage from './components/EssayWritingPage';
import MBAVideoInterview from './components/MBAVideoInterview';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AIQuizPlatform from './components/AIQuizPlatform';
import LandingPage from './components/LandingPage';

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
    <BrowserRouter>
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
            <Route path="/" element={<LandingPage/>} />
          </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;