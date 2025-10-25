import React from "react";

function RegistrationCard({ user }) {
  const {
    firstName = "N/A",
    lastName = "N/A",
    email = "N/A",
    mobile = "N/A",
    status = "N/A",
    aadharCard,
    photo,
    createdAt = new Date(),
  } = user;

  const statusColors = {
    approved: "text-green-600",
    pending: "text-yellow-600",
    rejected: "text-red-600",
  };

  return (
    <div className="w-80 p-6 border rounded-lg shadow-lg bg-white mx-auto transition-transform duration-300 transform hover:scale-105 hover:shadow-xl">
      {/* User Photo */}
      <div className="flex justify-center mb-4">
        <img
          src={photo || "https://via.placeholder.com/100?text=No+Image"}
          alt={`${firstName} ${lastName}`}
          className="w-24 h-24 rounded-full border object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/100?text=No+Image"; // Fallback image
          }}
        />
      </div>

      {/* User Details */}
      <h2 className="text-xl font-semibold text-center mb-2">
        {firstName} {lastName}
      </h2>
      <p className="text-gray-600 text-sm mb-1">
        <span className="font-semibold">Email:</span> {email}
      </p>
      <p className="text-gray-600 text-sm mb-1">
        <span className="font-semibold">Mobile:</span> {mobile}
      </p>

      {/* Aadhaar Card Display */}
      <div className="mb-4">
        <span className="font-semibold">Aadhaar:</span>
        {aadharCard ? (
          <img
            src={aadharCard}
            alt="Aadhaar Card"
            className="mt-2 w-full h-auto border rounded-md shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150?text=No+Aadhaar"; // Fallback image
            }}
          />
        ) : (
          <p className="text-gray-500">No Aadhaar card available.</p>
        )}
      </div>

      {/* Status Indicator */}
      <p
        className={`text-sm mb-3 font-semibold ${statusColors[status.toLowerCase()] || "text-gray-600"}`}
        title={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
        aria-label={`Registration status is ${status}`}
      >
        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
      </p>

      {/* Registration Date */}
      <p className="text-gray-500 text-xs text-center">
        Registered on: {new Date(createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

export default RegistrationCard;
