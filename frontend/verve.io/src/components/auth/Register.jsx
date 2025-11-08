// src/components/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  
  const { register, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setFormError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.displayName || !formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await register(formData.email, formData.password, formData.displayName);
      // Navigation will happen automatically due to the useEffect
    } catch (error) {
      // Error is already handled in the hook
      console.error('Registration error:', error);
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
                alt="Register illustration"
              />
            </div>
            
            {/* Right Column - Register Form */}
            <div className="lg:col-span-5 xl:col-span-4 flex justify-center items-center">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
                  <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <span className="inline-block bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-3 shadow-sm">
                        Create Account
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Sign Up
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Join Quiz Master today
                      </p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleRegister} className="space-y-6">
                      {/* Display Name Field */}
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            placeholder="John Doe"
                            value={formData.displayName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

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
                            name="email"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
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
                            name="password"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Confirm Password Field */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </div>
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
                              Creating Account...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              Create Account
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Login Link */}
                      <div className="text-center text-sm">
                        <span className="text-gray-600">Already have an account?</span>
                        <Link 
                          to="/login" 
                          className="text-cyan-500 font-semibold ml-1 hover:text-cyan-600 transition-colors"
                        >
                          Sign In
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

export default Register;