import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const apiUrl = useApi();
  const [userDetails, setUserDetails] = useState(null);
  const [lastPlan, setLastPlan] = useState(null);

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

    const fetchLastUserPlan = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/users/${currentUser._id}/plans`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.data.length > 0) {
          setLastPlan(res.data[0]); // Set the most recent plan
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (currentUser) {
      fetchUserDetails();
      fetchLastUserPlan();
    }
  }, [currentUser, apiUrl]);

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
    setLastPlan(prevPlan => {
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
    setLastPlan(prevPlan => {
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
    setLastPlan(prevPlan => {
      const updatedExercises = prevPlan.exercises.map((exercise, index) => {
        if (index === exerciseIndex) {
          return { ...exercise, liked: false, disliked: true };
        }
        return exercise;
      });
      return { ...prevPlan, exercises: updatedExercises };
    });
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
        <h2 className="text-xl font-bold mb-4 text-center">The Plan:</h2>
        {lastPlan ? (
          <div className="plan mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg mb-6 text-center shadow-lg">
              <p className="text-xl font-semibold text-blue-700"><strong>Category:</strong> {lastPlan.category}</p>
              <p className="text-xl font-semibold text-blue-700"><strong>Number of Weeks:</strong> {lastPlan.numberOfWeeks}</p>
              <p className="text-xl font-semibold text-blue-700"><strong>Sessions per Week:</strong> {lastPlan.sessionsPerWeek}</p>
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
                {lastPlan.exercises.map((exercise, index) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exercise.duration} minutes</td> {/* Total Duration */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No plans generated yet.</p>
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
