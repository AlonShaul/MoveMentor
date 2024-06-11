import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/authContext";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postsPerPage, setPostsPerPage] = useState(2);

  const location = useLocation();
  const apiUrl = useApi();
  const { currentUser } = useAuth();

  const cat = new URLSearchParams(location.search).get('cat');
  useEffect(() => {
    const updatePostsPerPage = () => {
      if (window.innerWidth >= 768) {
        setPostsPerPage(8);
      } else {
        setPostsPerPage(2);
      }
    };

    updatePostsPerPage();

    window.addEventListener('resize', updatePostsPerPage);
    return () => window.removeEventListener('resize', updatePostsPerPage);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/posts`, {
          params: { category: cat }
        });
        const filteredPosts = cat ? res.data.filter((post) => post.cat === cat) : res.data;
        setPosts(filteredPosts);
        setVisiblePosts(filteredPosts.slice(0, postsPerPage));
        setHasMore(filteredPosts.length > postsPerPage);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [cat, apiUrl, postsPerPage]);

  const loadMorePosts = () => {
    const nextPage = currentPage + 1;
    const newVisiblePosts = posts.slice(0, nextPage * postsPerPage);
    setVisiblePosts(newVisiblePosts);
    setCurrentPage(nextPage);
    setHasMore(posts.length > newVisiblePosts.length);
  };

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent;
  };

  return (
    <div className="home mt-20 p-4 md:p-8">
      <div className="posts grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiblePosts.map((post) => (
          <div className="post bg-white shadow-md rounded-lg overflow-hidden" key={post._id}>
            <div className="media w-full h-48 bg-gray-200">
              {post.img && post.img.includes("video") ? (
                <video className="w-full h-full object-cover" controls>
                  <source src={post.img} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img className="w-full h-full object-cover" src={post.img} alt="" />
              )}
            </div>
            <div className="content p-4">
              <Link className="link" to={`/post/${post._id}`}>
                <h1 className="bg-cyan-500 text-white text-xl font-bold p-2 rounded">{post.title}</h1>
              </Link>
              <p className="mt-2 text-gray-700">{getText(post.desc).substring(0, 100)}...</p>
              {currentUser?.role === 'admin' && (
                <Link className="link" to={`/write?edit=${post._id}`} state={post}>
                  <button className="readMoreHome mt-4 bg-cyan-500 text-white py-2 px-4 rounded hover:bg-cyan-600 transition duration-200">
                    Edit
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
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
  );
};

export default Home;
