import React, { useState, useEffect } from 'react';

const VideoStats = () => {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalDuration: 0,
    scamTypeStats: [],
    regionStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/videos/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatScamType = (scamType) => {
    return scamType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Videos */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalVideos}
          </div>
          <div className="text-sm text-gray-600">Total Videos</div>
        </div>

        {/* Total Views */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.totalViews.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>

        {/* Total Duration */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatDuration(stats.totalDuration)}
          </div>
          <div className="text-sm text-gray-600">Total Duration</div>
        </div>
      </div>

      {/* Scam Type Distribution */}
      {stats.scamTypeStats.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Scam Type Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.scamTypeStats.slice(0, 4).map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.count}
                </div>
                <div className="text-xs text-gray-600">
                  {formatScamType(stat._id)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Distribution */}
      {stats.regionStats.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Regional Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.regionStats.slice(0, 6).map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.count}
                </div>
                <div className="text-xs text-gray-600">
                  {stat._id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStats;
