import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";

function getSeverityColor(severity) {
  switch (severity) {
    case "low": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "high": return "bg-orange-500";
    case "critical": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

function ViewReport() {
  const { report } = useAuthStore();

  if (!report || Object.keys(report).length === 0) {
    return (
      <motion.p
        className="text-center text-gray-500 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        No report data available.
      </motion.p>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto my-6 bg-white shadow-lg rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{report.title}</h2>
      <p className="text-gray-600 mb-4">{report.description}</p>

      <div className="space-y-2">
        <p className="text-sm text-gray-700"><strong>📍 Location:</strong> {report.location}</p>
        <p className="text-sm text-gray-700"><strong>📝 Reported By:</strong> {report.reportedBy?.name || "Unknown"}</p>
        <p className="text-sm text-gray-700"><strong>🔄 Status:</strong> {report.status.toUpperCase()}</p>
        <p className="text-sm text-gray-700">
          <strong>🔥 Severity:</strong> 
          <span className={`px-3 py-1 rounded-full text-white ${getSeverityColor(report.severity)}`}>
            {report.severity.toUpperCase()}
          </span>
        </p>
        {report.assignedTo && <p className="text-sm text-gray-700"><strong>👨‍💼 Assigned To:</strong> {report.assignedTo?.name || "Not assigned"}</p>}
      </div>

      {report.attachments && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Attachments:</h3>
          <div className="grid grid-cols-2 gap-4">
            {Array.isArray(report.attachments) ? (
              report.attachments.map((attachment, index) => (
                <img key={index} src={attachment} alt={`Attachment ${index + 1}`} className="w-full h-32 object-contain" />
              ))
            ) : (
              <img src={report.attachments} alt="Attachment" className="w-full h-32 object-contain" />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ViewReport;
