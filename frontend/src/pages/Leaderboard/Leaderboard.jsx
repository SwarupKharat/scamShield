import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Award,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { axiosInstance } from '../../stores/axios';
import { toast } from 'react-hot-toast';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [userRank, setUserRank] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const filters = [
    { key: 'all', label: 'All Users', color: 'bg-gray-500' },
    { key: 'Bronze', label: 'Bronze', color: 'bg-amber-600' },
    { key: 'Silver', label: 'Silver', color: 'bg-gray-400' },
    { key: 'Gold', label: 'Gold', color: 'bg-yellow-500' },
    { key: 'Platinum', label: 'Platinum', color: 'bg-blue-500' },
    { key: 'Diamond', label: 'Diamond', color: 'bg-purple-500' },
  ];

  useEffect(() => {
    fetchLeaderboard();
    fetchUserPoints();
  }, [currentPage, filter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/points/leaderboard?page=${currentPage}&limit=50`);

      if (response.data.success) {
        setLeaderboard(response.data.data.leaderboard || []);
        setTotalPages(response.data.data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch leaderboard');
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await axiosInstance.get('/points/user-points');

      if (response.data.success) {
        setUserPoints(response.data.data.userPoints);
        setUserRank(response.data.data.rank);
        setCurrentUserId(response.data.data.userPoints?.userId);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getLevelColor = (level) => {
    const colors = {
      'Bronze': 'bg-amber-600',
      'Silver': 'bg-gray-400',
      'Gold': 'bg-yellow-500',
      'Platinum': 'bg-blue-500',
      'Diamond': 'bg-purple-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  const getLevelIcon = (level) => {
    if (level === 'Diamond') return <Crown className="w-4 h-4" />;
    if (level === 'Platinum') return <Star className="w-4 h-4" />;
    if (level === 'Gold') return <Trophy className="w-4 h-4" />;
    if (level === 'Silver') return <Medal className="w-4 h-4" />;
    return <Award className="w-4 h-4" />;
  };

  const filteredLeaderboard = leaderboard.filter(user => {
    const matchesFilter = filter === 'all' || user.level === filter;
    const matchesSearch = searchTerm === '' || 
      user.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderUserCard = (user, index) => {
    const rank = (currentPage - 1) * 50 + index + 1;
    const isCurrentUser = user.userId?._id === currentUserId;
    
    return (
      <div 
        key={user._id}
        className={`bg-white rounded-xl shadow-lg p-6 mb-4 transition-all duration-300 hover:shadow-xl ${
          isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg">
              {getRankIcon(rank)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {user.userId?.firstName} {user.userId?.lastName}
                </h3>
                {isCurrentUser && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{user.userId?.email}</p>
              
              <div className="flex items-center space-x-2 mt-2">
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-white text-xs font-semibold ${getLevelColor(user.level)}`}>
                  {getLevelIcon(user.level)}
                  <span>{user.level}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">{user.totalPoints} points</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              {user.totalPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">points</div>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const showPages = 5;
      
      if (totalPages <= showPages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= showPages; i++) {
            pages.push(i);
          }
        } else if (currentPage >= totalPages - 2) {
          for (let i = totalPages - showPages + 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          for (let i = currentPage - 2; i <= currentPage + 2; i++) {
            pages.push(i);
          }
        }
      }
      
      return pages;
    };

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-2">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg">Compete with other users and climb the ranks!</p>
        </div>

        {/* User Stats */}
        {userPoints && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Your Stats</h3>
                  <p className="text-gray-600">Keep contributing to earn more points!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{userPoints.totalPoints || 0}</div>
                <div className="text-sm text-gray-600">points</div>
                <div className="text-sm text-gray-500">Rank #{userRank || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Level Filter */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.key}
                  onClick={() => setFilter(filterItem.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    filter === filterItem.key
                      ? `${filterItem.color} text-white shadow-lg`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filterItem.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Top Contributors</h2>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span>{filteredLeaderboard.length} users</span>
            </div>
          </div>

          {filteredLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              {filteredLeaderboard.map((user, index) => renderUserCard(user, index))}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
