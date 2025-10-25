import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { useAuthStore } from "../../stores/authStore";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Shield,
  User
} from "lucide-react";
import EmergencyHelpline from "../../components/EmergencyHelpline/EmergencyHelpline";
import ScamWatchlist from "../../components/ScamWatchlist/ScamWatchlist";
import Announcements from "../../components/Announcements/Announcements";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const Home = () => {
  const { authUser, authRole } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [authRole]);



  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Home - fetchAnalytics - authUser:', authUser);
      console.log('Home - fetchAnalytics - authRole:', authRole);

      let endpoint = '';

      if (authRole === 'admin') {
        endpoint = '/admin/dashboard-stats';
        console.log('Home - Using admin endpoint');
      } else if (authRole === 'authority') {
        endpoint = '/authority/dashboard';
        console.log('Home - Using authority endpoint');
      } else if (authUser) {
        // For regular users, fetch their personal stats
        console.log('Home - Using user incidents endpoint');
        const incidentsResponse = await fetch('http://localhost:5000/api/auth/user-incidents', {
          credentials: 'include'
        });
        console.log('Home - User incidents response status:', incidentsResponse.status);

        if (incidentsResponse.ok) {
          const incidentsData = await incidentsResponse.json();
          console.log('Home - User incidents data:', incidentsData);
          const userIncidents = incidentsData.incidents || [];
          console.log('Home - User incidents array:', userIncidents);

          setAnalytics({
            totalIncidents: userIncidents.length,
            resolvedIncidents: userIncidents.filter(i => i.status === 'resolved').length,
            inProgressIncidents: userIncidents.filter(i => i.status === 'under review').length,
            openIncidents: userIncidents.filter(i => i.status === 'reported').length
          });
        } else {
          console.log('Home - User incidents response not ok:', incidentsResponse);
        }
        setLoading(false);
        return;
      }

      if (endpoint) {
        const response = await fetch(`http://localhost:5000/api${endpoint}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedActions = () => {
    console.log('Home - getRoleBasedActions - authUser:', authUser);
    console.log('Home - getRoleBasedActions - authRole:', authRole);

    if (!authUser) {
      console.log('Home - No authUser, showing public actions');
      return (
        <div className="flex justify-center mt-6 space-x-4">
          <Link to="/report" className="btn btn-primary px-6 py-3 text-lg font-medium">
            Report Incidents
          </Link>
          <Link to="/login" className="btn btn-outline px-6 py-3 text-lg font-medium">
            Log In
          </Link>
        </div>
      );
    }

    console.log('Home - User authenticated, checking role:', authRole);
    switch (authRole) {
      case 'admin':
        return (
          <div className="flex justify-center mt-6 space-x-4 flex-wrap">
            <Link to="/admin-dashboard" className="btn btn-primary px-6 py-3 text-lg font-medium">
              <Shield className="w-5 h-5 mr-2" />
              Admin Dashboard
            </Link>
            <Link to="/view-registrations" className="btn btn-warning px-6 py-3 text-lg font-medium">
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </Link>
            <Link to="/incidents" className="btn btn-info px-6 py-3 text-lg font-medium">
              <FileText className="w-5 h-5 mr-2" />
              View All Incidents
            </Link>
          </div>
        );

      case 'authority':
        return (
          <div className="flex justify-center mt-6 space-x-4 flex-wrap">
            <Link to="/authority-dashboard" className="btn btn-primary px-6 py-3 text-lg font-medium">
              <Shield className="w-5 h-5 mr-2" />
              Authority Dashboard
            </Link>
            <Link to="/incidents" className="btn btn-info px-6 py-3 text-lg font-medium">
              <FileText className="w-5 h-5 mr-2" />
              Manage Incidents
            </Link>
          </div>
        );

      case 'user':
      default:
        return (
          <div className="flex justify-center mt-6 space-x-4 flex-wrap">
            <Link to="/user-dashboard" className="btn btn-primary px-6 py-3 text-lg font-medium">
              <Shield className="w-5 h-5 mr-2" />
              User Dashboard
            </Link>
            <Link to="/report" className="btn btn-warning px-6 py-3 text-lg font-medium">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Report Incident
            </Link>
          </div>
        );
    }
  };

  const getAnalyticsData = () => {
    if (!analytics) return null;

    if (authRole === 'user' && authUser) {
      // User-specific analytics
      return {
        pieData: {
          labels: ["Resolved", "In Progress", "Open"],
          datasets: [{
            data: [
              analytics.resolvedIncidents || 0,
              analytics.inProgressIncidents || 0,
              analytics.openIncidents || 0
            ],
            backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
            hoverBackgroundColor: ["#059669", "#D97706", "#DC2626"],
          }],
        },
        stats: [
          { label: "Total Incidents", value: analytics.totalIncidents || 0, color: "text-blue-600", icon: FileText },
          { label: "Resolved", value: analytics.resolvedIncidents || 0, color: "text-green-600", icon: CheckCircle },
          { label: "In Progress", value: analytics.inProgressIncidents || 0, color: "text-yellow-600", icon: Clock },
          { label: "Open", value: analytics.openIncidents || 0, color: "text-red-600", icon: AlertTriangle }
        ]
      };
    }

    // Admin/Authority analytics
    return {
      pieData: {
        labels: ["Resolved", "In Progress", "Open"],
        datasets: [{
          data: [
            analytics.resolvedIncidents || 0,
            analytics.inProgressIncidents || 0,
            analytics.openIncidents || 0
          ],
          backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
          hoverBackgroundColor: ["#059669", "#D97706", "#DC2626"],
        }],
      },
      stats: [
        { label: "Total Incidents", value: analytics.totalIncidents || 0, color: "text-blue-600", icon: FileText },
        { label: "Resolved", value: analytics.resolvedIncidents || 0, color: "text-green-600", icon: CheckCircle },
        { label: "In Progress", value: analytics.inProgressIncidents || 0, color: "text-yellow-600", icon: Clock },
        { label: "Open", value: analytics.openIncidents || 0, color: "text-red-600", icon: AlertTriangle }
      ]
    };
  };

  const analyticsData = getAnalyticsData();

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.header
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to ScamShield
            {authUser && (
              <span className="block text-xl text-blue-600 mt-2">
                Hello, {authUser.firstName}!
              </span>
            )}
          </h1>
          <p className="text-lg text-gray-600">
            {authUser
              ? `Stay protected from scams and fraud. You are logged in as ${authRole}.`
              : "Your comprehensive platform for scam prevention, reporting, and digital security education."
            }
          </p>
          {getRoleBasedActions()}
        </motion.header>

        {/* Emergency Helpline Component */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <EmergencyHelpline />
        </motion.div>

        {/* Announcements Component */}
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Announcements />
        </motion.div>

        {/* Scam Watchlist Component */}
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ScamWatchlist />
        </motion.div>

        {/* Analytics Section - Only show for logged-in users */}
        {authUser && (
          <motion.section
            className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8"
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {loading ? (
              <div className="col-span-2 flex justify-center">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : analyticsData ? (
              <>
                <motion.div className="bg-white shadow-md rounded-lg p-6 text-center" variants={variants}>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    {authRole === 'user' ? 'Your Incident Overview' : 'System Overview'}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {analyticsData.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <Pie data={analyticsData.pieData} />
                </motion.div>

                <motion.div className="bg-white shadow-md rounded-lg p-6 text-center" variants={variants}>
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    {authRole === 'user' ? 'Your Activity' : 'System Activity'}
                  </h2>
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Activity charts coming soon</p>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="col-span-2 text-center text-gray-500">
                <p>No analytics data available</p>
              </div>
            )}
          </motion.section>
        )}

        {/* Public Content - Only show for non-logged in users */}
        {!authUser && (
          <>
            {/* Testimonials Section */}
            <motion.section
              className="mt-12 text-center"
              initial="hidden"
              animate="visible"
              variants={variants}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">What Our Users Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div className="bg-white shadow-md rounded-lg p-6" variants={variants}>
                  <p className="italic text-gray-600">
                    "ScamShield has helped me stay protected from fraud. The real-time alerts are a game changer!"
                  </p>
                  <h3 className="text-lg font-bold text-gray-800 mt-4">- Priya Sharma</h3>
                </motion.div>
                <motion.div className="bg-white shadow-md rounded-lg p-6" variants={variants}>
                  <p className="italic text-gray-600">
                    "Thanks to this platform, our community has become much more aware of digital threats."
                  </p>
                  <h3 className="text-lg font-bold text-gray-800 mt-4">- Alex John</h3>
                </motion.div>
                <motion.div className="bg-white shadow-md rounded-lg p-6" variants={variants}>
                  <p className="italic text-gray-600">
                    "The educational videos are fantastic. They help us understand and prevent scams effectively."
                  </p>
                  <h3 className="text-lg font-bold text-gray-800 mt-4">- Sneha Patel</h3>
                </motion.div>
              </div>
            </motion.section>

            {/* Features Section */}
            <motion.section
              className="mt-12 text-center"
              initial="hidden"
              animate="visible"
              variants={variants}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Scam Reporting</h3>
                  <p className="text-gray-600 text-sm">Report scams quickly with detailed information and evidence</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Real-time Alerts</h3>
                  <p className="text-gray-600 text-sm">Get instant notifications about new scam threats</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">Digital Education</h3>
                  <p className="text-gray-600 text-sm">Learn digital hygiene through comprehensive video tutorials</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                  <h3 className="font-semibold mb-2">Community Protection</h3>
                  <p className="text-gray-600 text-sm">Stay informed about scams affecting your region</p>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
