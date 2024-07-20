import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/authContext';
import axios from 'axios';

const GeneratePlan = () => {
  const { categories } = useCategories();
  const apiUrl = useApi();
  const { currentUser } = useAuth(); 
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
      setError(''); // Clear previous errors
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/plans`, {
        params: {
          category,
          duration,
          userId: currentUser._id,
          age,
          numberOfWeeks,
          sessionsPerWeek
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 200) {
        const data = response.data;
        console.log('Generated Plan:', data.plan); // Debug log
        setPlan(data.plan);
        await savePlanToUserProfile(data.plan._id);
      } else {
        setError(response.data.error);
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
    <div dir='rtl' className="relative flex flex-col min-h-screen mt-40 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">יצירת תוכנית שיקום אישית</h1>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">קטגוריה</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">בחר קטגוריית פציעה</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">זמן אימון (דקות)</label>
          <input
            type="number"
            placeholder="מה משך האימון שתרצה?"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">גיל</label>
          <input
            type="number"
            placeholder="מהו גילך?"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">מספר אימונים בשבוע</label>
          <input
            type="number"
            placeholder="כמה פעמים בשבוע תרצה להתאמן?"
            value={sessionsPerWeek}
            onChange={(e) => setSessionsPerWeek(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">זמן שיקום (שבועות)</label>
          <input
            type="number"
            placeholder="מה משך זמן השיקום לפציעתך?"
            value={numberOfWeeks}
            onChange={(e) => setNumberOfWeeks(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <button
            onClick={generatePlan}
            className="bg-blue-500 dark:bg-blue-700 text-white p-2 rounded w-full hover:bg-blue-600 dark:hover:bg-blue-800 font-bold"
          >
            צור תוכנית
          </button>
        </div>
        {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
        {plan && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">Generated Plan</h2>
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 p-6 rounded-lg mb-6 text-center shadow-lg">
              <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Category:</strong> {plan.category}</p>
              <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Number of Weeks:</strong> {plan.numberOfWeeks}</p>
              <p className="text-xl font-semibold text-blue-700 dark:text-blue-300"><strong>Sessions per Week:</strong> {plan.sessionsPerWeek}</p>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Like / Dislike</th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adapted for Third Age</th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adapted for Children</th>
                  <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Duration</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {plan.exercises.map((exercise, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{exercise.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: exercise.explanation }}></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {exercise.videoUrl && (
                        <a href={exercise.videoUrl} className="text-blue-500 dark:text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
                          Video
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{renderStars(exercise.rating, index)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleLike(index)}
                        className={`text-2xl transform transition-transform ${exercise.liked ? "text-blue-500 dark:text-blue-300 scale-125" : "text-gray-300 dark:text-gray-500"}`}
                        onMouseEnter={(e) => e.target.classList.add("scale-110")}
                        onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                      >
                        &#128077;
                      </button>
                      <button
                        onClick={() => handleDislike(index)}
                        className={`text-2xl transform transition-transform ${exercise.disliked ? "text-red-500 dark:text-red-300 scale-125" : "text-gray-300 dark:text-gray-500"}`}
                        onMouseEnter={(e) => e.target.classList.add("scale-110")}
                        onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                      >
                        &#128078;
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.adaptedForThirdAge ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.adaptedForChildren ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exercise.duration} minutes</td>
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
