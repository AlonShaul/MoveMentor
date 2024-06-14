import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/authContext';

const GeneratePlan = () => {
  const { categories } = useCategories();
  const apiUrl = useApi();
  const { currentUser } = useAuth(); // Get currentUser from AuthContext
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [adaptedForThirdAge, setAdaptedForThirdAge] = useState(false);
  const [adaptedForChildren, setAdaptedForChildren] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const generatePlan = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from local storage
      const response = await fetch(`${apiUrl}/api/plans?category=${category}&adaptedForThirdAge=${adaptedForThirdAge}&adaptedForChildren=${adaptedForChildren}&duration=${duration}&userId=${currentUser._id}`, { // Include userId
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Use the token here
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (response.ok) {
        setPlan(data.plan);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to fetch the plan');
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen mt-20">
      <div className="flex-grow container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Generate Exercise Plan</h1>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
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
          <label className="block text-gray-700 text-sm font-bold mb-2">Duration (minutes)</label>
          <input
            type="number"
            placeholder="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={adaptedForThirdAge}
            onChange={(e) => setAdaptedForThirdAge(e.target.checked)}
            className="mr-2"
          />
          <label>Adapted for Third Age</label>
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={adaptedForChildren}
            onChange={(e) => setAdaptedForChildren(e.target.checked)}
            className="mr-2"
          />
          <label>Adapted for Children</label>
        </div>
        <div className="mb-4">
          <button
            onClick={generatePlan}
            className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600"
          >
            Generate Plan
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {plan && (
          <div>
            <h2 className="text-xl font-bold mb-4">Generated Plan</h2>
            <p className="mb-2"><strong>Username:</strong> {currentUser.username}</p>
            <p className="mb-2"><strong>Category:</strong> {plan.category}</p>
            <p className="mb-4"><strong>Total Duration:</strong> {plan.duration} minutes</p>
            {plan.exercises.map((exercise, index) => (
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
        )}
      </div>
    </div>
  );
};

export default GeneratePlan;
