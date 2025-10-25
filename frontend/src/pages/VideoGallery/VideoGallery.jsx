import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { axiosInstance } from '../../stores/axios';
import UploadVideoModal from '../../components/UploadVideoModal/UploadVideoModal';
import VideoCard from '../../components/VideoCard/VideoCard';
import VideoStats from '../../components/VideoStats/VideoStats';
import { toast } from 'react-hot-toast';
import { BookOpen, Shield, Lock, Smartphone, CreditCard, Globe, AlertTriangle } from 'lucide-react';

const VideoGallery = () => {
  const { authUser } = useAuthStore();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    hasNext: false,
    hasPrev: false
  });

  // Educational videos data
  const educationalVideos = [
    // Password Security
    { id: 1, title: "Creating Strong Passwords", category: "password", duration: "5:30", description: "Learn how to create and manage strong passwords", videoId: "h_WZk-_TWh0" },
    { id: 2, title: "Password Manager Basics", category: "password", duration: "7:15", description: "Introduction to password managers and their benefits", videoId: "wcDtLMraTkQ" },
    { id: 3, title: "Two-Factor Authentication", category: "password", duration: "4:45", description: "Setting up and using 2FA for better security", videoId: "hGRii5f_uSc" },

    // Phishing Awareness
    { id: 4, title: "Identifying Phishing Emails", category: "phishing", duration: "6:20", description: "How to spot and avoid phishing attempts", videoId: "o0btqyGWIQw" },
    { id: 5, title: "SMS Phishing (Smishing)", category: "phishing", duration: "5:10", description: "Protecting yourself from SMS-based scams", videoId: "ZOZGQeG8avQ" },
    { id: 6, title: "Social Media Scams", category: "phishing", duration: "8:30", description: "Common scams on social media platforms", videoId: "cLoXQb5M6oI" },

    // Banking Security
    { id: 7, title: "Online Banking Safety", category: "banking", duration: "6:45", description: "Best practices for secure online banking", videoId: "F5l2BucBfKY" },
    { id: 8, title: "UPI Security Tips", category: "banking", duration: "5:25", description: "How to use UPI safely and avoid fraud", videoId: "i7DcdpKxPsA" },
    { id: 9, title: "Credit Card Fraud Prevention", category: "banking", duration: "7:00", description: "Protecting your credit card from fraud", videoId: "z19Z6ckRp-c" },

    // Mobile Security
    { id: 10, title: "Mobile App Security", category: "mobile", duration: "6:15", description: "Keeping your mobile apps secure", videoId: "A-mSTDqpMGs" },
    { id: 11, title: "Public WiFi Safety", category: "mobile", duration: "5:40", description: "Using public WiFi networks safely", videoId: "XcghUy-8VRA" },
    { id: 12, title: "Mobile Device Updates", category: "mobile", duration: "4:20", description: "Importance of keeping your device updated", videoId: "MmJRgefohcA&t=55s" },

    // Internet Safety
    { id: 13, title: "Safe Browsing Habits", category: "internet", duration: "7:30", description: "How to browse the internet safely", videoId: "aO858HyFbKI" },
    { id: 14, title: "VPN and Privacy", category: "internet", duration: "8:15", description: "Understanding VPNs and online privacy", videoId: "KioLyGgeX8&t=161s" },
    { id: 15, title: "Cookie Management", category: "internet", duration: "5:50", description: "Managing cookies for better privacy", videoId: "s04Vjlcgwco" },

    // Social Engineering
    { id: 16, title: "Social Engineering Attacks", category: "social", duration: "9:00", description: "Understanding and preventing social engineering", videoId: "uvKTMgWRPw4" },
    { id: 17, title: "Phone Scam Prevention", category: "social", duration: "6:35", description: "How to avoid phone-based scams", videoId: "SbYHbK5bO0w" },
    { id: 18, title: "Investment Scam Awareness", category: "social", duration: "8:45", description: "Recognizing and avoiding investment scams", videoId: "gPXXO4DrNPs" },

    // Data Protection
    { id: 19, title: "Data Backup Strategies", category: "data", duration: "7:20", description: "How to backup your important data", videoId: "ji0SQzpOlBw" },
    { id: 20, title: "Cloud Storage Security", category: "data", duration: "6:10", description: "Securing your cloud storage accounts", videoId: "8YY10H0HjuI" },
    { id: 21, title: "Personal Information Protection", category: "data", duration: "8:20", description: "Protecting your personal information online", videoId: "BgisJMjMCqE" },

    // Advanced Topics
    { id: 22, title: "Cryptocurrency Security", category: "advanced", duration: "10:15", description: "Securing your cryptocurrency investments", videoId: "RWywXYbx7jI" },
    { id: 23, title: "IoT Device Security", category: "advanced", duration: "7:45", description: "Securing Internet of Things devices", videoId: "7zWVxrjjIpE" },
    { id: 24, title: "Digital Forensics Basics", category: "advanced", duration: "9:30", description: "Introduction to digital forensics", videoId: "w2xItujdLag" },
    { id: 25, title: "Incident Response Planning", category: "advanced", duration: "8:50", description: "Creating an incident response plan", videoId: "X2UiMLxRdhE" }
  ];

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'password': return <Lock className="w-5 h-5" />;
      case 'phishing': return <AlertTriangle className="w-5 h-5" />;
      case 'banking': return <CreditCard className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'internet': return <Globe className="w-5 h-5" />;
      case 'social': return <Shield className="w-5 h-5" />;
      case 'data': return <BookOpen className="w-5 h-5" />;
      case 'advanced': return <Shield className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'password': return 'bg-blue-100 text-blue-800';
      case 'phishing': return 'bg-red-100 text-red-800';
      case 'banking': return 'bg-green-100 text-green-800';
      case 'mobile': return 'bg-purple-100 text-purple-800';
      case 'internet': return 'bg-orange-100 text-orange-800';
      case 'social': return 'bg-yellow-100 text-yellow-800';
      case 'data': return 'bg-indigo-100 text-indigo-800';
      case 'advanced': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'password', label: 'Password Security' },
    { value: 'phishing', label: 'Phishing Awareness' },
    { value: 'banking', label: 'Banking Security' },
    { value: 'mobile', label: 'Mobile Security' },
    { value: 'internet', label: 'Internet Safety' },
    { value: 'social', label: 'Social Engineering' },
    { value: 'data', label: 'Data Protection' },
    { value: 'advanced', label: 'Advanced Topics' }
  ];

  const filteredVideos = educationalVideos.filter(video =>
    filters.category === '' || video.category === filters.category
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
                Digital Hygiene Education
              </h1>
              <p className="text-gray-600 mt-2">
                Learn essential digital security practices through comprehensive video tutorials
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-blue-900">Why Digital Hygiene Matters</h2>
            </div>
            <p className="text-blue-800">
              Digital hygiene is the practice of maintaining good security habits online. Our comprehensive video library
              covers everything from basic password security to advanced threat protection, helping you stay safe in the digital world.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="title">Title A-Z</option>
                <option value="duration">Duration</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => (
                <div key={video.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 rounded-t-lg relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      className="w-full h-full rounded-t-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(video.category)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(video.category)}`}>
                          {categories.find(cat => cat.value === video.category)?.label || video.category}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {video.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Duration: {video.duration}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Watch Now →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
