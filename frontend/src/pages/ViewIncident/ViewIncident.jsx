import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";

function ViewIncident() {
  const { incident } = useAuthStore();

  if (!incident) {
    return (
      <motion.p
        className="text-center text-gray-500 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        No incident data available.
      </motion.p>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto my-5 bg-white shadow-lg rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-2xl font-bold text-gray-800 mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {incident.title}
      </motion.h2>
      
      <motion.p
        className="text-gray-600 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {incident.description}
      </motion.p>

      <motion.img
        src={incident.image}
        alt="Incident"
        className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      <div className="space-y-2">
        <motion.p className="text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}>
          <strong>📍 Location:</strong> {incident.location}
        </motion.p>
        
        <motion.p className="text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}>
          <strong>🔥 Severity:</strong>
          <span className={`ml-2 px-3 py-1 rounded-full text-white ${getSeverityColor(incident.severity)}`}>
            {incident.severity?.toUpperCase() || "LOW"}
          </span>
        </motion.p>

        <motion.p className="text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}>
          <strong>🔄 Status:</strong> {incident.status}
        </motion.p>
      </div>
    </motion.div>
  );
}

function getSeverityColor(severity) {
  switch (severity) {
    case "low": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "high": return "bg-orange-500";
    case "critical": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

export default ViewIncident;