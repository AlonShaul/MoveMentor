import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const Menu = ({ cat, currentPostId }) => {
  const [posts, setPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const postsPerPage = 2;

  const apiUrl = useApi();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (cat) {
          const res = await axios.get(`${apiUrl}/api/posts?cat=${cat}`);
          const filteredPosts = res.data.filter(post => post._id !== currentPostId);
          setPosts(filteredPosts);
          const filteredByCategory = filteredPosts.filter(post => post.cat === cat);
          setVisiblePosts(filteredByCategory.slice(0, postsPerPage));
          setHasMore(filteredByCategory.length > postsPerPage);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (cat) {
      fetchData();
    }
  }, [cat, apiUrl, currentPostId]);

  const loadMorePosts = () => {
    const nextPage = currentPage + 1;
    const newVisiblePosts = posts
      .filter(post => post.cat === cat)
      .slice(0, nextPage * postsPerPage);
    setVisiblePosts(newVisiblePosts);
    setCurrentPage(nextPage);
    setHasMore(posts.filter(post => post.cat === cat).length > newVisiblePosts.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    posts.length > 0 && (
      <div className="menu bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow-lg text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">תרגילים נוספים שיכולים לעניין אותך 😉</h1>
        <div className="grid grid-cols-1 gap-6">
          {visiblePosts.map((post) => (
            <div
              className="post bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              key={post._id}
              style={{ width: '100%', height: 'auto' /* Adjust width and height here */ }}
            >
              <h2 className="text-xl font-semibold mb-4 text-center">{post.title}</h2>
              <p className="text-sm mb-2 text-center">קטגוריה: {post.cat}</p>
              <div className="w-full h-40 mb-4">
                <video className="w-full h-full object-cover rounded-md" controls>
                  <source src={`${post.videoUrl}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="flex justify-center">
                <Link to={`/post/${post._id}`}>
                  <button className="bg-blue-500 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors duration-200">
                    קרא עוד
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMorePosts}
              className="bg-blue-500 dark:bg-blue-700 text-white py-2 px-6 rounded-md hover:bg-blue-600 dark:hover:bg-blue-800 transition duration-200 flex items-center justify-center"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    )
  );
};

export default Menu;
