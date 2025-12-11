// src/components/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle, Briefcase } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  
  const { login, signInWithGoogle, resetPassword, user, loading, error, clearError, actionLoading } = useAuth();
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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleGoogleLogin = async () => {
    setFormError('');
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
       setFormError("Please enter your email address first.");
       return;
    }
    try {
       await resetPassword(email);
       setMessage("If an account exists, a password reset link has been sent.");
       setFormError("");
    } catch(err) {
       setFormError("Failed to reset password. Please try again.");
    }
  };

  if (user) {
    return null; 
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/50">
             <Briefcase size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome back to your <span className="text-blue-400">career journey.</span></h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
             Track your progress, practice new questions, and get AI-driven insights to crack your dream interview.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-2xl font-bold mb-1">94%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Success Rate</div>
             </div>
             <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-2xl font-bold mb-1">10k+</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">Mock Interviews</div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
             <Link to="/" className="inline-flex lg:hidden items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white mb-8">
                 <Briefcase size={24} />
             </Link>
             <h2 className="text-3xl font-bold text-slate-900">Sign in to Verve.io</h2>
             <p className="mt-2 text-slate-500">
               Don't have an account?{' '}
               <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                 Create one for free
               </Link>
             </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || actionLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-slate-700 hover:bg-slate-50 font-medium transition-all group"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
              />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 uppercase tracking-wider font-bold text-xs">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
               {formError && (
                 <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start border border-red-100">
                   <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                   {formError}
                 </div>
               )}
               {message && (
                  <div className="p-4 bg-green-50 text-green-600 text-sm rounded-xl flex items-start border border-green-100">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    {message}
                  </div>
               )}

               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                      <input
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-bold text-slate-700">Password</label>
                      <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-blue-600 hover:text-blue-500">
                        Forgot password?
                      </button>
                   </div>
                   <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                   </div>
                 </div>
               </div>

               <button
                 type="submit"
                 disabled={loading || actionLoading}
                 className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
               >
                 {(loading || actionLoading) ? (
                   <Loader2 className="animate-spin" size={20} />
                 ) : (
                   "Sign In"
                 )}
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;