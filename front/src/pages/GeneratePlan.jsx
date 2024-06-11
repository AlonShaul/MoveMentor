import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { useApi } from '../context/ApiContext';

const GeneratePlan = () => {
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [adaptedForThirdAge, setAdaptedForThirdAge] = useState(false);
  const [adaptedForChildren, setAdaptedForChildren] = useState(false);
  const [plan, setPlan] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const apiUrl = useApi();

  const handleGenerate = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/posts/plan/generate`, {
        params: { 
          duration, 
          category, 
          adaptedForThirdAge, 
          adaptedForChildren 
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlan(res.data.plan);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="generate-plan p-4 md:p-8 mt-10">
      <h1 className="text-2xl font-bold mb-4">Generate Exercise Plan</h1>
      <div className="form-group mb-4">
        <label>Duration (minutes):</label>
        <input 
          type="number" 
          value={duration} 
          onChange={(e) => setDuration(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md" 
        />
      </div>
      <div className="form-group mb-4">
        <label>Category:</label>
        <input 
          type="text" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md" 
        />
      </div>
      <div className="form-group mb-4">
        <label>
          <input 
            type="checkbox" 
            checked={adaptedForThirdAge} 
            onChange={(e) => setAdaptedForThirdAge(e.target.checked)} 
          /> 
          Adapted for Third Age
        </label>
      </div>
      <div className="form-group mb-4">
        <label>
          <input 
            type="checkbox" 
            checked={adaptedForChildren} 
            onChange={(e) => setAdaptedForChildren(e.target.checked)} 
          /> 
          Adapted for Children
        </label>
      </div>
      <button 
        onClick={handleGenerate} 
        className="bg-blue-500 text-white py-2 px-4 rounded-md"
      >
        Generate Plan
      </button>

      {plan && (
        <div className="plan-results mt-8">
          <h2 className="text-xl font-bold mb-4">Generated Plan</h2>
          {plan.map(post => (
            <div key={post._id} className="plan-item mb-4">
              <h3 className="text-lg font-bold">{post.title}</h3>
              <p>{post.explanation}</p>
              <video controls className="w-full h-auto">
                <source src={post.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>Duration: {`${post.duration.hours}h ${post.duration.minutes}m ${post.duration.seconds}s`}</p>
              <p>Category: {post.category}</p>
              <p>Adapted for Third Age: {post.adaptedForThirdAge ? 'Yes' : 'No'}</p>
              <p>Adapted for Children: {post.adaptedForChildren ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeneratePlan;
