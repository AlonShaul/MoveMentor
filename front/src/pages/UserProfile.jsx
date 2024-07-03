import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authContext';
import { useCategories } from '../context/CategoryContext';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const { categories } = useCategories();
  const apiUrl = useApi();
  const [userDetails, setUserDetails] = useState(null);
  const [planGroups, setPlanGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

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

    const fetchUserPlanGroups = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/${currentUser._id}/plan-groups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
    
        if (res.data.length > 0) {
          const populatedGroups = await Promise.all(res.data.map(async group => {
            const plans = await Promise.all(group.plans.map(async planId => {
              const planRes = await axios.get(`${apiUrl}/api/plans/getPlan`, {
                params: { id: planId },
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              });
              return planRes.data;
            }));
            return { ...group, plans };
          }));
          setPlanGroups(populatedGroups);
        }
      } catch (err) {
        console.log(err);
      }
    };
    
    
    if (currentUser) {
      fetchUserDetails();
      fetchUserPlanGroups();
    }
  }, [currentUser, apiUrl]);

  const deletePlan = async (planId, groupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/api/plans/delete`, {
        params: {
          userId: currentUser._id,
          planId
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setPlanGroups((prevGroups) => {
        return prevGroups
          .map(group => {
            if (group._id === groupId) {
              group.plans = group.plans.filter(plan => plan._id !== planId);
            }
            return group;
          })
          .filter(group => group.plans.length > 0);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const replan = async (planId, groupId, category, duration, adaptedForThirdAge, adaptedForChildren, numberOfWeeks, sessionsPerWeek) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/plans/replan`, {
        params: {
          userId: currentUser._id,
          planId,
          category,
          duration,
          adaptedForThirdAge,
          adaptedForChildren,
          numberOfWeeks,
          sessionsPerWeek
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 201) {
        const newPlans = response.data.plans;
        const newPlanGroupName = response.data.newPlanGroupName;
        setPlanGroups((prevGroups) => {
          return prevGroups.map(group => {
            if (group._id === groupId) {
              group.plans = newPlans;
              group.groupName = newPlanGroupName;
            }
            return group;
          }).filter(group => group.plans.length > 0);
        });
      } else {
        console.error(response.data.error);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const filteredPlanGroups = selectedCategory
    ? planGroups.filter(group => group.category === selectedCategory)
    : planGroups;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!currentUser) {
    return <div>Please log in to see your profile.</div>;
  }

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page p-4 md:p-8 mt-10 md:mt-40">
      <h1 className="text-2xl font-bold mb-4 text-white">User Profile</h1>
      <div className="profile-info bg-white p-4 rounded-lg shadow-md mb-4">
        <p><strong>Username:</strong> {userDetails.username}</p>
        <p><strong>Email:</strong> {userDetails.email}</p>
        <p><strong>Role:</strong> {userDetails.role}</p>
      </div>
      <div className="user-plans bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Your Plan Groups</h2>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Select Category</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {filteredPlanGroups.length > 0 ? (
          filteredPlanGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-lg font-bold mb-2 text-center">{group.groupName} - {group.category}</h3>
              {group.plans.map((plan, planIndex) => (
                <div key={plan._id} className="plan mb-4">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg mb-6 text-center shadow-lg">
                    <p className="text-xl font-semibold text-blue-700"><strong>Category:</strong> {group.category}</p>
                    <p className="text-xl font-semibold text-blue-700"><strong>Number of Weeks:</strong> {plan.numberOfWeeks}</p>
                    <p className="text-xl font-semibold text-blue-700"><strong>Sessions per Week:</strong> {plan.sessionsPerWeek}</p>
                    <p className="text-xl font-semibold text-blue-700"><strong>Date:</strong> {formatDate(plan.date)}</p>
                    <p className="text-xl font-semibold text-blue-700"><strong>Total Duration:</strong> {plan.duration} minutes</p>
                    <button
                      className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                      onClick={() => deletePlan(plan._id, group._id)}
                    >
                      Delete Plan
                    </button>
                    <button
                      className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 ml-2"
                      onClick={() => replan(plan._id, group._id, group.category, plan.duration, plan.adaptedForThirdAge, plan.adaptedForChildren, plan.numberOfWeeks, plan.sessionsPerWeek)}
                    >
                      Replan
                    </button>
                  </div>
                  <h1 className='text-lg font-bold mb-2 text-center'>Week {planIndex+1}</h1>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sets / Reps</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adapted for Third Age</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adapted for Children</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plan.exercises.map((exercise, exerciseIndex) => (
                        <tr key={exerciseIndex}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercise.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: exercise.explanation }}></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exercise.videoUrl && (
                              <a href={exercise.videoUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                Video
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sets: {exercise.sets} / Reps: {exercise.turns}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise.adaptedForThirdAge ? 'Yes' : 'No'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise.adaptedForChildren ? 'Yes' : 'No'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise.duration} minutes</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No plan groups found for the selected category.</p>
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
