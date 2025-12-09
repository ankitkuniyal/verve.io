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
  Calendar,
  MapPin,
  Phone,
  Briefcase,
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

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mbaExam: 'CAT',
    phone: '',
    location: '',
    workExperience: '',
    education: '',
    achievements: '',
    targetYear: new Date().getFullYear() + 1,
    bio: ''
  });

  // Helper to get auth headers (for Firebase user)
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
     
      setProfileData({
        name: data.user.name || firebaseUser?.displayName || '',
        email: data.user.email || firebaseUser?.email || '',
        mbaExam: data.user.mbaExam || 'CAT',
        phone: data.user.phone || '',
        location: data.user.location || '',
        workExperience: data.user.workExperience || '',
        education: data.user.education || '',
        achievements: data.user.achievements || '',
        targetYear: data.user.targetYear || new Date().getFullYear() + 1,
        bio: data.user.bio || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again.');
      // If error (like no profile), initialize with Firebase auth data
     
      if (firebaseUser) {
        setProfileData({
          name: firebaseUser?.displayName || '',
          email: firebaseUser?.email || '',
          mbaExam: 'CAT',
          phone: '',
          location: '',
          workExperience: '',
          education: '',
          achievements: '',
          targetYear: new Date().getFullYear() + 1,
          bio: ''
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
          ...profileData,
          email: user.email // Making sure email is always synced
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      setSuccess('Profile saved successfully!');
      setIsEditing(false);
      
      // Dispatch event to notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('profileUpdated'));
      
      // Wait a bit then clear success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
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
          <p className="text-xl text-gray-600">Loading your profile...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow"
              >
                <Edit2 size={20} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile(user);
                    setError('');
                    setSuccess('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <Award size={20} />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <span>{error}</span>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={24} />
              Basic Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.name || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                  {profileData.email || user?.email || 'Not set'}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="+91 1234567890"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.phone || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="City, Country"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.location || 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MBA Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap size={24} />
              MBA Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target MBA Exam
                </label>
                {isEditing ? (
                  <select
                    value={profileData.mbaExam}
                    onChange={(e) => handleInputChange('mbaExam', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="CAT">CAT</option>
                    <option value="XAT">XAT</option>
                    <option value="GMAT">GMAT</option>
                    <option value="GRE">GRE</option>
                    <option value="NMAT">NMAT</option>
                    <option value="SNAP">SNAP</option>
                    <option value="IIFT">IIFT</option>
                    <option value="CMAT">CMAT</option>
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.mbaExam}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Target Year
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profileData.targetYear}
                    onChange={(e) => handleInputChange('targetYear', parseInt(e.target.value))}
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 5}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profileData.targetYear}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase size={24} />
              Professional Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Experience
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                    placeholder="Describe your work experience..."
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[100px] whitespace-pre-wrap">
                    {profileData.workExperience || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                    placeholder="Describe your educational background..."
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[100px] whitespace-pre-wrap">
                    {profileData.education || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Achievements
                </label>
                {isEditing ? (
                  <textarea
                    value={profileData.achievements}
                    onChange={(e) => handleInputChange('achievements', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                    placeholder="List your achievements, awards, certifications..."
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[100px] whitespace-pre-wrap">
                    {profileData.achievements || 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About Me</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900 min-h-[120px] whitespace-pre-wrap">
                  {profileData.bio || 'Not set'}
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

