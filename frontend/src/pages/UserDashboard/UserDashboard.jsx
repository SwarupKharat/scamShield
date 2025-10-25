import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText,
  MessageSquare,
  Star,
  Plus,
  Users,
  Trophy,
  Award,
  Crown
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const UserDashboard = () => {
  const { authUser, authRole, getUserIncidents } = useAuthStore();
  const [userIncidents, setUserIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userPoints, setUserPoints] = useState(null);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    if (authRole === 'user') {
      fetchUserData();
    }
  }, [authRole]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const incidents = await getUserIncidents();
      setUserIncidents(incidents);
      await fetchUserPoints();
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/points/user-points`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.data.userPoints);
        setUserRank(data.data.rank);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const handleSubmitFeedback = async (incidentId) => {
    if (!feedback.trim()) {
      alert('Please enter feedback');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          incidentId,
          feedback,
          rating
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Feedback submitted successfully!');
        setFeedback('');
        setRating(5);
        setShowFeedbackModal(false);
        setSelectedIncident(null);
        fetchUserData(); // Refresh data
      } else {
        alert(data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  if (authRole !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the user dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const stats = {
    totalIncidents: userIncidents.length,
    resolvedIncidents: userIncidents.filter(i => i.status === 'resolved').length,
    inProgressIncidents: userIncidents.filter(i => i.status === 'under review').length,
    openIncidents: userIncidents.filter(i => i.status === 'reported').length
  };

  const pieData = {
    labels: ['Resolved', 'In Progress', 'Open'],
    datasets: [{
      data: [
        stats.resolvedIncidents,
        stats.inProgressIncidents,
        stats.openIncidents
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
    }],
  };

  const barData = {
    labels: ['Total', 'Resolved', 'In Progress', 'Open'],
    datasets: [{
      label: 'Count',
      data: [
        stats.totalIncidents,
        stats.resolvedIncidents,
        stats.inProgressIncidents,
        stats.openIncidents
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    }],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Dashboard</h1>
          <p className="text-gray-600">Welcome back, {authUser?.firstName}!</p>
        </motion.div>

        {/* Points Display */}
        {userPoints && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your Points & Rank</h3>
                  <p className="text-white text-opacity-90">Keep contributing to earn more points!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">{userPoints.totalPoints}</div>
                <div className="text-white text-opacity-90">points</div>
                <div className="text-sm text-white text-opacity-80">Rank #{userRank}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">{userPoints.level}</span>
              </div>
              <Link to="/leaderboard" className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all">
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openIncidents}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'report', label: 'Report Incident', icon: Plus },
                { id: 'incidents', label: 'My Incidents', icon: FileText },
                { id: 'community', label: 'Community', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Incident Status Distribution</h3>
                    <div className="bg-white p-4 rounded-lg">
                      <Pie data={pieData} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Incident Statistics</h3>
                    <div className="bg-white p-4 rounded-lg">
                      <Bar data={barData} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Report Incident Tab */}
            {activeTab === 'report' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-4">Report a New Incident</h3>
                  <p className="text-gray-600 mb-6">Click the button below to report a new incident</p>
                  <Link to="/report" className="btn btn-primary btn-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Report Incident
                  </Link>
                </div>
              </motion.div>
            )}

            {/* My Incidents Tab */}
            {activeTab === 'incidents' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold mb-4">My Incidents</h3>
                {userIncidents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No incidents reported yet</p>
                    <Link to="/report" className="btn btn-primary mt-4">
                      Report Your First Incident
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userIncidents.map((incident) => (
                      <div key={incident._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{incident.title}</h4>
                            <p className="text-gray-600 text-sm">{incident.description}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              Location: {incident.location}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Severity: {incident.severity}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Reported: {new Date(incident.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <span className={`badge ${
                              incident.status === 'resolved' ? 'badge-success' :
                              incident.status === 'under review' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {incident.status}
                            </span>
                            {incident.status === 'resolved' && !incident.feedback && (
                              <button
                                onClick={() => {
                                  setSelectedIncident(incident);
                                  setShowFeedbackModal(true);
                                }}
                                className="btn btn-sm btn-outline mt-2"
                              >
                                <Star className="w-4 h-4 mr-1" />
                                Give Feedback
                              </button>
                            )}
                            {incident.feedback && (
                              <div className="mt-2">
                                <span className="badge badge-info">Feedback Submitted</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Community Tab */}
            {activeTab === 'community' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-4">Join the Community</h3>
                  <p className="text-gray-600 mb-6">
                    Share your scam experiences, get advice from others, and help build a safer community.
                  </p>
                  <div className="space-y-4">
                    <Link to="/community" className="btn btn-primary btn-lg w-full max-w-xs">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Visit Community Forum
                    </Link>
                    <p className="text-sm text-gray-500">
                      Connect with others who have faced similar scams and learn from their experiences.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && selectedIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Provide Feedback</h3>
              <p className="text-gray-600 mb-4">
                How would you rate the resolution of "{selectedIncident.title}"?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="4"
                  placeholder="Share your experience with the incident resolution..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedIncident(null);
                    setFeedback('');
                    setRating(5);
                  }}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitFeedback(selectedIncident._id)}
                  className="btn btn-primary flex-1"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
