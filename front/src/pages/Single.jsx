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

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`text-2xl ${i <= (hover || userRating) ? "text-yellow-500" : "text-gray-300"} ${i < 5 ? 'ml-1 md:ml-2' : ''}`}
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
    <div className="single p-4 md:p-20 mt-28 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white" dir="rtl">
      <div className="flex flex-col md:flex-row gap-32">
        <div className="flex-1">
          <h1 className="text-5xl font-bold mb-12 text-right">קטגוריה: {post.cat}</h1>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          <div className="description mb-6 text-base md:text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: post.explanation }} />
          <div className="video-container mb-6" style={{ width: '100%', height: 'auto' /* Adjust width and height here */ }}>
            {post.videoUrl && (
              <video className="w-full h-full rounded-md shadow-md" controls style={{ width: '100%', height: 'auto' /* Adjust width and height here */ }}>
                <source src={post.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg shadow-md">
            {(currentUser?.username === post.username || currentUser?.role === 'admin') && (
              <div className="edit-delete flex space-x-0 justify-between mb-10">
                <Link to={`/write?edit=${postId}`} state={post}>
                  <img src={Edit} alt="Edit" className="w-8 h-8 transition-transform transform hover:scale-110" />
                </Link>
                <img onClick={handleDelete} src={Delete} alt="Delete" className="w-8 h-8 cursor-pointer transition-transform transform hover:scale-110" />
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <div className="likes-dislikes flex items-center space-x-4 mb-4 md:mb-0">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 text-lg ${liked ? "text-blue-500" : "text-gray-500"} transition-transform transform ${liked ? "scale-150" : ""}`}
                  onMouseEnter={(e) => e.target.classList.add("scale-125")}
                  onMouseLeave={(e) => e.target.classList.remove("scale-125")}
                >
                  <span>👍</span><span>{post.likes?.length || 0}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`flex items-center space-x-1 text-lg ${disliked ? "text-red-500" : "text-gray-500"} transition-transform transform ${disliked ? "scale-150" : ""}`}
                  onMouseEnter={(e) => e.target.classList.add("scale-125")}
                  onMouseLeave={(e) => e.target.classList.remove("scale-125")}
                >
                  <span>👎</span><span>{post.dislikes?.length || 0}</span>
                </button>
              </div>
              <div dir="ltr" className="rating flex items-center space-x-1 mb-4 md:mb-0">
                {renderStars()}
              </div>
            </div>
            <div className="flex flex-col items-center mt-4 space-y-4">
              <div className="flex items-center p-2 rounded-lg text-gray-900 dark:text-white justify-center">
                <span className="text-sm md:text-base font-bold">מותאם למבוגרים:&nbsp;</span>
                <span className="text-sm md:text-base">{post.adaptedForThirdAge ? 'כן' : 'לא'}</span>
              </div>
              <div className="flex items-center p-2 rounded-lg text-gray-900 dark:text-white justify-center">
                <span className="text-sm md:text-base font-bold">מותאם לילדים:&nbsp;</span>
                <span className="text-sm md:text-base">{post.adaptedForChildren ? 'כן' : 'לא'}</span>
              </div>
            </div>
          </div>

        </div>
        <div className="w-full md:w-1/4" style={{ height: 'auto' }}>
          <div className="related-videos h-full overflow-y-auto">
            {category && (
              <Suspense fallback={<div className="flex justify-center items-center h-40">Loading...</div>}>
                <Menu cat={category} currentPostId={post._id} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Single;
