import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { motion } from 'framer-motion';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  UserCheck,
  UserX,
  FileText,
  Bell
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const AdminDashboard = () => {
  const { authUser, authRole } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (authRole === 'admin') {
      fetchDashboardData();
    }
  }, [authRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        credentials: 'include'
      });
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.stats);
        setRecentIncidents(statsData.recentIncidents || []);
      }

      // Fetch pending registrations
      const registrationsResponse = await fetch('http://localhost:5000/api/admin/view-registrations', {
        credentials: 'include'
      });
      const registrationsData = await registrationsResponse.json();
      
      if (registrationsData.success) {
        setPendingRegistrations(registrationsData.users || []);
      }

      // Fetch all users
      const usersResponse = await fetch('http://localhost:5000/api/admin/all-users', {
        credentials: 'include'
      });
      const usersData = await usersResponse.json();
      
      if (usersData.success) {
        setAllUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserApproval = async (userId, approved) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/verify/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approval: approved })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error handling user approval:', error);
    }
  };

  const handleUserRemoval = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/remove-user/${userId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error removing user:', error);
      }
    }
  };

  if (authRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
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
    labels: ['Resolved', 'In Progress', 'Open'],
    datasets: [{
      data: [
        stats?.resolvedIncidents || 0,
        stats?.inProgressIncidents || 0,
        stats?.openIncidents || 0
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
    }],
  };

  const barData = {
    labels: ['Total Users', 'Pending Registrations', 'Total Incidents', 'Resolved'],
    datasets: [{
      label: 'Count',
      data: [
        stats?.totalUsers || 0,
        stats?.pendingRegistrations || 0,
        stats?.totalIncidents || 0,
        stats?.resolvedIncidents || 0
      ],
      backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444', '#10B981'],
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
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
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingRegistrations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalIncidents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
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
                { id: 'registrations', label: 'Pending Registrations', icon: UserCheck },
                { id: 'users', label: 'All Users', icon: Users },
                { id: 'incidents', label: 'Manage Incidents', icon: FileText }
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
                  <h3 className="text-lg font-semibold mb-4">Incident Status Distribution</h3>
                  <div className="h-64">
                    <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
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

            {/* Pending Registrations Tab */}
            {activeTab === 'registrations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold mb-4">Pending User Registrations</h3>
                {pendingRegistrations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending registrations</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRegistrations.map((user) => (
                          <tr key={user._id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.mobile}</td>
                            <td>
                              <span className={`badge ${user.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUserApproval(user._id, true)}
                                  className="btn btn-sm btn-success"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUserApproval(user._id, false)}
                                  className="btn btn-sm btn-error"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* All Users Tab */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold mb-4">All Registered Users</h3>
                {allUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user) => (
                          <tr key={user._id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.mobile}</td>
                            <td>
                              <span className={`badge ${user.role === 'admin' ? 'badge-error' : user.role === 'authority' ? 'badge-warning' : 'badge-info'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleUserRemoval(user._id)}
                                className="btn btn-sm btn-error"
                              >
                                Remove
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

            {/* Manage Incidents Tab */}
            {activeTab === 'incidents' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold mb-4">Manage All Incidents</h3>
                {recentIncidents.length === 0 ? (
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
                        {recentIncidents.map((incident) => (
                          <tr key={incident._id}>
                            <td className="font-medium">{incident.title}</td>
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
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => window.open(`/view-incident?id=${incident._id}`, '_blank')}
                                  className="btn btn-sm btn-info"
                                >
                                  View
                                </button>
                                {incident.status === 'resolved' && (
                                  <button
                                    onClick={() => window.open(`/view-report?id=${incident._id}`, '_blank')}
                                    className="btn btn-sm btn-success"
                                  >
                                    Report
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 