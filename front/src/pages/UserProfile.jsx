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
  const [activeTabs, setActiveTabs] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});

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
          populatedGroups.sort((a, b) => a.groupName.localeCompare(b.groupName));
          setPlanGroups(populatedGroups);

          // Initialize activeTabs with 'exercises' for all plans
          const initialTabs = {};
          populatedGroups.forEach(group => {
            initialTabs[group._id] = {};
            group.plans.forEach(plan => {
              initialTabs[group._id][plan._id] = 'exercises';
            });
          });
          setActiveTabs(initialTabs);
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
        const newPlans = response.data.plansByWeek;
        const newPlansPopulated = await Promise.all(
          Object.values(newPlans).map(async plan => {
            const planRes = await axios.get(`${apiUrl}/api/plans/getPlan`, {
              params: { id: plan._id },
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            return planRes.data;
          })
        );
        setPlanGroups((prevGroups) => {
          return prevGroups.map(group => {
            if (group._id === groupId) {
              return {
                ...group,
                plans: newPlansPopulated
              };
            }
            return group;
          }).filter(group => group.plans.length > 0);
        });
        setActiveTabs((prev) => ({
          ...prev,
          [groupId]: newPlansPopulated.reduce((acc, plan) => {
            acc[plan._id] = 'exercises';
            return acc;
          }, {})
        }));
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

  const handleLike = async (exerciseId, postId, planId) => {
    try {
      await axios.put(`${apiUrl}/api/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlanGroups((prevGroups) => {
        return prevGroups.map(group => ({
          ...group,
          plans: group.plans.map(plan => 
            plan._id === planId ? {
              ...plan,
              exercises: plan.exercises.map(exercise => 
                exercise._id === exerciseId ? { ...exercise, liked: true, disliked: false } : exercise
              )
            } : plan
          )
        }));
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDislike = async (exerciseId, postId, planId) => {
    try {
      await axios.put(`${apiUrl}/api/posts/${postId}/dislike`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlanGroups((prevGroups) => {
        return prevGroups.map(group => ({
          ...group,
          plans: group.plans.map(plan => 
            plan._id === planId ? {
              ...plan,
              exercises: plan.exercises.map(exercise => 
                exercise._id === exerciseId ? { ...exercise, liked: false, disliked: true } : exercise
              )
            } : plan
          )
        }));
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateRating = async (exerciseId, postId, newRating) => {
    try {
      await axios.put(`${apiUrl}/api/posts/${postId}/rate`, { rating: newRating }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlanGroups((prevGroups) => {
        return prevGroups.map(group => ({
          ...group,
          plans: group.plans.map(plan => ({
            ...plan,
            exercises: plan.exercises.map(exercise => 
              exercise._id === exerciseId ? { ...exercise, userRating: newRating } : exercise
            )
          }))
        }));
      });
    } catch (err) {
      console.log(err);
    }
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

  const handleTabChange = (groupId, planId, tab) => {
    setActiveTabs(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [planId]: tab
      }
    }));
  };

  if (!currentUser) {
    return <div className="text-gray-900 dark:text-white">Please log in to see your profile.</div>;
  }

  if (!userDetails) {
    return <div className="text-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <div className="profile-page p-4 md:p-8 mt-10 md:mt-40 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="profile-info bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
        <p><strong>Username:</strong> {userDetails.username}</p>
        <p><strong>Email:</strong> {userDetails.email}</p>
        <p><strong>Role:</strong> {userDetails.role}</p>
      </div>
      <div className="user-plans bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Your Plan Groups</h2>
        <div className="mb-4">
          <label className="block text-gray-900 dark:text-white text-sm font-bold mb-2">Select Category</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full"
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        {filteredPlanGroups.length > 0 ? (
          filteredPlanGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg mb-6 text-center shadow-lg">
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Group Name:</strong> {group.groupName}</p>
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Category:</strong> {group.category}</p>
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Number of Weeks:</strong> {group.plans[0].numberOfWeeks}</p>
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Sessions per Week:</strong> {group.plans[0].sessionsPerWeek}</p>
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Date:</strong> {formatDate(group.plans[0].date)}</p>
                <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Total Duration:</strong> {group.plans[0].duration} minutes</p>
                <button
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                  onClick={() => deletePlan(group.plans[0]._id, group._id)}
                >
                  Delete Plan
                </button>
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200 ml-2"
                  onClick={() => replan(group.plans[0]._id, group._id, group.category, group.plans[0].duration, group.plans[0].adaptedForThirdAge, group.plans[0].adaptedForChildren, group.plans[0].numberOfWeeks, group.plans[0].sessionsPerWeek)}
                >
                  Replan
                </button>
              </div>
              {group.plans.map((plan, planIndex) => (
                <div key={plan._id} className="plan mb-4">
                  <h1 className="text-lg font-bold mb-2 text-center">Week {planIndex + 1}</h1>
                  <div className="tabs mb-4 flex justify-center">
                    <button
                      className={`tab-button ${activeTabs[group._id]?.[plan._id] === 'exercises' ? 'active' : ''} py-2 px-4`}
                      onClick={() => handleTabChange(group._id, plan._id, 'exercises')}
                    >
                      Exercises
                    </button>
                    <button
                      className={`tab-button ${activeTabs[group._id]?.[plan._id] === 'feedback' ? 'active' : ''} py-2 px-4`}
                      onClick={() => handleTabChange(group._id, plan._id, 'feedback')}
                    >
                      Feedback
                    </button>
                  </div>
                  {activeTabs[group._id]?.[plan._id] === 'exercises' ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Video</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sets / Reps</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adapted for Third Age</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adapted for Children</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Duration</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                        {plan.exercises.map((exercise, exerciseIndex) => (
                          <tr key={exerciseIndex}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{exercise.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: exercise.explanation }}></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {exercise.videoUrl && (
                                <a href={exercise.videoUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                  Video
                                </a>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Sets: {exercise.sets} / Reps: {exercise.turns}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.adaptedForThirdAge ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.adaptedForChildren ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.duration} minutes</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Video</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Like</th>
                          <th className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dislike</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                        {plan.exercises.map((exercise, exerciseIndex) => {
                          const userRating = exercise.userRating || exercise.avgRating;
                          const hoverRating = hoverRatings[exercise._id] || userRating;
                          return (
                            <tr key={exerciseIndex}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{exercise.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: exercise.explanation }}></td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {exercise.videoUrl && (
                                  <a href={exercise.videoUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                    Video
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  {currentUser && (
                                    <div className="ml-2 flex">
                                      {[...Array(5)].map((_, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          className={`text-2xl ${i + 1 <= hoverRating ? "text-yellow-500" : "text-gray-300"}`}
                                          onClick={() => updateRating(exercise._id, exercise.postId, i + 1)}
                                          onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [exercise._id]: i + 1 }))}
                                          onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [exercise._id]: null }))}
                                        >
                                          &#9733;
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <button
                                  onClick={() => handleLike(exercise._id, exercise.postId, plan._id)}
                                  className={`text-2xl transform transition-transform ${exercise.liked ? "text-blue-500 scale-125" : "text-gray-300"}`}
                                  onMouseEnter={(e) => e.target.classList.add("scale-110")}
                                  onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                                >
                                  &#128077;
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <button
                                  onClick={() => handleDislike(exercise._id, exercise.postId, plan._id)}
                                  className={`text-2xl transform transition-transform ${exercise.disliked ? "text-red-500 scale-125" : "text-gray-300"}`}
                                  onMouseEnter={(e) => e.target.classList.add("scale-110")}
                                  onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                                >
                                  &#128078;
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-900 dark:text-white">No plan groups found for the selected category.</p>
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
