// pages/CategorySelection.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../context/CategoryContext';
import { useApi } from '../context/ApiContext';

const CategorySelection = () => {
  const [category, setCategory] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const { categories } = useCategories();
  const apiUrl = useApi();
  const navigate = useNavigate();

  const handleGeneratePlan = async () => {
    try {
      const res = await axios.post(`${apiUrl}/api/plans/generate`, {
        category,
        time: { hours, minutes, seconds }
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/plan', { state: { plan: res.data } });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="category-selection p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Exercise Plan</h1>
      <div className="mb-4">
        <label className="block mb-2">Select Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Set Duration</label>
        <div className="flex space-x-2">
          <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours" className="w-full p-2 border border-gray-300 rounded-md" />
          <input type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Minutes" className="w-full p-2 border border-gray-300 rounded-md" />
          <input type="number" value={seconds} onChange={(e) => setSeconds(e.target.value)} placeholder="Seconds" className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>
      <button onClick={handleGeneratePlan} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200">Generate Plan</button>
    </div>
  );
};

export default CategorySelection;
