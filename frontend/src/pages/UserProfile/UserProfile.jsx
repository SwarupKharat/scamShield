import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore'; // Adjust the path as needed

function UserProfile() {
  const { id } = useParams(); // Extract the user ID from the route parameters
  const { findUser } = useAuthStore(); // Access the findUser function from the store
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to indicate loading
  const [error, setError] = useState(null); // State to store errors

  useEffect(() => {
    // Fetch the user data when the component mounts
    const fetchUser = async () => {
      try {
        const userData = await findUser(id); // Call the findUser function
        if (userData) {
          setUser(userData); // Update the user state
        } else {
          setError('User not found.');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Unable to fetch user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, findUser]);

  // Render loading, error, or user profile
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        {user.profilePic && (
          <img
            src={user.profilePic}
            alt={`${user.name}'s Profile`}
            className="w-24 h-24 rounded-full mr-6 border border-gray-300"
          />
        )}
        <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
      </div>
      <p className="text-gray-700 my-2 text-[20px]">
        <strong>Email:</strong> {user.email}
      </p>
      <p className="text-gray-700 my-4 text-[20px]">
        <strong>Mobile:</strong> {user.mobile}
      </p>
      <p className="text-gray-700 my-4 text-[20px]">
        <strong>Address:</strong> {user.address}
      </p>
      <p className="text-gray-700 my-4 text-[20px]">
        <strong>Role:</strong> {user.role}
      </p>
    </div>
  );
}

export default UserProfile;
