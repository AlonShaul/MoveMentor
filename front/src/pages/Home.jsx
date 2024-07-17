import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/authContext";
import StarRating from "../components/StarRating"; // Import the StarRating component

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Start with the first video as the highlighted one
  const location = useLocation();
  const apiUrl = useApi();
  const { currentUser } = useAuth();

  const cat = new URLSearchParams(location.search).get('cat');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/posts`, {
          params: { category: cat }
        });
        const filteredPosts = cat ? res.data.filter((post) => post.cat === cat) : res.data;
        setPosts(filteredPosts);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat, apiUrl]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length);
  };

  const handleClick = (index) => {
    setCurrentIndex(index);
  };

  const getVisiblePosts = () => {
    if (posts.length < 3) {
      return posts;
    }

    const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
    const nextIndex = (currentIndex + 1) % posts.length;

    return [
      { ...posts[prevIndex], position: 'left', index: prevIndex },
      { ...posts[currentIndex], position: 'center', index: currentIndex },
      { ...posts[nextIndex], position: 'right', index: nextIndex },
    ];
  };

  return (
    <div className="home mt-40 p-4 md:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="carousel-container relative w-full flex justify-center items-center">
        <button onClick={handlePrev} className="absolute left-0 z-10 p-2 bg-gray-800 text-white rounded-full focus:outline-none">
          &lt;
        </button>
        <div className="carousel w-full flex justify-center items-center overflow-hidden">
          {getVisiblePosts().map((post) => (
            <div
              key={post._id}
              onClick={() => handleClick(post.index)}
              className={`carousel-item transition-all duration-700 ease-in-out cursor-pointer ${
                post.position === 'center' ? 'active' : 'inactive'
              }`}
              style={{ minWidth: 'calc(100% / 3)', maxWidth: 'calc(100% / 3)' }}
            >
              <div className={`post bg-white dark:bg-gray-800 dark:text-white shadow-md rounded-lg overflow-hidden mx-2 ${
                post.position === 'center' ? 'scale-105 z-10' : 'scale-90 z-0'
              } rounded-lg`}
              >
                <div className="media w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg">
                  {post.img && post.img.includes("video") ? (
                    <video className="w-full h-full object-cover rounded-t-lg" controls style={{ objectFit: 'contain' }}>
                      <source src={post.img} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img className="w-full h-full object-cover rounded-t-lg" src={post.img} alt="" />
                  )}
                </div>
                <div className="content p-4 flex flex-col items-center justify-center h-56 rounded-b-lg"> {/* Adjusted height */}
                  <Link className="link" to={`/post/${post._id}`}>
                    <h1 className="bg-cyan-500 dark:bg-cyan-700 text-white text-xl font-bold p-2 rounded">{post.title}</h1>
                  </Link>
                  <div className="mt-2 text-gray-700 dark:text-gray-300">
                    <StarRating rating={post.rating} /> {/* Use the StarRating component */}
                  </div>
                  {currentUser?.role === 'admin' && (
                    <Link className="link" to={`/write?edit=${post._id}`} state={post}>
                      <button className="readMoreHome mt-4 bg-cyan-500 dark:bg-cyan-700 text-white py-2 px-4 rounded hover:bg-cyan-600 dark:hover:bg-cyan-800 transition duration-200">
                        Edit
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleNext} className="absolute right-0 z-10 p-2 bg-gray-800 text-white rounded-full focus:outline-none">
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Home;
