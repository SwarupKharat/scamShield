import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText,
  User,
  MessageSquare,
  Edit
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AuthorityDashboard = () => {
  const { authUser, authRole } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [assignedIncidents, setAssignedIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [feedbackData, setFeedbackData] = useState([]);

  useEffect(() => {
    if (authRole === 'authority') {
      fetchDashboardData();
    }
  }, [authRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch authority dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/authority/dashboard', {
        credentials: 'include'
      });
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch assigned incidents
      const assignedResponse = await fetch('http://localhost:5000/api/authority/assigned-incidents', {
        credentials: 'include'
      });
      const assignedData = await assignedResponse.json();
      
      if (assignedData.success) {
        setAssignedIncidents(assignedData.incidents || []);
      }

      // Fetch all incidents
      const allIncidentsResponse = await fetch('http://localhost:5000/api/authority/view-incidents', {
        credentials: 'include'
      });
      const allIncidentsData = await allIncidentsResponse.json();
      
      if (allIncidentsData.success) {
        setAllIncidents(allIncidentsData.data || []);
      }

      // Fetch feedback data
      const feedbackResponse = await fetch('http://localhost:5000/api/authority/feedback', {
        credentials: 'include'
      });
      const feedbackData = await feedbackResponse.json();
      
      if (feedbackData.success) {
        setFeedbackData(feedbackData.feedback || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIncident = async (incidentId) => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/authority/update-incident/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message: message })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('');
        setSelectedIncident(null);
        fetchDashboardData();
        alert('Incident updated successfully!');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Error updating incident');
    }
  };

  const handleStatusUpdate = async (incidentId) => {
    if (!status) {
      alert('Please select a status');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/authority/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ incidentId, status })
      });

      const data = await response.json();
      if (data.success) {
        setStatus('');
        fetchDashboardData();
        alert('Status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleMarkAsResolved = async (incidentId) => {
    if (window.confirm('Are you sure you want to mark this incident as resolved?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/authority/mark-solved/${incidentId}`, {
          method: 'PUT',
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          fetchDashboardData();
          alert('Incident marked as resolved!');
        }
      } catch (error) {
        console.error('Error marking incident as resolved:', error);
        alert('Error marking incident as resolved');
      }
    }
  };

  if (authRole !== 'authority') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the authority dashboard.</p>
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

  const pieData = {
    labels: ['Resolved', 'In Progress', 'Pending'],
    datasets: [{
      data: [
        stats?.resolvedCount || 0,
        stats?.inProgressCount || 0,
        stats?.pendingCount || 0
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
    }],
  };

  const barData = {
    labels: ['Total Assigned', 'Resolved', 'In Progress', 'Pending'],
    datasets: [{
      label: 'Count',
      data: [
        stats?.totalAssigned || 0,
        stats?.resolvedCount || 0,
        stats?.inProgressCount || 0,
        stats?.pendingCount || 0
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Authority Dashboard</h1>
          <p className="text-gray-600">Welcome back, {authUser?.firstName}!</p>
        </motion.div>

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
                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalAssigned || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.resolvedCount || 0}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.inProgressCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.resolutionRate || 0}%</p>
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
                { id: 'assigned', label: 'My Assigned Incidents', icon: FileText },
                { id: 'all', label: 'All Incidents', icon: AlertTriangle },
                { id: 'feedback', label: 'User Feedback', icon: MessageSquare }
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
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">My Incident Status Distribution</h3>
                  <div className="h-64">
                    <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">My Statistics</h3>
                  <div className="h-64">
                    <Bar 
                      data={barData} 
                      options={{ 
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Assigned Incidents Tab */}
            {activeTab === 'assigned' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold mb-4">My Assigned Incidents</h3>
                {assignedIncidents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No assigned incidents</p>
                ) : (
                  <div className="space-y-4">
                    {assignedIncidents.map((incident) => (
                      <div key={incident._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{incident.title}</h4>
                            <p className="text-gray-600 text-sm">{incident.description}</p>
                            <p className="text-gray-500 text-xs mt-2">
                              Reported by: {incident.reportedBy?.firstName} {incident.reportedBy?.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Location: {incident.location}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Severity: {incident.severity}
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
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(incident.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedIncident(incident)}
                            className="btn btn-sm btn-primary"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Add Message
                          </button>
                          
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="select select-sm select-bordered"
                          >
                            <option value="">Update Status</option>
                            <option value="reported">Reported</option>
                            <option value="under review">Under Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                          </select>
                          
                          <button
                            onClick={() => handleStatusUpdate(incident._id)}
                            className="btn btn-sm btn-warning"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Update Status
                          </button>
                          
                          <button
                            onClick={() => handleMarkAsResolved(incident._id)}
                            className="btn btn-sm btn-success"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Resolved
                          </button>
                        </div>

                        {/* Messages */}
                        {incident.messages && incident.messages.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-semibold text-sm mb-2">Messages:</h5>
                            <div className="space-y-2">
                              {incident.messages.map((msg, index) => (
                                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                  <p className="text-gray-700">{msg.text}</p>
                                  <p className="text-gray-500 text-xs">
                                    {new Date(msg.date).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* All Incidents Tab */}
            {activeTab === 'all' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold mb-4">All Incidents</h3>
                {allIncidents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No incidents found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Reporter</th>
                          <th>Status</th>
                          <th>Severity</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allIncidents.map((incident) => (
                          <tr key={incident._id}>
                            <td>{incident.title}</td>
                            <td>{incident.reportedBy?.firstName} {incident.reportedBy?.lastName}</td>
                            <td>
                              <span className={`badge ${
                                incident.status === 'resolved' ? 'badge-success' :
                                incident.status === 'under review' ? 'badge-warning' :
                                'badge-error'
                              }`}>
                                {incident.status}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                incident.severity === 'critical' ? 'badge-error' :
                                incident.severity === 'high' ? 'badge-warning' :
                                incident.severity === 'medium' ? 'badge-info' :
                                'badge-success'
                              }`}>
                                {incident.severity}
                              </span>
                            </td>
                            <td>{new Date(incident.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button
                                onClick={() => setSelectedIncident(incident)}
                                className="btn btn-sm btn-primary"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold mb-4">User Feedback</h3>
                {feedbackData.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No feedback received yet</p>
                ) : (
                  <div className="space-y-4">
                    {feedbackData.map((feedback) => (
                      <div key={feedback._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{feedback.incident?.title}</h4>
                            <p className="text-gray-600 text-sm mt-2">{feedback.text}</p>
                            <div className="flex items-center mt-2">
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-lg ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-500">
                                Rating: {feedback.rating}/5
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-2">
                              Submitted: {new Date(feedback.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Message Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Add Message to: {selectedIncident.title}
              </h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className="textarea textarea-bordered w-full h-32 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedIncident(null);
                    setMessage('');
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateIncident(selectedIncident._id)}
                  className="btn btn-primary"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard; 