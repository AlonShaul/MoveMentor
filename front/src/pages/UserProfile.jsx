import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const apiUrl = useApi();
  const [userDetails, setUserDetails] = useState(null);
  const [lastPlan, setLastPlan] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/${currentUser._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserDetails(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchLastUserPlan = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/${currentUser._id}/plans`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.data.length > 0) {
          setLastPlan(res.data[0]); // Set the most recent plan
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (currentUser) {
      fetchUserDetails();
      fetchLastUserPlan();
    }
  }, [currentUser, apiUrl]);

  if (!currentUser) {
    return <div>Please log in to see your profile.</div>;
  }

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page p-4 md:p-8 mt-10 md:mt-40">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="profile-info bg-white p-4 rounded-lg shadow-md mb-4">
        <p><strong>Username:</strong> {userDetails.username}</p>
        <p><strong>Email:</strong> {userDetails.email}</p>
        <p><strong>Role:</strong> {userDetails.role}</p>
      </div>
      <div className="user-plans bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Last Generated Plan</h2>
        {lastPlan ? (
          <div className="plan mb-4">
            <p><strong>Category:</strong> {lastPlan.category}</p>
            <p><strong>Total Duration:</strong> {lastPlan.exercises.reduce((total, exercise) => total + (exercise.duration.hours * 60 + exercise.duration.minutes + exercise.duration.seconds / 60), 0)} minutes</p>
            {lastPlan.exercises.map((exercise, index) => (
              <div key={index} className="border border-gray-300 p-4 rounded mb-4">
                <h3 className="text-lg font-semibold">{exercise.title}</h3>
                <p dangerouslySetInnerHTML={{ __html: exercise.explanation }}></p>
                {exercise.videoUrl && (
                  <a href={exercise.videoUrl} className="text-blue-500 hover:underline">
                    Video
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No plans generated yet.</p>
        )}
      </div>
      <div className="mt-8">
        <Link to="/generate-plan" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200">
          Generate New Plan
        </Link>
      </div>
    </div>
  );
};

export default UserProfile;
