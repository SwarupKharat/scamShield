import React from 'react';
import PropTypes from 'prop-types';
import { Mail, Phone, User, Home, CreditCard, Calendar, Bell, CheckCircle } from 'lucide-react';

const Profile = ({ user }) => {
  if (!user) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg border border-gray-200 transition-all duration-300 ease-in-out">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Profile Picture */}
        <div className="md:w-1/3 text-center md:text-left">
          <img
            src={user.profilePic || 'https://via.placeholder.com/150'}
            alt={`${user.name}'s profile`}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto md:mx-0 mb-6 transition-transform transform hover:scale-110"
          />
          <h2 className="text-2xl font-bold text-gray-800 hover:text-blue-500 transition-colors duration-300">
            {user.name}
          </h2>
          <p className="text-lg text-gray-600">{user.role.toUpperCase()}</p>
        </div>

        {/* User Details */}
        <div className="md:w-2/3 md:pl-8 mt-6 md:mt-0">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">Personal Details</h3>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 transition-transform duration-300 hover:scale-105">
            <p className="flex items-center text-gray-600 mb-3">
              <Mail className="mr-3 text-blue-500" /> <strong>Email:</strong> {user.email}
            </p>
            <p className="flex items-center text-gray-600 mb-3">
              <Phone className="mr-3 text-green-500" /> <strong>Mobile:</strong> {user.mobile}
            </p>
            <p className="flex items-center text-gray-600 mb-3">
              <User className="mr-3 text-purple-500" /> <strong>First Name:</strong> {user.firstName}
            </p>
            <p className="flex items-center text-gray-600 mb-3">
              <User className="mr-3 text-purple-500" /> <strong>Last Name:</strong> {user.lastName}
            </p>
            <p className="flex items-center text-gray-600 mb-3">
              <Home className="mr-3 text-teal-500" /> <strong>Address:</strong> {user.address}
            </p>
            <p className="flex items-center text-gray-600 mb-3">
              <CreditCard className="mr-3 text-orange-500" /> <strong>Aadhar Card:</strong> {user.aadharCard}
            </p>
            <p className="flex items-center text-gray-600 mb-3">
              <Calendar className="mr-3 text-red-500" /> <strong>Joined On:</strong> {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Reported Events */}
          <h3 className="text-xl font-semibold text-gray-800 mt-6">Reported Events</h3>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 transition-transform duration-300 hover:scale-105">
            {user.reportedEvents.length > 0 ? (
              <ul className="list-disc list-inside text-gray-600">
                {user.reportedEvents.map((eventId, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <CheckCircle className="mr-2 text-green-500" /> {eventId}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No events reported yet.</p>
            )}
          </div>

          {/* Notifications */}
          <h3 className="text-xl font-semibold text-gray-800 mt-6">Notifications</h3>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6 transition-transform duration-300 hover:scale-105">
            {user.notifications.length > 0 ? (
              <ul className="list-disc list-inside text-gray-600">
                {user.notifications.map((notification, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <Bell className="mr-2 text-blue-500" /> {notification.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No notifications.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Profile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    mobile: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    aadharCard: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'authority', 'user']),
    profilePic: PropTypes.string,
    reportedEvents: PropTypes.arrayOf(PropTypes.string),
    notifications: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
      })
    ),
    createdAt: PropTypes.string.isRequired,
  }),
};

export default Profile;
