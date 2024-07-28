import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useApi } from '../context/ApiContext';
import { Bar, Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

const Dashboard = () => {
  const [categoryRatings, setCategoryRatings] = useState({});
  const [likesDislikes, setLikesDislikes] = useState({});
  const [userRatingsCount, setUserRatingsCount] = useState([]);
  const [postRatingsCount, setPostRatingsCount] = useState([]);
  const [exerciseRatings, setExerciseRatings] = useState([]);
  const [topExercises, setTopExercises] = useState([]);
  const [topDislikedExercises, setTopDislikedExercises] = useState([]);
  const [categoryExerciseRatings, setCategoryExerciseRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
        const topDislikedExercisesResponse = await axios.get(`${apiUrl}/api/posts/top/dislikes`);
        const categoryExerciseRatingsResponse = await axios.get(`${apiUrl}/api/posts/category/exercises/ratings`);

        setCategoryRatings(ratingsResponse.data);
        setLikesDislikes(likesDislikesResponse.data);
        setUserRatingsCount(userRatingsCountResponse.data);
        setPostRatingsCount(postRatingsCountResponse.data);
        setExerciseRatings(exerciseRatingsResponse.data);
        setTopExercises(topExercisesResponse.data);
        setTopDislikedExercises(topDislikedExercisesResponse.data);
        setCategoryExerciseRatings(categoryExerciseRatingsResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400">Error: {error}</div>;

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
        label: 'דירוג ממוצע',
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
        label: 'מספר הדירוגים',
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
        label: 'מספר הדירוגים',
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
        label: 'דירוג ממוצע',
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
          color: '#000000',
          formatter: (value, context) => {
            return value;
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
          color: '#000000',
          formatter: (value, context) => {
            return value;
          },
        },
      },
    ],
  };

  const mixedChartData = categoryExerciseRatings.map(category => ({
    labels: category.exercises.map(exercise => exercise.title),
    datasets: [
      {
        type: 'bar',
        label: 'דירוג ממוצע',
        data: category.exercises.map(exercise => exercise.averageRating),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        type: 'line',
        label: 'מספר הדירוגים',
        data: category.exercises.map(exercise => exercise.ratingCount),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        fill: false,
      },
    ],
    categoryName: category.categoryName // Add category name to each chart data
  }));

  const carouselOptions = {
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
      x: {
        ticks: {
          font: {
            size: 20,
          },
        },
      },
    },
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mixedChartData.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mixedChartData.length) % mixedChartData.length);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto p-4 mt-40">
        <h1 className="flex justify-center text-6xl font-bold mb-16">דשבורד</h1>
        <h2 className="flex justify-center text-2xl font-bold mb-4">דירוג כוכבים לפי קטגוריות</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">גרף מקלות המציג את ממוצע דירוג הכוכבים עבור כל קטגוריה.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הגרף מאפשר לראות את הביצועים של כל קטגוריה בהשוואה לאחרות בצורה ברורה וויזואלית.</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-24">
          <div className="h-96">
            <Bar data={ratingsData} options={carouselOptions} />
          </div>
        </div>
        <h2 dir='rtl' className="flex justify-center text-2xl font-bold mb-4">דירוג Likes ו - DisLike לפי קטגוריות</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">גרף מקלות המציג את מספר הלייקים והדיסלייקים עבור כל קטגוריה.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הגרף מאפשר להשוות בין הפופולריות וההעדפות של משתמשים בכל קטגוריה בצורה ברורה וויזואלית.</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-24">
          <div className="h-96">
            <Bar data={likesDislikesData} options={carouselOptions} />
          </div>
        </div>
        <h2 className="flex justify-center text-2xl font-bold mb-4">רמת פעילות המשתמשים</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">גרף מקלות המציג את רמת הפעילות של כל משתמש על פי מספר הדירוגים שהעניק.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הגרף מאפשר להבחין במידת המעורבות של המשתמשים ולזהות משתמשים פעילים במיוחד.</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-24">
          <div className="h-96">
            <Bar data={userRatingsData} options={carouselOptions} />
          </div>
        </div>
        <h2 className="flex justify-center text-2xl font-bold mb-4">דירוג התרגילים הפופולריים ביותר</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">גרף מקלות המציג את הפופולריות של כל תרגיל על פי מספר הדירוגים שקיבל מכלל המשתמשים.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הגרף מאפשר לראות אילו תרגילים מועדפים על המשתמשים ולזהות את התרגילים האהובים ביותר.</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-24">
          <div className="h-96">
            <Bar data={postRatingsData} options={carouselOptions} />
          </div>
        </div>
        <h2 className="flex justify-center text-2xl font-bold mb-4">דירוג כוכבים לתרגילים</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">גרף מקלות המציג את הדירוג הכללי של כל תרגיל.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הגרף מאפשר לראות את ממוצע דירוג הכוכבים שהתקבל עבור כל תרגיל, ובכך לזהות את התרגילים המדורגים ביותר על ידי המשתמשים.</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-24">
          <div className="h-96">
            <Bar data={exerciseRatingsData} options={carouselOptions} />
          </div>
        </div>
        <h2 className="flex justify-center text-2xl font-bold mb-4">דירוג חמשת התרגילים האהובים ביותר</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">גרף המציג את חמשת התרגילים שקיבלו את מספר הלייקים הגבוה ביותר מכלל המשתמשים.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הגרף מאפשר לראות את התרגילים הפופולריים ביותר ולהבין אילו תרגילים מועדפים במיוחד על ידי המשתמשים.</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-24">
          <div className="h-96">
            <Pie data={topExercisesData} options={carouselOptions} plugins={[ChartDataLabels]} />
          </div>
        </div>
        <h2 className="flex justify-center text-2xl font-bold mb-4">דירוג חמשת התרגילים הפחות אהובים</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">גרף המציג את חמשת התרגילים שקיבלו את מספר הדיסלייקים הגבוה ביותר מכלל המשתמשים.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הגרף מאפשר לזהות את התרגילים הפחות מועדפים ולהבין אילו תרגילים פחות אהובים על משתמשים.</h2>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-24">
          <div className="h-96">
            <Pie data={topDislikedExercisesData} options={carouselOptions} plugins={[ChartDataLabels]} />
          </div>
        </div>
        <h2 className="flex justify-center text-2xl font-bold mb-4">דירוג כוכבים לכל התרגילים לפי קטגוריות</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">קרוסלה המציגה את כל הקטגוריות, ובתוך כל קטגוריה מוצג הדירוג הכולל של כל תרגיל.</h2>
        <h2 dir='rtl' className="flex justify-center text-1xl font-bold mb-4">הקרוסלה מאפשרת לדפדף בין הקטגוריות השונות ולראות את דירוג הכוכבים של כל תרגיל בצורה נוחה ומסודרת.</h2>
        <div className="carousel-container relative w-full flex justify-center items-center">
          <button onClick={handlePrev} className="absolute left-0 z-10 p-2 bg-gray-800 text-white rounded-full focus:outline-none">
            &lt;
          </button>
          <div className="carousel w-full flex justify-center items-center overflow-hidden">
            <div className="carousel-item transition-all duration-700 ease-in-out cursor-pointer w-full h-96 mb-12">
              <h3 className="text-center text-xl font-bold mb-2">{mixedChartData[currentIndex].categoryName}</h3> {/* Add category title */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-8 w-full h-full">
                <Bar data={mixedChartData[currentIndex]} options={carouselOptions} />
              </div>
            </div>
          </div>
          <button onClick={handleNext} className="absolute right-0 z-10 p-2 bg-gray-800 text-white rounded-full focus:outline-none">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
