import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore'; // Adjust the import path as needed
import toast from 'react-hot-toast';

const RegistrationCard = () => {
  const { registrations, viewRegistrations, isAccepting, acceptUser } = useAuthStore();
  const [loadingUsers, setLoadingUsers] = useState({}); // Track loading per user

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        await viewRegistrations();
      } catch (error) {
        toast.error("Failed to fetch registrations.");
      }
    };

    fetchRegistrations();
  }, [viewRegistrations]);

  const handleUserAction = async (id, approval) => {
    setLoadingUsers((prev) => ({ ...prev, [id]: true }));
    try {
      await acceptUser({ userId: id, approval });
    } catch (error) {
      toast.error(`Failed to ${approval ? "accept" : "reject"} user.`);
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (isAccepting) return <div className="text-center mt-10">Processing...</div>;

  return (
    <div className="flex flex-col items-center">
      {registrations.length === 0 ? (
        <div className="text-center mt-10">No registrations found.</div>
      ) : (
        registrations.map((user) => (
          <div key={user._id} className="bg-white p-4 shadow-lg rounded-lg mb-4 w-full max-w-md">
            <img
              src={user.photo}
              alt={`${user.firstName} ${user.lastName}`}
              className="rounded-full h-24 w-24 mx-auto"
            />
            <h2 className="text-xl font-semibold text-center mt-2">{`${user.firstName} ${user.lastName}`}</h2>
            <p className="text-center">{user.email}</p>
            <p className="text-center">{user.mobile}</p>
            <p className="text-center">{user.address}</p>
            <p
              className={`text-center ${
                user.status === 'approved'
                  ? 'text-green-500'
                  : user.status === 'rejected'
                  ? 'text-red-500'
                  : 'text-yellow-500'
              }`}
            >
              Status: {user.status}
            </p>
            <p className="text-gray-500 text-sm text-center">
              Registered on: {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-center">Aadhar Card:</h3>
              <img src={user.aadharCard} alt="Aadhar Card" className="mt-2 rounded-lg h-40 w-80 object-cover mx-auto" />
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleUserAction(user._id, true)}
                disabled={loadingUsers[user._id]}
                className={`${
                  loadingUsers[user._id] ? 'bg-gray-500' : 'bg-green-500'
                } text-white font-semibold py-2 px-4 rounded mr-2 hover:bg-green-600 transition`}
              >
                {loadingUsers[user._id] ? "Working..." : "Accept"}
              </button>
              <button
                onClick={() => handleUserAction(user._id, false)}
                disabled={loadingUsers[user._id]}
                className={`${
                  loadingUsers[user._id] ? 'bg-gray-500' : 'bg-red-500'
                } text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition`}
              >
                {loadingUsers[user._id] ? "Working..." : "Reject"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RegistrationCard;
