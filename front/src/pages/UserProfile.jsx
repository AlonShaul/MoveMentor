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
  const [plans, setPlans] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error] = useState('');

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
        const res = await axios.get(`${apiUrl}/api/users/${currentUser._id}/plans-by-category`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.data.length > 0) {
          const sortedPlans = res.data.sort((a, b) => new Date(b.plan.date) - new Date(a.plan.date));
          setPlans(sortedPlans);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (currentUser) {
      fetchUserDetails();
      fetchUserPlans();
    }
  }, [currentUser, apiUrl]);

  const deletePlan = async (planId) => {
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
      setPlans((prevPlans) => prevPlans.filter(plan => plan.plan._id !== planId));
    } catch (err) {
      console.log(err);
    }
  };
  

  const renderStars = (rating, index) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-2xl ${i <= rating ? "text-yellow-500" : "text-gray-300"}`}
          onClick={() => handleRating(index, i)}
        >
          &#9733;
        </button>
      );
    }
    return stars;
  };

  const handleRating = (exerciseIndex, rating, planIndex) => {
    setPlans(prevPlans => {
      const updatedPlans = [...prevPlans];
      const updatedExercises = updatedPlans[planIndex].plan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, rating: rating };
        }
        return exercise;
      });
      updatedPlans[planIndex].plan.exercises = updatedExercises;
      return updatedPlans;
    });
  };

  const handleLike = (exerciseIndex, planIndex) => {
    setPlans(prevPlans => {
      const updatedPlans = [...prevPlans];
      const updatedExercises = updatedPlans[planIndex].plan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, liked: true, disliked: false };
        }
        return exercise;
      });
      updatedPlans[planIndex].plan.exercises = updatedExercises;
      return updatedPlans;
    });
  };

  const handleDislike = (exerciseIndex, planIndex) => {
    setPlans(prevPlans => {
      const updatedPlans = [...prevPlans];
      const updatedExercises = updatedPlans[planIndex].plan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, liked: false, disliked: true };
        }
        return exercise;
      });
      updatedPlans[planIndex].plan.exercises = updatedExercises;
      return updatedPlans;
    });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const groupPlansByCategory = (plans) => {
    const grouped = plans.reduce((acc, planWrapper) => {
      if (!acc[planWrapper.category]) {
        acc[planWrapper.category] = [];
      }
      acc[planWrapper.category].push(planWrapper);
      return acc;
    }, {});

    Object.keys(grouped).forEach(category => {
      grouped[category] = grouped[category].slice(0, 5);
    });

    return grouped;
  };

  const groupedPlans = groupPlansByCategory(plans || []);
  const filteredPlans = selectedCategory ? groupedPlans[selectedCategory] || [] : Object.values(groupedPlans).flat();

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
        <h2 className="text-xl font-bold mb-4 text-center">Your Plans</h2>
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
        {filteredPlans.length > 0 ? (
          filteredPlans.map((planWrapper, planIndex) => (
            <div key={planWrapper._id} className="plan mb-4">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg mb-6 text-center shadow-lg">
                <p className="text-xl font-semibold text-blue-700"><strong>Category:</strong> {planWrapper.category}</p>
                {planWrapper.plan && typeof planWrapper.plan === 'object' && (
                  <>
                    <p className="text-xl font-semibold text-blue-700"><strong>Number of Weeks:</strong> {planWrapper.plan.numberOfWeeks}</p>
                    <p className="text-xl font-semibold text-blue-700"><strong>Sessions per Week:</strong> {planWrapper.plan.sessionsPerWeek}</p>
                    <p className="text-xl font-semibold text-blue-700"><strong>Date:</strong> {formatDate(planWrapper.plan.date)}</p>
                    <button
                      className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                      onClick={() => deletePlan(planWrapper.plan._id)}
                    >
                      Delete Plan
                    </button>
                  </>
                )}
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Like / Dislike</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adapted for Third Age</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adapted for Children</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {planWrapper.plan && planWrapper.plan.exercises && planWrapper.plan.exercises.map((exercise, exerciseIndex) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderStars(exercise.rating, exerciseIndex)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleLike(exerciseIndex, planIndex)}
                          className={`text-2xl transform transition-transform ${exercise.liked ? "text-blue-500 scale-125" : "text-gray-300"}`}
                          onMouseEnter={(e) => e.target.classList.add("scale-110")}
                          onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                        >
                          &#128077;
                        </button>
                        <button
                          onClick={() => handleDislike(exerciseIndex, planIndex)}
                          className={`text-2xl transform transition-transform ${exercise.disliked ? "text-red-500 scale-125" : "text-gray-300"}`}
                          onMouseEnter={(e) => e.target.classList.add("scale-110")}
                          onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                        >
                          &#128078;
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise.adaptedForThirdAge ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise.adaptedForChildren ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise.duration} minutes</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No plans found for the selected category.</p>
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
