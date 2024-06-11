import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { useApi } from "../context/ApiContext";
import Edit from "../img/edit.png";
import Delete from "../img/delete.png";

const Single = () => {
  const [post, setPost] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);
  const apiUrl = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [postId, apiUrl]);

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
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="single p-4 md:p-8 mt-40">
      <div className="category text-center py-4 bg-gray-100 mb-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {post.cat && `Category: ${post.cat}`}
        </h2>
      </div>
      <div className="content text-center space-y-4">
        <div className="user flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          {post.userImg && (
            <img src={post.userImg} alt="" className="w-16 h-16 rounded-full mx-auto md:mx-0" />
          )}
          <div className="info text-center">
            <span className="block text-lg font-semibold">{post.username}</span>
            <p className="text-gray-600 text-md font-bold items-center">Duration: {formatDuration(post.duration)}</p>
          </div>
          {(currentUser?.username === post.username || currentUser?.role === 'admin') && (
            <div className="edit flex space-x-4">
              <Link to={`/write?edit=${postId}`} state={post}>
                <img src={Edit} alt="Edit" className="w-6 h-6" />
              </Link>
              <img onClick={handleDelete} src={Delete} alt="Delete" className="w-6 h-6 cursor-pointer" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-base">{getText(post.explanation)}</p>
        {post.videoUrl && (
          <div className="video space-y-2">
            <video className="videoPosts w-full max-w-full h-auto md:w-1/2 md:mx-auto" controls>
              <source src={post.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        <div className="adaptations text-center">
          <p>Adapted for Third Age: {post.adaptedForThirdAge ? 'Yes' : 'No'}</p>
          <p>Adapted for Children: {post.adaptedForChildren ? 'Yes' : 'No'}</p>
        </div>
      </div>
      <Menu cat={post.cat} currentPostId={post._id} />
    </div>
  );
};

export default Single;
