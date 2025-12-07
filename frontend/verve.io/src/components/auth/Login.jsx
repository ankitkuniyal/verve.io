// src/components/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, signInWithGoogle, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    if (error) {
      setFormError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      // Navigation will happen automatically due to the useEffect
    } catch (error) {
      // Error is already handled in the hook
      console.error('Login error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError('');
    try {
      await signInWithGoogle();
      // Navigation will happen automatically due to the useEffect
    } catch (error) {
      // Error is already handled in the hook
      console.error('Google sign-in error:', error);
    }
  };

  if (user) {
    return null; // or a loading spinner
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 animate-gradient-x">
      <div className="container mx-auto px-4">
        <div className="min-h-screen flex justify-center items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl">
            {/* Left Column - Illustration */}
            <div className="lg:col-span-7 xl:col-span-8 hidden lg:flex justify-center items-center">
              <img 
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                className="w-full max-w-lg rounded-2xl"
                alt="Login illustration"
              />
            </div>
            
            {/* Right Column - Login Form */}
            <div className="lg:col-span-5 xl:col-span-4 flex justify-center items-center">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
                  <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <span className="inline-block bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-3 shadow-sm">
                        Welcome Back
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Sign In
                      </h2>
                      <p className="text-gray-600 text-sm">
                      Login to your 
                        <span className="bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent font-semibold px-1">
                          verve.io 
                        </span>
                        account
                      </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            id="email"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            id="password"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Forgot Password */}
                      <div className="flex justify-between items-center">
                        <Link to="/forgot-password" className="text-cyan-500 text-sm underline hover:text-cyan-600 transition-colors">
                          Forgot password?
                        </Link>
                      </div>

                      {/* Error Message */}
                      {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                          {formError}
                        </div>
                      )}

                      {/* Submit Button */}
                      <div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-cyan-500 hover:to-indigo-500 text-white py-3 px-4 rounded-lg font-medium shadow-sm transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                              Signing In...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Sign In
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                      </div>

                      {/* Google Sign In Button */}
                      <div>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium shadow-sm transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          {loading ? 'Signing in...' : 'Sign in with Google'}
                        </button>
                      </div>

                      {/* Register Link */}
                      <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account?</span>
                        <Link 
                          to="/register" 
                          className="text-cyan-500 font-semibold ml-1 hover:text-cyan-600 transition-colors"
                        >
                          Register
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;