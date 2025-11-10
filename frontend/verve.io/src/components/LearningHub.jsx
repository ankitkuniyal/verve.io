import React, { useState } from 'react';
import { ArrowLeft, Play, Book, FileText, ExternalLink, Clock, Users, Star, Search, Filter, ThumbsUp, Download, Share2, Bookmark, Eye } from 'lucide-react';

const LearningHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [savedResources, setSavedResources] = useState([]);
  const [viewedResources, setViewedResources] = useState([]);

  const learningResources = [
    {
      id: 1,
      title: "MBA Interview Preparation - Complete Guide",
      type: "video",
      category: "interview",
      difficulty: "beginner",
      duration: "45:18",
      source: "YouTube",
      author: "MBA Crystal Ball",
      rating: 4.8,
      views: "125K",
      thumbnail: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=abc123",
      description: "Comprehensive guide covering common MBA interview questions, body language tips, and success strategies.",
      likes: "2.5K",
      uploadDate: "2 months ago"
    },
    {
      id: 2,
      title: "Quantitative Aptitude Masterclass for CAT 2024",
      type: "video",
      category: "quant",
      difficulty: "intermediate",
      duration: "1:28:32",
      source: "YouTube",
      author: "Rodha",
      rating: 4.9,
      views: "356K",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=quant123",
      description: "Complete quantitative aptitude course covering arithmetic, algebra, geometry with shortcuts and tricks.",
      likes: "15K",
      uploadDate: "3 weeks ago"
    },
    {
      id: 3,
      title: "Case Study Analysis Framework for Consulting",
      type: "video",
      category: "case-study",
      difficulty: "advanced",
      duration: "1:15:42",
      source: "YouTube",
      author: "Consulting Prep",
      rating: 4.9,
      views: "267K",
      thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=case123",
      description: "Learn how to structure and solve business case studies for consulting interviews with real examples.",
      likes: "12K",
      uploadDate: "1 month ago"
    },
    {
      id: 4,
      title: "Leadership Principles for B-School Success",
      type: "article",
      category: "leadership",
      difficulty: "intermediate",
      duration: "15 min read",
      source: "Harvard Business Review",
      author: "Dr. Sarah Chen",
      rating: 4.7,
      views: "142K",
      thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop",
      url: "https://hbr.org/leadership-principles-mba",
      description: "Essential leadership concepts and frameworks every MBA student should master for career success.",
      likes: "8.4K",
      uploadDate: "2 weeks ago"
    },
    {
      id: 5,
      title: "Data Interpretation Tricks & Shortcuts",
      type: "video",
      category: "quant",
      difficulty: "intermediate",
      duration: "55:27",
      source: "YouTube",
      author: "DI Wizard",
      rating: 4.5,
      views: "293K",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=di123",
      description: "Master data interpretation with these proven techniques and time-saving methods for competitive exams.",
      likes: "11K",
      uploadDate: "2 months ago"
    },
    {
      id: 6,
      title: "Business School Application Essays That Work",
      type: "article",
      category: "essay",
      difficulty: "advanced",
      duration: "12 min read",
      source: "Poets & Quants",
      author: "Admissions Expert",
      rating: 4.8,
      views: "178K",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
      url: "https://poetsandquants.com/essay-guide",
      description: "Learn how to craft compelling essays that stand out in competitive MBA applications with real examples.",
      likes: "9.2K",
      uploadDate: "5 days ago"
    },
    {
      id: 7,
      title: "Verbal Ability Crash Course - CAT 2024",
      type: "video",
      category: "verbal",
      difficulty: "beginner",
      duration: "1:10:15",
      source: "YouTube",
      author: "Verbal Master",
      rating: 4.4,
      views: "210K",
      thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=verbal123",
      description: "Complete verbal ability preparation covering grammar, comprehension, vocabulary and reading techniques.",
      likes: "8.7K",
      uploadDate: "3 weeks ago"
    },
    {
      id: 8,
      title: "Financial Accounting Basics for MBA Students",
      type: "article",
      category: "finance",
      difficulty: "beginner",
      duration: "18 min read",
      source: "Wall Street Prep",
      author: "Finance Pro",
      rating: 4.6,
      views: "156K",
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop",
      url: "https://www.wallstreetprep.com/mba-accounting",
      description: "Fundamental accounting principles and financial statement analysis tailored for MBA students.",
      likes: "7.3K",
      uploadDate: "1 week ago"
    },
    {
      id: 9,
      title: "GDPI Preparation - Group Discussion Tips",
      type: "video",
      category: "interview",
      difficulty: "intermediate",
      duration: "38:45",
      source: "YouTube",
      author: "Crack GDPI",
      rating: 4.7,
      views: "189K",
      thumbnail: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=gdpi123",
      description: "Master group discussion techniques, body language, and communication skills for MBA admissions.",
      likes: "9.8K",
      uploadDate: "1 month ago"
    },
    {
      id: 10,
      title: "Logical Reasoning Made Easy",
      type: "video",
      category: "logic",
      difficulty: "intermediate",
      duration: "1:05:33",
      source: "YouTube",
      author: "LR Expert",
      rating: 4.6,
      views: "234K",
      thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=lr123",
      description: "Systematic approach to logical reasoning problems with practice exercises and shortcuts.",
      likes: "10.5K",
      uploadDate: "2 weeks ago"
    },
    {
      id: 11,
      title: "Resume Building for Top B-Schools",
      type: "article",
      category: "resume",
      difficulty: "intermediate",
      duration: "20 min read",
      source: "MBA Mission",
      author: "Career Coach",
      rating: 4.8,
      views: "134K",
      thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=225&fit=crop",
      url: "https://www.mbamission.com/resume-guide",
      description: "Create impactful resumes that highlight your achievements and stand out to admissions committees.",
      likes: "6.9K",
      uploadDate: "3 days ago"
    },
    {
      id: 12,
      title: "Time Management Strategies for MBA Prep",
      type: "video",
      category: "strategy",
      difficulty: "beginner",
      duration: "42:19",
      source: "YouTube",
      author: "Study Smart",
      rating: 4.5,
      views: "167K",
      thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=225&fit=crop",
      url: "https://www.youtube.com/watch?v=time123",
      description: "Effective time management techniques and study schedules for efficient MBA preparation.",
      likes: "7.2K",
      uploadDate: "4 weeks ago"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', count: learningResources.length, icon: '📚' },
    { id: 'interview', name: 'Interview Prep', count: learningResources.filter(r => r.category === 'interview').length, icon: '💼' },
    { id: 'quant', name: 'Quantitative', count: learningResources.filter(r => r.category === 'quant').length, icon: '🔢' },
    { id: 'verbal', name: 'Verbal Ability', count: learningResources.filter(r => r.category === 'verbal').length, icon: '📝' },
    { id: 'case-study', name: 'Case Studies', count: learningResources.filter(r => r.category === 'case-study').length, icon: '📊' },
    { id: 'leadership', name: 'Leadership', count: learningResources.filter(r => r.category === 'leadership').length, icon: '🌟' },
    { id: 'essay', name: 'Essay Writing', count: learningResources.filter(r => r.category === 'essay').length, icon: '✍️' },
    { id: 'finance', name: 'Finance', count: learningResources.filter(r => r.category === 'finance').length, icon: '💰' },
    { id: 'logic', name: 'Logical Reasoning', count: learningResources.filter(r => r.category === 'logic').length, icon: '🧠' },
    { id: 'resume', name: 'Resume Building', count: learningResources.filter(r => r.category === 'resume').length, icon: '📄' },
    { id: 'strategy', name: 'Strategy', count: learningResources.filter(r => r.category === 'strategy').length, icon: '🎯' }
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels', color: 'slate' },
    { id: 'beginner', name: 'Beginner', color: 'green' },
    { id: 'intermediate', name: 'Intermediate', color: 'blue' },
    { id: 'advanced', name: 'Advanced', color: 'purple' }
  ];

  const featuredChannels = [
    {
      name: "MBA Crystal Ball",
      subscribers: "450K",
      videos: "280+",
      description: "Comprehensive MBA guidance and interview prep",
      url: "https://youtube.com/@MBACrystalBall"
    },
    {
      name: "Rodha",
      subscribers: "1.2M",
      videos: "150+",
      description: "Quantitative aptitude and CAT preparation",
      url: "https://youtube.com/@Rodha"
    },
    {
      name: "Consulting Prep",
      subscribers: "320K",
      videos: "95+",
      description: "Case study and consulting interview preparation",
      url: "https://youtube.com/@ConsultingPrep"
    },
    {
      name: "Verbal Master",
      subscribers: "280K",
      videos: "120+",
      description: "Verbal ability and reading comprehension",
      url: "https://youtube.com/@VerbalMaster"
    }
  ];

  const filteredResources = learningResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleSaveResource = (resourceId) => {
    setSavedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const markAsViewed = (resourceId) => {
    if (!viewedResources.includes(resourceId)) {
      setViewedResources(prev => [...prev, resourceId]);
    }
  };

  const openResource = (resource) => {
    markAsViewed(resource.id);
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const getTypeIcon = (type) => {
    return type === 'video' ? Play : FileText;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-500 to-emerald-600';
      case 'intermediate': return 'from-blue-500 to-indigo-600';
      case 'advanced': return 'from-purple-500 to-pink-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'interview': return 'bg-blue-100 text-blue-700';
      case 'quant': return 'bg-green-100 text-green-700';
      case 'verbal': return 'bg-purple-100 text-purple-700';
      case 'case-study': return 'bg-amber-100 text-amber-700';
      case 'leadership': return 'bg-red-100 text-red-700';
      case 'essay': return 'bg-indigo-100 text-indigo-700';
      case 'finance': return 'bg-emerald-100 text-emerald-700';
      case 'logic': return 'bg-pink-100 text-pink-700';
      case 'resume': return 'bg-cyan-100 text-cyan-700';
      case 'strategy': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Personalized Learning Resources 
              </h1>
              <p className="text-lg text-slate-500 mt-2">
                Curated collection of videos, articles, and materials to ace your MBA preparation
              </p>
            </div>
            {/* Add this Back to Dashboard button */}
    <div className="flex justify-end mb-6">
      <a 
        href="/dashboard"
        className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-2 text-sm font-medium border border-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </a>
    </div>

            
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex flex-wrap justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold">12+</div>
              <div className="text-sm opacity-90">Hours of Content</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1.5M+</div>
              <div className="text-sm opacity-90">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">98%</div>
              <div className="text-sm opacity-90">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm opacity-90">Available</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search resources, authors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name} ({category.count})
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Filters */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {filteredResources.map(resource => {
            const TypeIcon = getTypeIcon(resource.type);
            const isSaved = savedResources.includes(resource.id);
            const isViewed = viewedResources.includes(resource.id);
            
            return (
              <div
                key={resource.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:scale-105 group ${
                  isViewed ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                      {resource.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className={`bg-gradient-to-r ${getDifficultyColor(resource.difficulty)} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                      {resource.difficulty}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <TypeIcon size={14} />
                      {resource.type === 'video' ? resource.duration : resource.duration}
                    </div>
                  </div>
                  {isViewed && (
                    <div className="absolute bottom-3 right-3">
                      <Eye className="text-green-500" size={16} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {resource.type === 'video' ? resource.duration : resource.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {resource.views}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">{resource.author}</span>
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400" size={14} />
                        <span className="text-slate-700 font-medium">{resource.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{resource.uploadDate}</span>
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={12} />
                        <span>{resource.likes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openResource(resource)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow group/btn"
                    >
                      {resource.type === 'video' ? (
                        <>
                          <Play size={18} />
                          Watch Now
                        </>
                      ) : (
                        <>
                          <Book size={18} />
                          Read Article
                        </>
                      )}
                      <ExternalLink size={16} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                    
                    <button
                      onClick={() => toggleSaveResource(resource.id)}
                      className={`p-3 rounded-xl transition-all ${
                        isSaved 
                          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No resources found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Featured YouTube Channels */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Play className="text-red-500" size={24} />
            Featured YouTube Channels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredChannels.map((channel, index) => (
              <a
                key={index}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-50 rounded-xl p-4 hover:bg-red-50 transition-all border border-slate-200 hover:border-red-200 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {channel.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-red-600">{channel.name}</div>
                    <div className="text-xs text-slate-500">{channel.subscribers} subscribers</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 mb-2">{channel.description}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Play size={12} />
                  {channel.videos} videos
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Learning Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-slate-800 mb-4">💡 Learning Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="font-semibold text-slate-800 mb-2">Set Daily Goals</div>
              <div className="text-sm text-slate-600">Aim to complete 1-2 resources daily for consistent progress</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="font-semibold text-slate-800 mb-2">Take Notes</div>
              <div className="text-sm text-slate-600">Jot down key points and formulas for quick revision</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="font-semibold text-slate-800 mb-2">Practice Regularly</div>
              <div className="text-sm text-slate-600">Apply learned concepts through mock tests and exercises</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;