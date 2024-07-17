import React, { useContext, useEffect, useState, Suspense, lazy } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { useApi } from "../context/ApiContext";
import Edit from "../img/edit.png";
import Delete from "../img/delete.png";

// Lazy load the Menu component
const Menu = lazy(() => import("../components/Menu"));

const Single = () => {
  const [post, setPost] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);
  const apiUrl = useApi();
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/posts/${postId}`);
        setPost(res.data);
        setCategory(res.data.cat);
        // Initialize rating state
        const userRating = res.data.ratings.find(r => r.userId === currentUser._id)?.value || 0;
        setUserRating(userRating);

        setLiked(res.data.likes.includes(currentUser._id));
        setDisliked(res.data.dislikes.includes(currentUser._id));
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [postId, apiUrl, currentUser._id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${apiUrl}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const formatDuration = (duration) => {
    if (!duration) return "";
    const { hours, minutes, seconds } = duration;
    return `${hours || 0}h ${minutes || 0}m ${seconds || 0}s`;
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-2xl ${i <= (hover || userRating) ? "text-yellow-500" : "text-gray-300"} ${i < 5 ? 'mr-1 md:mr-2' : ''}`}
          onClick={() => updateRating(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(userRating)}
        >
          &#9733;
        </button>
      );
    }
    return stars;
  };

  const updateRating = async (newRating) => {
    try {
      await axios.put(`${apiUrl}/api/posts/${postId}/rate`, { rating: newRating }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserRating(newRating);
      const res = await axios.get(`${apiUrl}/api/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLike = async () => {
    try {
      await axios.put(`${apiUrl}/api/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLiked(true);
      setDisliked(false);
      const res = await axios.get(`${apiUrl}/api/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDislike = async () => {
    try {
      await axios.put(`${apiUrl}/api/posts/${postId}/dislike`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setLiked(false);
      setDisliked(true);
      const res = await axios.get(`${apiUrl}/api/posts/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="single p-4 md:p-8 mt-40 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <div className="category text-center py-4 bg-gray-100 dark:bg-gray-800 mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {post.cat && `Category: ${post.cat}`}
        </h2>
      </div>
      <div className="content text-center space-y-4">
        <div className="user flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          {(currentUser?.username === post.username || currentUser?.role === 'admin') && (
            <div className="edit flex space-x-4">
              <Link to={`/write?edit=${postId}`} state={post}>
                <img src={Edit} alt="Edit" className="w-6 h-6" />
              </Link>
              <img onClick={handleDelete} src={Delete} alt="Delete" className="w-6 h-6 cursor-pointer" />
            </div>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.explanation }} className="text-base md:text-lg px-4 md:px-0" />
        {post.videoUrl && (
          <div className="video space-y-2">
            <video className="videoPosts w-full max-w-full h-auto md:w-1/2 md:mx-auto" controls>
              <source src={post.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        <div className="adaptations text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-lg">
          <h2 className="text-lg md:text-xl font-bold mb-4">Adaptations</h2>
          <div className="overflow-hidden">
            <table className="w-1/2 mx-auto divide-y divide-gray-200 dark:divide-gray-600 text-center">
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                <tr>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-gray-100">Duration:</td>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">{formatDuration(post.duration)}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-gray-100">Adapted for Third Age:</td>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">{post.adaptedForThirdAge ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-gray-100">Adapted for Children:</td>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">{post.adaptedForChildren ? 'Yes' : 'No'}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-gray-100">Rating:</td>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex justify-center items-center space-x-1 md:space-x-2">
                      {renderStars()}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-gray-100">Like / Dislike:</td>
                  <td className="px-2 py-2 md:px-4 md:py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex justify-center items-center space-x-1 md:space-x-2">
                    <button
                      onClick={handleLike}
                      className={`text-2xl transform transition-transform duration-200 ${liked ? "text-blue-500 scale-150" : "text-gray-300 dark:text-gray-500"}`}
                      onMouseEnter={(e) => e.target.classList.add("scale-110")}
                      onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                    >
                      &#128077;
                    </button>
                    <button
                      onClick={handleDislike}
                      className={`text-2xl transform transition-transform duration-200 ${disliked ? "text-red-500 scale-150" : "text-gray-300 dark:text-gray-500"}`}
                      onMouseEnter={(e) => e.target.classList.add("scale-110")}
                      onMouseLeave={(e) => e.target.classList.remove("scale-110")}
                    >
                      &#128078;
                    </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {category && (
        <Suspense fallback={<div>Loading...</div>}>
          <Menu cat={category} currentPostId={post._id} />
        </Suspense>
      )}
    </div>
  );
};

export default Single;
