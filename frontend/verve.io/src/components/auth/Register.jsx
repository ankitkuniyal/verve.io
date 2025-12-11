// src/components/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, GraduationCap, Loader2, AlertCircle, Briefcase, Zap, Shield } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mbaExam, setMbaExam] = useState('CAT');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { register, signInWithGoogle, user, loading, error, clearError, actionLoading } = useAuth();
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

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await register(email, password, name, mbaExam);
    } catch (error) {
      // Error is handled in hook
    }
  };

  const handleGoogleLogin = async () => {
    setFormError('');
    try {
      await signInWithGoogle();
    } catch (error) {
       // Error handled in hook
    }
  };

  if (user) {
    return null; 
  }

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* Scrollable Form Container - Left */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto h-screen">
        <div className="max-w-md w-full my-auto">
          <div className="text-center lg:text-left mb-8">
             <Link to="/" className="inline-flex lg:hidden items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white mb-8">
                 <Briefcase size={24} />
             </Link>
             <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
             <p className="mt-2 text-slate-500">
               Already have an account?{' '}
               <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                 Sign in instead
               </Link>
             </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || actionLoading}
              className="w-full flex items-center justify-center px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm bg-white text-slate-700 hover:bg-slate-50 font-medium transition-all group"
            >
              <img 
                 src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                 alt="Google" 
                 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"
               />
              Sign up with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 uppercase tracking-wider font-bold text-xs">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleEmailRegister} className="space-y-4">
               {formError && (
                 <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-start border border-red-100">
                   <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                   {formError}
                 </div>
               )}

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                 <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                 </div>
               </div>

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
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Target MBA Exam</label>
                  <div className="relative">
                     <GraduationCap className="absolute left-3 top-3.5 text-slate-400" size={20} />
                     <select
                        value={mbaExam}
                        onChange={(e) => setMbaExam(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium appearance-none"
                     >
                       <option value="CAT">CAT (IIMs)</option>
                       <option value="GMAT">GMAT (Global)</option>
                       <option value="GRE">GRE</option>
                       <option value="XAT">XAT</option>
                       <option value="Placement">Job Placement</option>
                     </select>
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
               </div>
               
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
                      placeholder="• • • • • • • •"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                 </div>
               </div>

               <button
                 type="submit"
                 disabled={loading || actionLoading}
                 className="w-full flex justify-center py-3.5 px-4 mt-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
               >
                 {(loading || actionLoading) ? (
                   <Loader2 className="animate-spin" size={20} />
                 ) : (
                   "Create Account"
                 )}
               </button>
            </form>
            
            <p className="text-xs text-center text-slate-400 px-4">
               By signing up, you agree to our <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-600 z-0"></div>
        {/* Abstract shapes */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]"></div>
        <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-[20px] animate-pulse"></div>

        <div className="relative z-10 max-w-lg text-center">
            <h2 className="text-4xl font-extrabold mb-6">Join the top 1% of <br/>MBA aspirants.</h2>
            <div className="space-y-4 text-left inline-block">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors cursor-default">
                    <div className="bg-white text-blue-600 p-2 rounded-lg"><Zap size={20} /></div>
                    <div>
                        <h4 className="font-bold">Instant Feedback</h4>
                        <p className="text-sm text-blue-100">Get analyzed in seconds.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors cursor-default">
                    <div className="bg-white text-blue-600 p-2 rounded-lg"><Shield size={20} /></div>
                    <div>
                        <h4 className="font-bold">Personalized questions</h4>
                        <p className="text-sm text-blue-100">Tailored to your resume.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;