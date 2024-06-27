import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/authContext';
import axios from 'axios';

const GeneratePlan = () => {
  const { categories } = useCategories();
  const apiUrl = useApi();
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [age, setAge] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState('');
  const [numberOfWeeks, setNumberOfWeeks] = useState('');
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const savePlanToUserProfile = async (planId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/users/plans`, {
        userId: currentUser._id,
        category,
        planId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Failed to save the plan to the user profile:', err);
    }
  };

  const generatePlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/plans?category=${category}&duration=${duration}&userId=${currentUser._id}&age=${age}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        setPlan(data.plan);
        await savePlanToUserProfile(data.plan._id);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch the plan');
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

  const handleRating = (exerciseIndex, rating) => {
    setPlan(prevPlan => {
      const updatedExercises = prevPlan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, rating: rating };
        }
        return exercise;
      });
      return { ...prevPlan, exercises: updatedExercises };
    });
  };

  const handleLike = (exerciseIndex) => {
    setPlan(prevPlan => {
      const updatedExercises = prevPlan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, liked: true, disliked: false };
        }
        return exercise;
      });
      return { ...prevPlan, exercises: updatedExercises };
    });
  };

  const handleDislike = (exerciseIndex) => {
    setPlan(prevPlan => {
      const updatedExercises = prevPlan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, liked: false, disliked: true };
        }
        return exercise;
      });
      return { ...prevPlan, exercises: updatedExercises };
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen mt-20">
      <div className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">Generate Exercise Plan</h1>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Select a category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Duration (minutes)</label>
          <input
            type="number"
            placeholder="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Age</label>
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Number of Training Sessions per Week</label>
          <input
            type="number"
            placeholder="Sessions per Week"
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">Number of Weeks</label>
          <input
            type="number"
            placeholder="Number of Weeks"
            value={numberOfWeeks}
            onChange={(e) => setNumberOfWeeks(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <button
            onClick={generatePlan}
            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 font-bold"
          >
            Generate Plan
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {plan && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">Generated Plan</h2>
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg mb-6 text-center shadow-lg">
              <p className="text-xl font-semibold text-blue-700"><strong>Category:</strong> {plan.category}</p>
              <p className="text-xl font-semibold text-blue-700"><strong>Number of Weeks:</strong> {plan.numberOfWeeks}</p>
              <p className="text-xl font-semibold text-blue-700"><strong>Sessions per Week:</strong> {plan.sessionsPerWeek}</p>
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
                {plan.exercises.map((exercise, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercise.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: exercise.explanation }}></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exercise.videoUrl && (
                        <a href={exercise.videoUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                          Video
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{renderStars(exercise.rating, index)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleLike(index)}
                        className={`text-2xl transform transition-transform ${exercise.liked ? "text-blue-500 scale-125" : "text-gray-300"}`}
                        onMouseEnter={(e) => e.target.classList.add("scale-110")}
                        onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                      >
                        &#128077;
                      </button>
                      <button
                        onClick={() => handleDislike(index)}
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
        )}
      </div>
    </div>
  );
};

export default GeneratePlan;