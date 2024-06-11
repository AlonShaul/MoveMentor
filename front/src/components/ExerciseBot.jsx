// src/components/ExerciseBot.js
import React, { useState } from 'react';
import axios from 'axios';
// import { useAuth } from '../context/authContext';

const ExerciseBot = () => {
//   const { currentUser } = useAuth();
  const [plan, setPlan] = useState(null);

  const handleGeneratePlan = async () => {
    try {
      const response = await axios.get('http://localhost:8800/api/posts/plan/generate', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlan(response.data);
    } catch (err) {
      console.error('Error generating plan:', err);
    }
  };

  return (
    <div className="exercise-bot-widget">
      <button onClick={handleGeneratePlan}>Generate Exercise Plan</button>
      {plan && (
        <div>
          <h3>Your Exercise Plan</h3>
          <ul>
            {plan.exercises.map(exercise => (
              <li key={exercise.postId}>{exercise.title} - {exercise.duration.hours}h {exercise.duration.minutes}m {exercise.duration.seconds}s</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExerciseBot;
