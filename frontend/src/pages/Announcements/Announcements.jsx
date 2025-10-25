import React, { useEffect } from "react";
import { motion } from "framer-motion"; // Import Framer Motion
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

function Announcements() {
  const { authUser, notifications, getNotifications, viewIncident, viewReport, report} = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications();
  }, []);

  const handleIncidentView = (id) => {
    viewIncident(id);
    navigate('/view-incident');
  }

  const handleReportView = (id) => {
    viewReport(id);

    if(report === null){
      alert("The incident is currently pending");
      return;
    }

    navigate('/view-report');
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.h1
        className="text-2xl font-bold text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome, {authUser.name}
      </motion.h1>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <motion.p
            className="text-orange-500 text-center p-4 border rounded-lg bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No notifications
          </motion.p>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }}
          >
            {notifications.slice().reverse().map((notification, index) => (
              <motion.div
                key={index}
                className="p-4 border rounded-lg bg-white shadow-md flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-500">🔔</span>
                <p className="text-gray-700">{notification.text}</p>

                <button className="button-33" onClick={() => handleIncidentView(notification.incidentId)}>View Incident</button>
                <button className="button-34" onClick={() => handleReportView(notification.incidentId)}>View Report</button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Announcements;
