import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const Menu = ({ cat, currentPostId }) => {
  const [posts, setPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true); // Loading state
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
        setLoading(false); // Set loading to false after fetching
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
    return <div>Loading...</div>; // You can replace this with a spinner or any loading indicator
  }

  return (
    posts.length > 0 && (
      <div className="menu bg-gray-100 p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Other Posts You May Like 😉</h1>
        {visiblePosts.map((post) => (
          <div
            className="post bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow duration-300"
            key={post._id}
          >
            <div className="w-full h-40 mb-4">
              <video className="w-full h-full object-cover rounded-md" controls>
                <source src={`${post.videoUrl}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <Link to={`/post/${post._id}`}>
              <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200">
                Read More
              </button>
            </Link>
          </div>
        ))}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              onClick={loadMorePosts}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    )
  );
};

export default Menu;
