import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import UploadVideoModal from '../../components/UploadVideoModal/UploadVideoModal';
import VideoCard from '../../components/VideoCard/VideoCard';
import VideoStats from '../../components/VideoStats/VideoStats';
import { toast } from 'react-hot-toast';

const VideoGallery = () => {
  const { authUser } = useAuthStore();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    scamType: '',
    region: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch videos
  const fetchVideos = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...filters
      });

      const response = await fetch(`http://localhost:5000/api/videos?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      if (data.success) {
        setVideos(data.data.videos);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    fetchVideos(page);
  };

  const handleVideoUploaded = () => {
    setShowUploadModal(false);
    fetchVideos(1);
    toast.success('Video uploaded successfully!');
  };

  const handleVideoDeleted = (videoId) => {
    setVideos(prev => prev.filter(video => video._id !== videoId));
    toast.success('Video deleted successfully!');
  };

  const handleVoteUpdate = (videoId, upvotes, downvotes) => {
    setVideos(prev => prev.map(video => 
      video._id === videoId 
        ? { ...video, votes: { ...video.votes, upvotes, downvotes } }
        : video
    ));
  };

  const scamTypes = [
    { value: '', label: 'All Scam Types' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'investment', label: 'Investment Scams' },
    { value: 'romance', label: 'Romance Scams' },
    { value: 'tech-support', label: 'Tech Support Scams' },
    { value: 'fake-calls', label: 'Fake Calls' },
    { value: 'social-media', label: 'Social Media Scams' },
    { value: 'other', label: 'Other' }
  ];

  const regions = [
    { value: '', label: 'All Regions' },
    { value: 'North', label: 'North India' },
    { value: 'South', label: 'South India' },
    { value: 'East', label: 'East India' },
    { value: 'West', label: 'West India' },
    { value: 'Central', label: 'Central India' },
    { value: 'Northeast', label: 'Northeast India' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Video Gallery</h1>
              <p className="text-gray-600 mt-2">
                Watch and share scam awareness videos from your community
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Video
            </button>
          </div>

          {/* Video Stats */}
          <VideoStats />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scam Type
              </label>
              <select
                value={filters.scamType}
                onChange={(e) => handleFilterChange('scamType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {scamTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {regions.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
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
                <option value="createdAt">Newest First</option>
                <option value="votes.upvotes">Most Upvoted</option>
                <option value="views">Most Viewed</option>
                <option value="comments">Most Comments</option>
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
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="text-gray-500 text-lg mb-2 mt-4">No videos found</div>
              <p className="text-gray-400">Be the first to upload a video!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onDelete={handleVideoDeleted}
                  onVoteUpdate={handleVoteUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let page;
                if (pagination.totalPages <= 5) {
                  page = i + 1;
                } else if (pagination.currentPage <= 3) {
                  page = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  page = pagination.totalPages - 4 + i;
                } else {
                  page = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Upload Video Modal */}
        {showUploadModal && (
          <UploadVideoModal
            onClose={() => setShowUploadModal(false)}
            onVideoUploaded={handleVideoUploaded}
          />
        )}
      </div>
    </div>
  );
};

export default VideoGallery;
