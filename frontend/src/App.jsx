import React, { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Incidents from "./pages/Incidents/Incidents";
import Profile from "./pages/Profile/Profile";
import Announcements from "./pages/Announcements/Announcements";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import CheckApproval from "./pages/CheckApproval/CheckApproval";
import IncidentForm from "./pages/IncidentForm/IncidentForm";
import UserProfile from "./pages/UserProfile/UserProfile";
import ViewRegistrations from "./pages/ViewRegistrations/ViewRegistrations";
import ViewIncident from "./pages/ViewIncident/ViewIncident";
import ViewReport from "./pages/ViewReport/ViewReport";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard/AuthorityDashboard";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import Community from "./pages/Community/Community";
import MapPage from "./pages/MapPage/MapPage";
import Helpline from "./pages/Helpline/Helpline";
import ScammerDatabase from "./pages/ScammerDatabase/ScammerDatabase";
import VideoGallery from './pages/VideoGallery/VideoGallery';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import PointsManagement from './pages/AdminDashboard/PointsManagement';

function App() {
  const { authUser, authRole, initializeAuth } = useAuthStore();

  // Initialize authentication on app startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="*" element={<div className="text-xl text-red-700 text-justify">Page not found!</div>} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={
          authUser ? <Navigate to="/" /> : <Login />
        } />
        <Route path="/signup" element={
          authUser ? <Navigate to="/" /> : <Signup />
        } />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/community" element={!authUser ? <Navigate to='/login' /> : <Community />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/helpline" element={<Helpline />} />
        <Route path="/scammer-database" element={<ScammerDatabase />} />
        <Route path="/educational" element={<VideoGallery />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/view-user/:id" element={<UserProfile />} />
        <Route path="/report" element={!authUser ? <Navigate to='/login' /> : <IncidentForm />} />
        <Route path="/check-approval" element={<CheckApproval />} />
        <Route path="/profile" element={!authUser ? <Navigate to="/login" /> : <Profile user={authUser} />} />
        <Route path="/announcements" element={!authUser ? <Navigate to="/login" /> : <Announcements />} />
        <Route path="/view-registrations" element={!authUser ? <Navigate to="/login" /> : <ViewRegistrations />} />
        <Route path="/view-incident" element={!authUser ? <Navigate to="/login" /> : <ViewIncident />} />
        <Route path="/view-report" element={!authUser ? <Navigate to="/login" /> : <ViewReport />} />

        {/* Dashboard Routes */}
        <Route
          path="/admin-dashboard"
          element={
            !authUser ? <Navigate to="/login" /> :
              authRole !== 'admin' ? <Navigate to="/" /> :
                <AdminDashboard />
          }
        />
        <Route
          path="/authority-dashboard"
          element={
            !authUser ? <Navigate to="/login" /> :
              authRole !== 'authority' ? <Navigate to="/" /> :
                <AuthorityDashboard />
          }
        />
        <Route
          path="/user-dashboard"
          element={
            !authUser ? <Navigate to="/login" /> :
              authRole !== 'user' ? <Navigate to="/" /> :
                <UserDashboard />
          }
        />
        <Route
          path="/admin/points-management"
          element={
            !authUser ? <Navigate to="/login" /> :
              authRole !== 'admin' ? <Navigate to="/" /> :
                <PointsManagement />
          }
        />
      </Routes>
      <Footer />
      <ToastContainer />
    </>
  );
}

export default App;
