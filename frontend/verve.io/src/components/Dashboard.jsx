import React, { useEffect, useState, useCallback } from 'react';
import { 
  Brain, 
  Video, 
  FileText, 
  BarChart3, 
  Award, 
  Clock, 
  Shield,
  Users,
  Target,
  Star,
  ChevronUp,
  ArrowRight,
  CheckCircle,
  Zap,
  MessageCircle,
  UserCheck,
  TrendingUp,
  Download,
  LogOut,
  Settings,
  Calendar,
  Lightbulb,
  Trophy,
  ChartLine,
  TargetIcon,
  PieChart,
  Newspaper,
  PenTool,
  FileUp,
  User
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase/config';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const tips = [
  'Consistency beats intensity.',
  'Every day is a new opportunity to learn.',
  'Small steps every day lead to big results.',
  'Mistakes are proof that you are trying.',
  'Stay curious and keep exploring.',
];

function getTipOfTheDay() {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = dateSeed % tips.length;
  return tips[index];
}

const ActionButton = ({ text, hoverText, icon, color, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="relative group flex items-center justify-center w-full min-h-20 rounded-2xl overflow-hidden border-2 border-gray-200 transition-all duration-300 ease-out hover:border-gray-800 hover:scale-105"
      style={{ backgroundColor: color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out mix-blend-overlay opacity-20" />
      
      <div className="relative flex items-center justify-center w-full p-4 z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full mr-4 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <div className="relative overflow-hidden h-10 flex items-center">
          <span
            className={`absolute text-lg font-bold text-gray-900 transition-all duration-300 ${
              isHovered ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            {text}
          </span>
          <span
            className={`absolute text-lg font-bold text-gray-900 transition-all duration-300 ${
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            {hoverText}
          </span>
        </div>
      </div>
    </button>
  );
};

const FeatureCard = ({ icon, title, description, delay, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border-2 border-gray-200 bg-white transition-all duration-700 transform hover:scale-105 hover:shadow-xl cursor-pointer ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-95"
      }`}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState({ 
    name: 'Loading...', 
    email: '', 
    mbaExam: 'CAT' 
  });
  const [showTitle, setShowTitle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    avgScore: 0,
    chaptersAttempted: 0,
    streak: 0,
    weeklyTarget: 10,
    improvement: '0%',
    weakestTopic: 'Loading...',
    strongestTopic: 'Loading...'
  });
  const [leagueData, setLeagueData] = useState({
    league: { name: 'Bronze', icon: '🥉', color: '#cd7f32' },
    league_score: 0,
    next_league: { name: 'Silver', min_score: 60 },
    progress: 0
  });
  const [chartData, setChartData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'],
    datasets: [
      {
        label: 'Quantitative Aptitude',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Verbal Ability',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'LRDI',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  });

  const tipOfTheDay = getTipOfTheDay();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const navigate = useNavigate();

  const recommendations = [
    {
      id: 1,
      title: 'Master Time Management',
      description: 'You spend avg 3.2 mins per question. Aim for 2.5 mins to complete sections faster.',
      icon: <Clock size={24} />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 2,
      title: 'Practice Mental Math',
      description: 'Avoid calculator dependency. Practice speed calculations for Quant section.',
      icon: <Brain size={24} />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 3,
      title: 'Revision Strategy Needed',
      description: 'Revisit incorrect answers. Your revision rate is 40% - increase to 70%.',
      icon: <TrendingUp size={24} />,
      color: 'from-emerald-500 to-teal-600'
    }
  ];

  const mbaNews = [
    {
      id: 1,
      title: 'IIM CAT 2025 Registration Extended',
      description: 'Last date to register extended to Nov 20th. Don\'t miss out!',
      date: 'Nov 8, 2025',
      badge: 'Important'
    },
    {
      id: 2,
      title: 'New Pattern Alert: XAT 2026',
      description: 'Decision Making section weightage increased by 10%.',
      date: 'Nov 5, 2025',
      badge: 'Update'
    },
    {
      id: 3,
      title: 'Top B-Schools Placement Stats',
      description: 'IIM A, B, C report 100% placements with avg package ₹32 LPA.',
      date: 'Nov 3, 2025',
      badge: 'News'
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#0ea5e9',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: { 
        beginAtZero: true,
        max: 100,
        grid: { color: '#e2e8f0' },
        ticks: { 
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => value + '%'
        }
      }
    }
  };

  // Fetch dashboard analytics data from Firestore (with localStorage fallback)
  const fetchDashboardData = useCallback(async (userId) => {
    setIsLoading(true);
    try {
      let storedEssays = [];
      
      // Try to fetch from Firestore first
      try {
        // Fetch from user's subcollection: users/{userId}/essayResults
        const essaysQuery = query(
          collection(db, 'users', userId, 'essayResults')
        );
        
        const essaysSnapshot = await getDocs(essaysQuery);
        storedEssays = essaysSnapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore timestamps to ISO strings for compatibility
          const createdAt = data.createdAt?.toDate?.()?.toISOString() || 
                          data.metadata?.analyzedAt?.toDate?.()?.toISOString() || 
                          new Date().toISOString();
          
          return {
            ...data,
            id: doc.id, // Include document ID
            userId: data.userId || userId, // Ensure userId is set
            metadata: {
              ...data.metadata,
              analyzedAt: data.metadata?.analyzedAt?.toDate?.()?.toISOString() || createdAt
            },
            createdAt: createdAt
          };
        });
        
        // Sort by createdAt in descending order (newest first)
        storedEssays.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.metadata?.analyzedAt || 0);
          const dateB = new Date(b.createdAt || b.metadata?.analyzedAt || 0);
          return dateB - dateA; // Descending order
        });
        
        console.log(`✅ Successfully fetched ${storedEssays.length} essay results from Firestore for user ${userId}`);
        
        // Also sync to localStorage for offline access (filtered by userId)
        if (storedEssays.length > 0) {
          // Get existing localStorage data and merge
          const existingLocal = JSON.parse(localStorage.getItem('essayResults') || '[]');
          const otherUsersData = existingLocal.filter(essay => essay.userId && essay.userId !== userId);
          const mergedData = [...otherUsersData, ...storedEssays];
          localStorage.setItem('essayResults', JSON.stringify(mergedData));
        }
      } catch (firestoreError) {
        console.error('❌ Error fetching from Firestore:', firestoreError);
        console.error('Error details:', {
          code: firestoreError.code,
          message: firestoreError.message,
          stack: firestoreError.stack
        });
        
        // Fallback to localStorage
        const localEssays = JSON.parse(localStorage.getItem('essayResults') || '[]');
        // Filter by userId if available in localStorage
        storedEssays = localEssays.filter(essay => !essay.userId || essay.userId === userId);
        
        if (storedEssays.length > 0) {
          console.log(`⚠️ Using ${storedEssays.length} essay results from localStorage as fallback`);
        } else {
          console.log('⚠️ No essay results found in Firestore or localStorage');
        }
      }
      
      // Get quiz and interview results from localStorage (can be migrated to Firestore later)
      const storedQuizzes = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const storedInterviews = JSON.parse(localStorage.getItem('interviewResults') || '[]');

      // Calculate stats from essay data
      const totalTests = storedEssays.length + storedQuizzes.length + storedInterviews.length;
      
      // Calculate average scores
      let avgScore = 0;
      let totalScore = 0;
      let scoreCount = 0;

      storedEssays.forEach(essay => {
        if (essay.analysis?.overallAssessment?.totalScore) {
          totalScore += essay.analysis.overallAssessment.totalScore;
          scoreCount++;
        }
      });

      storedQuizzes.forEach(quiz => {
        if (quiz.score !== undefined) {
          totalScore += quiz.score;
          scoreCount++;
        }
      });

      storedInterviews.forEach(interview => {
        if (interview.overallScore) {
          totalScore += interview.overallScore;
          scoreCount++;
        }
      });

      avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

      // Calculate improvement
      let improvement = '0%';
      if (storedEssays.length >= 4) {
        const scores = storedEssays.map(e => e.analysis?.overallAssessment?.totalScore || 0);
        const midPoint = Math.floor(scores.length / 2);
        const firstHalf = scores.slice(0, midPoint);
        const secondHalf = scores.slice(midPoint);
        
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const improvementValue = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(0);
        improvement = improvementValue > 0 ? `+${improvementValue}%` : `${improvementValue}%`;
      }

      // Calculate streak (consecutive days with tests)
      const allTests = [...storedEssays, ...storedQuizzes, ...storedInterviews];
      const today = new Date();
      let streak = 0;
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const hasActivity = allTests.some(item => {
          const itemDate = new Date(item.metadata?.analyzedAt || item.completedAt || item.timestamp);
          return itemDate.toISOString().split('T')[0] === dateStr;
        });
        
        if (hasActivity) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Analyze topics from essays
      const topicScores = {};
      storedEssays.forEach(essay => {
        const topic = essay.metadata?.topic || 'General';
        const score = essay.analysis?.overallAssessment?.totalScore || 0;
        
        if (!topicScores[topic]) {
          topicScores[topic] = { total: 0, count: 0 };
        }
        topicScores[topic].total += score;
        topicScores[topic].count += 1;
      });

      let weakestTopic = 'No data yet';
      let strongestTopic = 'No data yet';
      let minAvg = 100;
      let maxAvg = 0;

      Object.keys(topicScores).forEach(topic => {
        const avg = topicScores[topic].total / topicScores[topic].count;
        if (avg < minAvg) {
          minAvg = avg;
          weakestTopic = topic;
        }
        if (avg > maxAvg) {
          maxAvg = avg;
          strongestTopic = topic;
        }
      });

      // Update stats
      setStats({
        totalQuizzes: totalTests,
        avgScore,
        chaptersAttempted: Object.keys(topicScores).length || 0,
        streak,
        weeklyTarget: 10,
        improvement,
        weakestTopic,
        strongestTopic
      });

      // Calculate league based on total attempts and average score (progressive system)
      // League progression: Bronze (0-2 attempts) -> Silver (3-5 attempts, avg >= 50) -> Gold (6-9 attempts, avg >= 65) -> Platinum (10+ attempts, avg >= 80) -> Diamond (15+ attempts, avg >= 90)
      let leagueInfo = { name: 'Bronze', icon: '🥉', color: '#cd7f32' };
      let nextLeague = { name: 'Silver', min_score: 50, min_attempts: 3 };
      let progress = 0;
      const totalAttempts = storedEssays.length;

      if (totalAttempts >= 15 && avgScore >= 90) {
        leagueInfo = { name: 'Diamond', icon: '💎', color: '#b9f2ff' };
        nextLeague = { name: 'Diamond', min_score: 90, min_attempts: 15 };
        progress = 100;
      } else if (totalAttempts >= 10 && avgScore >= 80) {
        leagueInfo = { name: 'Platinum', icon: '🏆', color: '#e5e4e2' };
        nextLeague = { name: 'Diamond', min_score: 90, min_attempts: 15 };
        // Progress based on score towards 90
        progress = Math.min(100, ((avgScore - 80) / (90 - 80)) * 100);
      } else if (totalAttempts >= 6 && avgScore >= 65) {
        leagueInfo = { name: 'Gold', icon: '🥇', color: '#ffd700' };
        nextLeague = { name: 'Platinum', min_score: 80, min_attempts: 10 };
        // Progress based on attempts (6-10) and score (65-80)
        const attemptProgress = Math.min(100, ((totalAttempts - 6) / (10 - 6)) * 100);
        const scoreProgress = Math.min(100, ((avgScore - 65) / (80 - 65)) * 100);
        progress = (attemptProgress + scoreProgress) / 2;
      } else if (totalAttempts >= 3 && avgScore >= 50) {
        leagueInfo = { name: 'Silver', icon: '🥈', color: '#c0c0c0' };
        nextLeague = { name: 'Gold', min_score: 65, min_attempts: 6 };
        // Progress based on attempts (3-6) and score (50-65)
        const attemptProgress = Math.min(100, ((totalAttempts - 3) / (6 - 3)) * 100);
        const scoreProgress = Math.min(100, ((avgScore - 50) / (65 - 50)) * 100);
        progress = (attemptProgress + scoreProgress) / 2;
      } else {
        // Bronze league - progress based on attempts (0-3) and score (0-50)
        const attemptProgress = Math.min(100, (totalAttempts / 3) * 100);
        const scoreProgress = Math.min(100, (avgScore / 50) * 100);
        progress = (attemptProgress + scoreProgress) / 2;
      }

      setLeagueData({
        league: leagueInfo,
        league_score: avgScore,
        next_league: nextLeague,
        progress: Math.round(progress)
      });

      // Calculate individual essay attempts for chart (show all attempts)
      // Sort essays by date (oldest first)
      const sortedEssays = [...storedEssays].sort((a, b) => {
        const dateA = new Date(a.metadata?.analyzedAt || a.createdAt || 0);
        const dateB = new Date(b.metadata?.analyzedAt || b.createdAt || 0);
        return dateA - dateB;
      });

      const labels = sortedEssays.map((essay, index) => `Attempt ${index + 1}`);
      const contentScores = sortedEssays.map(essay => 
        Math.round((essay.analysis?.sectionScores?.content || 0) * 10)
      );
      const structureScores = sortedEssays.map(essay => 
        Math.round((essay.analysis?.sectionScores?.structure || 0) * 10)
      );
      const languageScores = sortedEssays.map(essay => 
        Math.round((essay.analysis?.sectionScores?.language || 0) * 10)
      );

      // If no essays yet, show empty chart with placeholder
      if (sortedEssays.length === 0) {
        setChartData(prevChartData => ({
          labels: ['No attempts yet'],
          datasets: [
            {
              ...prevChartData.datasets[0],
              label: 'Content Quality',
              data: [0]
            },
            {
              ...prevChartData.datasets[1],
              label: 'Structure',
              data: [0]
            },
            {
              ...prevChartData.datasets[2],
              label: 'Language',
              data: [0]
            }
          ]
        }));
      } else {
        setChartData(prevChartData => ({
          labels: labels,
          datasets: [
            {
              ...prevChartData.datasets[0],
              label: 'Content Quality',
              data: contentScores
            },
            {
              ...prevChartData.datasets[1],
              label: 'Structure',
              data: structureScores
            },
            {
              ...prevChartData.datasets[2],
              label: 'Language',
              data: languageScores
            }
          ]
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user data from Firebase and profile from Firestore
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load profile from Firestore: users/{userId}
        try {
          const profileRef = doc(db, 'users', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setUser({
              name: profileData.name || firebaseUser.displayName || 'User',
              email: profileData.email || firebaseUser.email || '',
              mbaExam: profileData.mbaExam || 'CAT'
            });
          } else {
            // Use Firebase auth data as fallback
            setUser({
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              mbaExam: 'CAT'
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // Fallback to Firebase auth data
          setUser({
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            mbaExam: 'CAT'
          });
        }
        
        fetchDashboardData(firebaseUser.uid);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate, fetchDashboardData]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const profileRef = doc(db, 'users', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const profileData = profileSnap.data();
            setUser({
              name: profileData.name || currentUser.displayName || 'User',
              email: profileData.email || currentUser.email || '',
              mbaExam: profileData.mbaExam || 'CAT'
            });
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Listen for essay result updates and refresh dashboard
  useEffect(() => {
    const handleEssayUpdate = () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        fetchDashboardData(currentUser.uid);
      }
    };

    // Listen for custom event when essay results are updated (real-time update)
    window.addEventListener('essayResultUpdated', handleEssayUpdate);
    
    // Refresh when window gains focus (user navigates back to dashboard)
    const handleFocus = () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        fetchDashboardData(currentUser.uid);
      }
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('essayResultUpdated', handleEssayUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboardData]);

  useEffect(() => {
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 100);

    return () => clearTimeout(titleTimer);
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // Don't clear essayResults - they're stored in Firestore
      // Only clear auth-related data
      localStorage.removeItem('token');
      sessionStorage.clear();
      navigate('/');
      console.log('Successfully logged out');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const downloadReport = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const marginLeft = 40;
    let y = 40;

    doc.setFontSize(20);
    doc.text("MBA Progress Report", marginLeft, y);
    doc.setFontSize(11);
    y += 24;
    doc.text(`Date: ${new Date().toLocaleString()}`, marginLeft, y);
    y += 20;
    doc.text(`Name: ${user.name}`, marginLeft, y);
    y += 16;
    doc.text(`Email: ${user.email}`, marginLeft, y);
    y += 16;
    doc.text(`Exam: ${user.mbaExam}`, marginLeft, y);

    y += 28;
    doc.setFontSize(13);
    doc.text("Summary Stats", marginLeft, y);
    y += 8;
    doc.autoTable({
      startY: y + 8,
      margin: { left: marginLeft },
      head: [['Total Quizzes', 'Avg Score', 'Chapters Attempted', 'Streak', 'Weekly Target', 'Improvement', 'Weakest Topic', 'Strongest Topic']],
      body: [[
        stats.totalQuizzes,
        stats.avgScore + '%',
        stats.chaptersAttempted,
        stats.streak,
        stats.weeklyTarget,
        stats.improvement,
        stats.weakestTopic,
        stats.strongestTopic
      ]],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [50, 90, 155] }
    });

    const leagueStartY = doc.autoTable.previous.finalY + 24;
    doc.setFontSize(13);
    doc.text("League Info", marginLeft, leagueStartY);
    doc.setFontSize(11);
    let nextLeagueText = `${leagueData.league.name} (${leagueData.league.icon}), Score: ${leagueData.league_score}`;
    if (leagueData.next_league) {
      nextLeagueText += ` | Next: ${leagueData.next_league.name} (min score ${leagueData.next_league.min_score})`;
    }
    doc.text(nextLeagueText, marginLeft, leagueStartY + 12);
    doc.text(`Progress: ${leagueData.progress}%`, marginLeft, leagueStartY + 28);

    const recStartY = leagueStartY + 44;
    doc.setFontSize(13);
    doc.text("Recommendations", marginLeft, recStartY);
    doc.autoTable({
      startY: recStartY + 8,
      margin: { left: marginLeft },
      head: [['Title', 'Description']],
      body: recommendations.map(r => [r.title, r.description]),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 153, 225] }
    });

    const chartY = doc.autoTable.previous.finalY + 24;
    doc.setFontSize(13);
    doc.text("Progress Chart Data", marginLeft, chartY);
    const tableHead = ['Week', ...chartData.datasets.map(ds => ds.label)];
    const tableBody = [];
    for (let i = 0; i < chartData.labels.length; i++) {
      const row = [
        chartData.labels[i],
        ...chartData.datasets.map(ds => ds.data[i] + '%')
      ];
      tableBody.push(row);
    }
    doc.autoTable({
      startY: chartY + 8,
      margin: { left: marginLeft },
      head: [tableHead],
      body: tableBody,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 116, 139] }
    });

    const noteY = doc.autoTable.previous.finalY + 32;
    doc.setFontSize(10);
    doc.text("Generated by Verve MBA Dashboard.", marginLeft, noteY);

    doc.save(`mba-progress-report-${user.name.toLowerCase().replace(/\s/g, "_")}-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const progressPercent = (stats.streak / stats.weeklyTarget) * 100;

  if (isLoading) {
    return (
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
                {`Welcome back, ${user.name.split(' ')[0]}!`.split(/( )/).map((part, index) =>
                  part === " " ? (
                    <span key={index}>&nbsp;</span>
                  ) : (
                    part.split("").map((letter, i) => (
                      <span
                        key={`${index}-${i}`}
                        className={`inline-block transition-all duration-700 ease-out ${
                          showTitle
                            ? "opacity-100 transform translate-y-0 scale-100"
                            : "opacity-0 transform translate-y-12 scale-95"
                        }`}
                        style={{
                          transitionDelay: showTitle
                            ? `${(index * 7 + i) * 0.05}s`
                            : "0s",
                        }}
                      >
                        {letter}
                      </span>
                    ))
                  )
                )}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">Ready to continue your MBA preparation journey?</p>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-2xl p-6 flex items-center gap-4 shadow-sm mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-yellow-800">Tip of the Day:</div>
                  <div className="text-sm text-yellow-700">{tipOfTheDay}</div>
                </div>
              </div>

              <div className="text-gray-500 flex items-center gap-2">
                <Calendar size={18} />
                {currentDate}
              </div>
            </div>

            <div className="w-full lg:w-80">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                    <UserCheck size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-xl">{user.name}</div>
                    <div className="text-base text-gray-500">{user.email}</div>
                    <div className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {user.mbaExam} Aspirant
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <FeatureCard
            icon={
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-3 border-2 border-blue-200">
                <FileUp size={34} className="text-white" />
              </div>
            }
            title={<span className="font-bold text-blue-700 text-lg">Resume Parser</span>}
            description={
              <span className="text-blue-500 font-medium">
                AI-Powered Analysis of your <span className="font-semibold underline decoration-blue-300/60">resume</span> and background
              </span>
            }
            delay={200}
            onClick={() => navigate('/resume-parser')}
          />
          <FeatureCard
            icon={
              <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl p-3 border-2 border-purple-200">
                <Brain size={34} className="text-white" />
              </div>
            }
            title={<span className="font-bold text-purple-700 text-lg">AI Quiz</span>}
            description={
              <span className="text-purple-500 font-medium">
                Interactive <span className="font-semibold underline decoration-pink-300/60">Learning</span> with personalized questions
              </span>
            }
            delay={300}
            onClick={() => navigate('/ai-quiz')}
          />
          <FeatureCard
            icon={
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-3 border-2 border-yellow-200">
                <PenTool size={34} className="text-white" />
              </div>
            }
            title={<span className="font-bold text-yellow-700 text-lg">Written Test</span>}
            description={
              <span className="text-yellow-500 font-medium">
                Essay <span className="font-semibold underline decoration-yellow-300/60">Practice</span> and analysis
              </span>
            }
            delay={400}
            onClick={() => navigate('/essay-writing')}
          />
          <FeatureCard
            icon={
              <div className="bg-gradient-to-br from-teal-400 to-blue-400 rounded-xl p-3 border-2 border-teal-200">
                <Video size={34} className="text-white" />
              </div>
            }
            title={<span className="font-bold text-teal-700 text-lg">Video Interview</span>}
            description={
              <span className="text-teal-500 font-medium">
                Practice <span className="font-semibold underline decoration-teal-300/60">Interviews</span> with AI feedback
              </span>
            }
            delay={500}
            onClick={() => navigate('/mba-interview')}
          />
        </div>

        {/* Progress Trend + League & Reports */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-2">
                  <ChartLine className="text-blue-600" size={24} />
                  Essay Performance Over Time
                </h5>
                <p className="text-gray-600">Your scores across Content Quality, Structure, and Language for each attempt</p>
              </div>
              <button 
                onClick={downloadReport}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                Download Report
              </button>
            </div>
            
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-4">
                <Trophy className="text-amber-500" size={24} />
                Your League
              </h5>
              <div className="p-5 rounded-xl bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 text-white shadow-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${leagueData.league.color} 0%, ${leagueData.league.color}dd 100%)` }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl border-2 border-white/30">
                    {leagueData.league.icon}
                  </div>
                  <div>
                    <div className="font-bold text-2xl">{leagueData.league.name} League</div>
                    <div className="text-sm opacity-90 flex items-center gap-1">
                      <Star size={16} />
                      {Math.floor(leagueData.league_score)}% League Score
                    </div>
                  </div>
                </div>

                <div className="relative bg-white/15 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Next: {leagueData.next_league.name} League</span>
                    <span className="text-right text-xs">
                      {leagueData.next_league.min_score}%{leagueData.next_league.min_attempts ? <><br/><span className="opacity-75">({leagueData.next_league.min_attempts} attempts)</span></> : ''}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-800/40 rounded-full overflow-hidden">
                    <div 
                      className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${leagueData.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs opacity-90">{leagueData.progress}% Complete</div>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {Math.max(0, leagueData.next_league.min_score - leagueData.league_score)}% to go
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-4">
                <BarChart3 className="text-blue-600" size={24} />
                Quick Stats
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Improvement</span>
                  <span className="text-lg font-bold text-green-600">{stats.improvement}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Current Streak</span>
                  <span className="text-lg font-bold text-green-600">{stats.streak} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Quizzes</span>
                  <span className="text-lg font-bold text-amber-600">{stats.totalQuizzes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl shadow-2xl border-4 border-blue-700 flex flex-col items-center justify-center min-h-[340px] p-0">
            <button
              className="flex flex-col items-center justify-center w-full h-full py-10 bg-blue-600 hover:bg-blue-700 transition-all duration-300 rounded-2xl shadow-2xl group border-b-4 border-blue-900"
              style={{ minHeight: 240 }}
              onClick={() => navigate('/learning-hub')}
              type="button"
              aria-label="Go to Learning Hub"
            >
              <span className="flex items-center gap-3 mb-5">
                <ArrowRight size={48} className="text-white drop-shadow-lg group-hover:translate-x-2 transition-all duration-300" />
                <span className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide">
                  Go to Learning Hub
                </span>
              </span>
              <span className="text-lg text-white/90 font-semibold">Jump into learning. Your personalized resource hub.</span>
              <span className="mt-6 flex flex-col items-center w-full gap-2">
                <span className="text-white/70 text-base flex items-center gap-2">
                  <TargetIcon className="text-red-300" size={18} />
                  Improve your <span className="font-bold ml-1">{stats.weakestTopic}</span>
                </span>
                <span className="text-xs text-white/60 mt-1">Focus on this area for better results</span>
                <span className="text-white/70 text-base flex items-center gap-2 mt-3">
                  <Star className="text-green-300" size={18} />
                  Keep up your strength in <span className="font-bold ml-1">{stats.strongestTopic}</span>
                </span>
                <span className="text-xs text-white/60 mt-1">Keep up the excellent work!</span>
              </span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2 mb-4">
              <PieChart className="text-purple-600" size={24} />
              Weekly Progress
            </h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Quizzes This Week</span>
                  <span className="font-bold text-gray-800">{stats.streak}/{stats.weeklyTarget}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="text-xs font-semibold text-blue-700 mb-2">STUDY TIME THIS WEEK</div>
                <div className="text-2xl font-bold text-blue-900">12.5 hrs</div>
                <div className="text-xs text-blue-600 mt-1">+2.5 hrs from last week</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">{stats.avgScore}%</div>
                  <div className="text-xs text-gray-600 mt-1">Avg Score</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{stats.chaptersAttempted}</div>
                  <div className="text-xs text-gray-600 mt-1">Chapters</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                <Lightbulb className="text-yellow-500" size={24} />
                Personalized Recommendations
              </h5>
              <p className="text-gray-600 mt-1">Based on your recent performance</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <div key={rec.id} className="group p-6 rounded-xl bg-gradient-to-br hover:shadow-lg transition-all border border-gray-200 hover:scale-105 duration-300 cursor-pointer">
                <div className={`w-12 h-12 bg-gradient-to-br ${rec.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {rec.icon}
                </div>
                <div className="font-bold text-gray-800 mb-2">{rec.title}</div>
                <div className="text-sm text-gray-600">{rec.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MBA News & Updates */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h5 className="font-bold text-gray-800 text-xl flex items-center gap-2">
              <Newspaper className="text-blue-600" size={24} />
              MBA News & Updates
            </h5>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Latest</span>
          </div>
          <div className="space-y-4">
            {mbaNews.map(news => (
              <div key={news.id} className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-bold text-gray-800">{news.title}</div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      news.badge === 'Important' ? 'bg-red-100 text-red-700' :
                      news.badge === 'Update' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {news.badge}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{news.description}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {news.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}