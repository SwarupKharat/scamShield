import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

const IncidentCard = ({
  title,
  description,
  location,
  reportedBy,
  severity,
  status,
  image,
  createdAt,
  _id,
}) => {
  const { findUser, updateIncident, isUpdating, markIncidentSolved, viewReport} = useAuthStore();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Loading...");
  const [showTextArea, setShowTextArea] = useState(false);
  const [formData, setFormData] = useState({ message: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await findUser(reportedBy);
        setUserName(user?.name || "Unknown User");
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserName("Error fetching user");
      }
    };

    fetchUser();
  }, [reportedBy, findUser]);

  const handleNavigate = () => {
    navigate(`/view-user/${reportedBy}`);
  };

  const handleSubmit = async () => {
    try {
      await updateIncident(formData, _id);
    } catch (error) {
      console.log("Error in submission: ", error);
    }
  };

  const updateTextArea = () => {
    setShowTextArea(!showTextArea);
  };

  const handleMarkAscompleted = async (id) => {
    await markIncidentSolved(id);
    viewReport(id);
    navigate('/view-report')    
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // Fade in with slight slide-up effect
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }} // Slight scale-up on hover
      className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden max-w-4xl mx-auto my-6"
    >
      {/* Image Section */}
      <div className="w-full h-72 md:h-96"> {/* Adjusted height for better visibility */}
        <img
          src={image}
          alt="Incident"
          className="w-full h-full object-contain" // Changed to object-contain to fit the image
        />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 hover:text-blue-500 transition-colors duration-200">
          {title}
        </h2>

        <p className="text-gray-600 mb-3">
          <strong>Description:</strong> {description}
        </p>
        <p className="text-gray-600 mb-2">
          <strong>Location:</strong> {location}
        </p>
        <p className="text-gray-600 mb-2 flex items-center">
          <strong>Reported By:</strong> {userName}
          <button
            onClick={handleNavigate}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            View User
          </button>
        </p>
        <p className="text-gray-600 mb-2">
          <strong>Severity:</strong>{" "}
          <span className={`font-bold ${getSeverityColor(severity)}`}>
            {severity}
          </span>
        </p>
        <p className="text-gray-600">
          <strong>Status:</strong> {status}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center space-x-4">
          <button
          onClick={() => handleMarkAscompleted(_id)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Mark as complete
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={updateTextArea}
          >
            Update
          </button>
        </div>

        <p className="text-gray-500 text-sm mt-4">
          <strong>Reported On:</strong> {new Date(createdAt).toLocaleDateString()}
        </p>

        {/* Conditionally render the text area with animation */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={showTextArea ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-4"
        >
          {showTextArea && (
            <div>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter updated information here..."
                value={formData.message}
                onChange={(e) => setFormData({ message: e.target.value })}
              ></textarea>

              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={handleSubmit}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// PropTypes for type-checking
IncidentCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  reportedBy: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["low", "medium", "high", "critical"]).isRequired,
  status: PropTypes.oneOf(["reported", "under review", "resolved", "dismissed"]).isRequired,
  image: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
};

// Helper function to set severity color
const getSeverityColor = (severity) => {
  switch (severity) {
    case "low":
      return "text-green-500";
    case "medium":
      return "text-yellow-500";
    case "high":
      return "text-red-500";
    case "critical":
      return "text-purple-600";
    default:
      return "text-gray-500";
  }
};

export default IncidentCard;
