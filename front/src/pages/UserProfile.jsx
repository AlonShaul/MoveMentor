import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const apiUrl = useApi();
  const [userDetails, setUserDetails] = useState(null);
  const [plans, setPlans] = useState([]);

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

    const fetchUserPlans = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/${currentUser._id}/plans`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPlans(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (currentUser) {
      fetchUserDetails();
      fetchUserPlans();
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
        <h2 className="text-xl font-bold mb-4">Completed Plans</h2>
        {plans.length === 0 ? (
          <p>No plans completed yet.</p>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className="plan mb-4">
              <p><strong>Plan:</strong> {plan.title}</p>
              <p><strong>Rating:</strong> {plan.rating || 'Not rated yet'}</p>
              <Link to={`/post/${plan.postId}`} className="text-blue-500">View Plan</Link>
            </div>
          ))
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
