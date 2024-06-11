// pages/ChoosePlan.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { Link } from 'react-router-dom';

const ChoosePlan = () => {
  const apiUrl = useApi();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [duration, setDuration] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // Fetch categories from your API or context
    setCategories(['Back Pain', 'Neck Pain', 'Shoulder Pain', 'Knee Pain', 'Ankle Pain']);
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDurationChange = (e) => {
    const { name, value } = e.target;
    setDuration(prevState => ({ ...prevState, [name]: parseInt(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalDuration = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;

    try {
      const res = await axios.get(`${apiUrl}/api/posts?cat=${selectedCategory}&maxDuration=${totalDuration}`);
      setPlans(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="choose-plan-page p-4 md:p-8 mt-10">
      <h1 className="text-2xl font-bold mb-4">Choose a Plan</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Category:</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Duration (HH:MM:SS):</label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="hours"
              value={duration.hours}
              onChange={handleDurationChange}
              placeholder="Hours"
              className="w-1/3 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              name="minutes"
              value={duration.minutes}
              onChange={handleDurationChange}
              placeholder="Minutes"
              className="w-1/3 p-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              name="seconds"
              value={duration.seconds}
              onChange={handleDurationChange}
              placeholder="Seconds"
              className="w-1/3 p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200">
          Find Plans
        </button>
      </form>
      <div className="plans bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Matching Plans</h2>
        {plans.length === 0 ? (
          <p>No matching plans found.</p>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className="plan mb-4">
              <p><strong>Title:</strong> {plan.title}</p>
              <p><strong>Duration:</strong> {`${Math.floor(plan.duration / 3600)}h ${Math.floor((plan.duration % 3600) / 60)}m ${plan.duration % 60}s`}</p>
              <Link to={`/post/${plan._id}`} className="text-blue-500">View Plan</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChoosePlan;
