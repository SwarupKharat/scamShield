import React, { useState } from "react";
import { Menu, Search, Bell, User, LogOut, Shield, Users, AlertTriangle, MessageCircle, Map, Phone, Database, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import AvatarImg from './avatar.jpeg'

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { authUser, logout, authRole } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const getRoleBasedNavItems = () => {
    console.log('Navbar - getRoleBasedNavItems - authUser:', authUser);
    console.log('Navbar - getRoleBasedNavItems - authRole:', authRole);

    if (!authUser) {
      console.log('Navbar - No authUser, showing public nav items');
      return (
        <>
          <Link to="/" className="text-base font-medium text-gray-700 hover:text-primary">
            Home
          </Link>
          <Link to="/report" className="text-base font-medium text-gray-700 hover:text-primary">
            Report
          </Link>
        </>
      );
    }

    console.log('Navbar - User authenticated, checking role:', authRole);
    switch (authRole) {
      case 'admin':
        return (
          <>
            <Link to="/admin-dashboard" className="text-base font-medium text-gray-700 hover:text-primary">
              Home
            </Link>
            <Link to="/admin-dashboard" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Admin Dashboard
            </Link>
            <Link to="/view-registrations" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Manage Users
            </Link>
            <Link to="/incidents" className="text-base font-medium text-gray-700 hover:text-primary">
              All Incidents
            </Link>
            <Link to="/community" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              Community
            </Link>
            <Link to="/map" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Map className="w-4 h-4 mr-1" />
              Scam Map
            </Link>
            <Link to="/scammer-database" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Database className="w-4 h-4 mr-1" />
              Scammer DB
            </Link>
            <Link to="/educational" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Video className="w-4 h-4 mr-1" />
              Educational
            </Link>
            <Link to="/scam-detector" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Video className="w-4 h-4 mr-1" />
              Ai Detector
            </Link>
          </>
        );

      case 'authority':
        return (
          <>
            <Link to="/authority-dashboard" className="text-base font-medium text-gray-700 hover:text-primary">
              Home
            </Link>
            <Link to="/authority-dashboard" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Users className="w-4 h-4 mr-1" />
              Authority Dashboard
            </Link>
            <Link to="/incidents" className="text-base font-medium text-gray-700 hover:text-primary">
              Manage Incidents
            </Link>
            <Link to="/community" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              Community
            </Link>
            <Link to="/map" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Map className="w-4 h-4 mr-1" />
              Scam Map
            </Link>
            <Link to="/scammer-database" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Database className="w-4 h-4 mr-1" />
              Scammer DB
            </Link>
            <Link to="/educational" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Video className="w-4 h-4 mr-1" />
              Educational
            </Link>
          </>
        );

      case 'user':
      default:
        return (
          <>
            <Link to="/user-dashboard" className="text-base font-medium text-gray-700 hover:text-primary">
              Home
            </Link>
            <Link to="/user-dashboard" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              User Dashboard
            </Link>
            <Link to="/report" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Report Incident
            </Link>
            <Link to="/community" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              Community
            </Link>
            <Link to="/map" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Map className="w-4 h-4 mr-1" />
              Scam Map
            </Link>
            <Link to="/scammer-database" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Database className="w-4 h-4 mr-1" />
              Scammer DB
            </Link>
            <Link to="/educational" className="text-base font-medium text-gray-700 hover:text-primary flex items-center">
              <Video className="w-4 h-4 mr-1" />
              Educational
            </Link>
          </>
        );
    }
  };

  const getMobileNavItems = () => {
    if (!authUser) {
      return (
        <>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/report">Report</Link></li>
        </>
      );
    }

    switch (authRole) {
      case 'admin':
        return (
          <>
            <li><Link to="/admin-dashboard">Home</Link></li>
            <li>
              <Link to="/admin-dashboard" className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Link>
            </li>
            <li>
              <Link to="/view-registrations" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </li>
            <li><Link to="/incidents">All Incidents</Link></li>
            <li>
              <Link to="/community" className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Community
              </Link>
            </li>
            <li>
              <Link to="/map" className="flex items-center">
                <Map className="w-4 h-4 mr-2" />
                Scam Map
              </Link>
            </li>
            <li>
              <Link to="/helpline" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Helpline
              </Link>
            </li>
            <li>
              <Link to="/scammer-database" className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Scammer DB
              </Link>
            </li>
            <li>
              <Link to="/video" className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Video Gallery
              </Link>
            </li>
          </>
        );

      case 'authority':
        return (
          <>
            <li><Link to="/authority-dashboard">Home</Link></li>
            <li>
              <Link to="/authority-dashboard" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Authority Dashboard
              </Link>
            </li>
            <li><Link to="/incidents">Manage Incidents</Link></li>
            <li>
              <Link to="/community" className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Community
              </Link>
            </li>
            <li>
              <Link to="/map" className="flex items-center">
                <Map className="w-4 h-4 mr-2" />
                Scam Map
              </Link>
            </li>
            <li>
              <Link to="/helpline" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Helpline
              </Link>
            </li>
            <li>
              <Link to="/scammer-database" className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Scammer DB
              </Link>
            </li>
            <li>
              <Link to="/video" className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Video Gallery
              </Link>
            </li>
          </>
        );

      case 'user':
      default:
        return (
          <>
            <li><Link to="/user-dashboard">Home</Link></li>
            <li>
              <Link to="/report" className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Incident
              </Link>
            </li>
            <li><Link to="/incidents">My Incidents</Link></li>
            <li>
              <Link to="/community" className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Community
              </Link>
            </li>
            <li>
              <Link to="/map" className="flex items-center">
                <Map className="w-4 h-4 mr-2" />
                Scam Map
              </Link>
            </li>
            <li>
              <Link to="/helpline" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Helpline
              </Link>
            </li>
            <li>
              <Link to="/scammer-database" className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Scammer DB
              </Link>
            </li>
            <li>
              <Link to="/video" className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Video Gallery
              </Link>
            </li>
          </>
        );
    }
  };

  return (
    <nav className="navbar bg-base-100 shadow-md px-4">
      {/* Logo Section */}
      <div className="flex-1">
        <Link
          to={authUser ?
            authRole === 'admin' ? '/admin-dashboard' :
              authRole === 'authority' ? '/authority-dashboard' :
                authRole === 'user' ? '/user-dashboard' :
                  '/'
            : '/'}
          className="text-2xl font-semibold flex items-center space-x-2"
        >
          <Menu className="w-6 h-6" />
          <span>Incident Reporter</span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex flex-1 justify-center space-x-8">
        {getRoleBasedNavItems()}
      </div>

      {/* User Section */}
      <div className="flex-none space-x-4">
        {/* Notifications */}
        {authUser && (
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <Bell className="w-6 h-6" />
                <span className="badge badge-sm indicator-item">3</span>
              </div>
            </button>
            <div className="mt-3 card card-compact dropdown-content w-60 bg-base-100 shadow">
              <div className="card-body">
                <h2 className="font-bold text-lg">Notifications</h2>
                <Link to="/announcements" className="btn btn-primary btn-block mt-2">
                  View all
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Profile Dropdown */}
        {authUser && (
          <div className="dropdown dropdown-end hidden lg:block">
            <button className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={AvatarImg} alt="User avatar" />
              </div>
            </button>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to="/profile" className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </li>
              {authRole === 'admin' && (
                <li>
                  <Link to="/admin-dashboard" className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                </li>
              )}
              {authRole === 'authority' && (
                <li>
                  <Link to="/authority-dashboard" className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Authority Dashboard</span>
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-red-600">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Auth Buttons */}
        {
          !authUser ? (
            <>
              <div className="hidden lg:flex space-x-4">
                <Link to="/signup" className="btn btn-outline">
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-primary">
                  Log In
                </Link>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex space-x-4">
              <button onClick={handleLogout} className="btn btn-warning">
                Logout
              </button>
            </div>
          )
        }
      </div>

      {/* Mobile Menu Button */}
      <button className="btn btn-ghost lg:hidden" onClick={toggleMobileMenu}>
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-base-100 shadow-md lg:hidden z-10">
          <div className="p-4">
            <ul className="menu menu-compact space-y-2">
              {getMobileNavItems()}
              {authUser ? (
                <>
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="text-red-600">Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/signup">Sign Up</Link>
                  </li>
                  <li>
                    <Link to="/login">Log In</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
