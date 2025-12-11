import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  GraduationCap, 
  Save, 
  Edit2,
  Award
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  // Strictly limiting state to fields present in the User Model
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mbaExam: 'CAT',
  });

  const getAuthHeaders = async (currentUser) => {
    const token = await currentUser.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadProfile(firebaseUser);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadProfile = async (firebaseUser) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders(firebaseUser);
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
     
      // Only set fields that exist in our User Model
      setProfileData({
        name: data.user.name || firebaseUser?.displayName || '',
        email: data.user.email || firebaseUser?.email || '',
        mbaExam: data.user.mbaExam || 'CAT',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load user data.');
     
      if (firebaseUser) {
        setProfileData({
          name: firebaseUser?.displayName || '',
          email: firebaseUser?.email || '',
          mbaExam: 'CAT',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const headers = await getAuthHeaders(user);
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: profileData.name,
          mbaExam: profileData.mbaExam,
          // Email is usually immutable in profile updates or handled separately 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account details</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow w-full sm:w-auto justify-center"
              >
                <Edit2 size={20} />
                <span>Edit Details</span>
              </button>
            ) : (
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile(user);
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 animate-fade-in">
            <Award size={20} />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 animate-fade-in">
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-8 space-y-8">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User size={18} className="text-blue-500" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors font-medium text-gray-900"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-100 font-medium text-lg">
                  {profileData.name || 'Not set'}
                </div>
              )}
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={18} className="text-blue-500" />
                Email Address
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-500 border border-gray-100 font-medium flex justify-between items-center">
                <span className="truncate mr-2">{profileData.email || user?.email}</span>
                <span className="text-xs uppercase bg-gray-200 px-2 py-1 rounded text-gray-600 font-bold flex-shrink-0">Read Only</span>
              </div>
            </div>

            {/* MBA Exam */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-500" />
                Target Exam
              </label>
              {isEditing ? (
                <select
                  value={profileData.mbaExam}
                  onChange={(e) => handleInputChange('mbaExam', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors font-medium text-gray-900 appearance-none bg-white"
                >
                  <option value="CAT">CAT (IIMs)</option>
                  <option value="GMAT">GMAT (Global)</option>
                  <option value="GRE">GRE</option>
                  <option value="XAT">XAT</option>
                  <option value="SNAP">SNAP</option>
                  <option value="NMAT">NMAT</option>
                  <option value="Placement">Job Placement</option>
                </select>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 border border-gray-100 font-medium text-lg">
                  {profileData.mbaExam}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
