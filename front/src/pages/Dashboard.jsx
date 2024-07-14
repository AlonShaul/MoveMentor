import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { Bar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin

Chart.register(ChartDataLabels); // Register the plugin

const Dashboard = () => {
  const [categoryRatings, setCategoryRatings] = useState({});
  const [likesDislikes, setLikesDislikes] = useState({});
  const [userRatingsCount, setUserRatingsCount] = useState([]);
  const [postRatingsCount, setPostRatingsCount] = useState([]);
  const [exerciseRatings, setExerciseRatings] = useState([]);
  const [topExercises, setTopExercises] = useState([]);
  const [topDislikedExercises, setTopDislikedExercises] = useState([]); // State for top disliked exercises
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ratingsResponse = await axios.get(`${apiUrl}/api/posts/category/ratings`);
        const likesDislikesResponse = await axios.get(`${apiUrl}/api/posts/category/likesdislikes`);
        const userRatingsCountResponse = await axios.get(`${apiUrl}/api/posts/user/ratingscount`);
        const postRatingsCountResponse = await axios.get(`${apiUrl}/api/posts/ratings/count`);
        const exerciseRatingsResponse = await axios.get(`${apiUrl}/api/posts/exercises/ratings`);
        const topExercisesResponse = await axios.get(`${apiUrl}/api/posts/top/likes`);
        const topDislikedExercisesResponse = await axios.get(`${apiUrl}/api/posts/top/dislikes`); // Fetch top disliked exercises

        setCategoryRatings(ratingsResponse.data);
        setLikesDislikes(likesDislikesResponse.data);
        setUserRatingsCount(userRatingsCountResponse.data);
        setPostRatingsCount(postRatingsCountResponse.data);
        setExerciseRatings(exerciseRatingsResponse.data);
        setTopExercises(topExercisesResponse.data);
        setTopDislikedExercises(topDislikedExercisesResponse.data); // Set top disliked exercises data
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const colors = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)',
    'rgba(50, 205, 50, 0.2)',
    'rgba(255, 69, 0, 0.2)',
    'rgba(0, 191, 255, 0.2)',
    'rgba(255, 20, 147, 0.2)'
  ];

  const borderColor = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(50, 205, 50, 1)',
    'rgba(255, 69, 0, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(255, 20, 147, 1)'
  ];

  const ratingsData = {
    labels: Object.keys(categoryRatings),
    datasets: [
      {
        label: 'Average Rating',
        data: Object.values(categoryRatings).map(avg => avg.toFixed(2)),
        backgroundColor: colors.slice(0, Object.keys(categoryRatings).length),
        borderColor: borderColor.slice(0, Object.keys(categoryRatings).length),
        borderWidth: 1,
      },
    ],
  };

  const likesDislikesData = {
    labels: Object.keys(likesDislikes),
    datasets: [
      {
        label: 'Likes',
        data: Object.values(likesDislikes).map(data => data.likes),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Dislikes',
        data: Object.values(likesDislikes).map(data => data.dislikes),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const userRatingsData = {
    labels: userRatingsCount.map(user => user.username),
    datasets: [
      {
        label: 'Number of Ratings',
        data: userRatingsCount.map(user => user.count),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const postRatingsData = {
    labels: postRatingsCount.map(post => post.title),
    datasets: [
      {
        label: 'Number of Ratings',
        data: postRatingsCount.map(post => Math.round(post.ratingCount)),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const exerciseRatingsData = {
    labels: exerciseRatings.map(exercise => `${exercise.title} (${exercise.category})`),
    datasets: [
      {
        label: 'Average Rating',
        data: exerciseRatings.map(exercise => parseFloat(exercise.averageRating)),
        backgroundColor: colors.slice(0, exerciseRatings.length),
        borderColor: borderColor.slice(0, exerciseRatings.length),
        borderWidth: 1,
      },
    ],
  };

  const topExercisesData = {
    labels: topExercises.map(exercise => exercise.title),
    datasets: [
      {
        label: 'Number of Likes',
        data: topExercises.map(exercise => exercise.likes),
        backgroundColor: colors.slice(0, topExercises.length),
        borderColor: borderColor.slice(0, topExercises.length),
        borderWidth: 1,
        datalabels: {
          color: '#black',
          formatter: (value, context) => {
            return value; // Display the number of likes
          },
        },
      },
    ],
  };

  const topDislikedExercisesData = {
    labels: topDislikedExercises.map(exercise => exercise.title),
    datasets: [
      {
        label: 'Number of Dislikes',
        data: topDislikedExercises.map(exercise => exercise.dislikes),
        backgroundColor: colors.slice(0, topDislikedExercises.length),
        borderColor: borderColor.slice(0, topDislikedExercises.length),
        borderWidth: 1,
        datalabels: {
          color: '#black',
          formatter: (value, context) => {
            return value; // Display the number of dislikes
          },
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        color: 'black',
        formatter: (value, context) => {
          return value;
        },
        font: {
          weight: 'bold',
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4 mt-20">
      <h1 className="flex justify-center text-3xl font-bold mb-4 text-white">Dashboard</h1>
      <h2 className="flex justify-center text-2xl font-bold mb-4 text-white">Category Ratings</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-8" style={{ height: '400px' }}>
        <Bar data={ratingsData} options={options} />
      </div>
      <h2 className="flex justify-center text-2xl font-bold mb-4 text-white">Likes and Dislikes by Category</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-8" style={{ height: '400px' }}>
        <Bar data={likesDislikesData} options={options} />
      </div>
      <h2 className="flex justify-center text-2xl font-bold mb-4 text-white">Most Active Users</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-8" style={{ height: '400px' }}>
        <Bar data={userRatingsData} options={options} />
      </div>
      <h2 className="flex justify-center text-2xl font-bold mb-4 text-white">Most Rated Posts</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-8" style={{ height: '400px' }}>
        <Bar data={postRatingsData} options={options} />
      </div>
      <h2 className="flex justify-center text-2xl font-bold mb-4 text-white">Exercise Ratings</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-8" style={{ height: '400px' }}>
        <Bar data={exerciseRatingsData} options={options} />
      </div>
      <h2 className="flex justify-center text-2xl font-bold mb-4 text-white">Top 5 Exercises by Likes</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-8" style={{ height: '400px' }}>
        <Pie data={topExercisesData} options={options} plugins={[ChartDataLabels]} />
      </div>
      <h2 className="flex justify-center text-2xl font-bold mb-4 text-white">Top 5 Exercises by Dislikes</h2>
      <div className="bg-white shadow rounded-lg p-4 mb-8" style={{ height: '400px' }}>
        <Pie data={topDislikedExercisesData} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
};

export default Dashboard;
