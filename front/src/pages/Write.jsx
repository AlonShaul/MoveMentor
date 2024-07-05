import axios from "axios";
import React, { useState, useContext, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useCategories } from "../context/CategoryContext";
import { AuthContext } from "../context/authContext";
import { useApi } from "../context/ApiContext";
import backgroundImage from "../img/wp7935249.jpg";

const Write = () => {
  const location = useLocation();
  const state = location.state || {};
  const postId = state._id || null; // Ensure the postId is correctly set from state
  const [title, setTitle] = useState(state.title || "");
  const [value, setValue] = useState(state.explanation || ""); // Correct the field name here
  const [videoUrl, setVideoUrl] = useState(state.videoUrl || "");
  const [minutes, setMinutes] = useState(state.duration?.minutes || 0);
  const [seconds, setSeconds] = useState(state.duration?.seconds || 0);
  const [adaptedForThirdAge, setAdaptedForThirdAge] = useState(state.adaptedForThirdAge || false);
  const [adaptedForChildren, setAdaptedForChildren] = useState(state.adaptedForChildren || false);
  const [cat, setCat] = useState(state.cat || "");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { currentUser } = useContext(AuthContext);
  const apiUrl = useApi();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const uploadWithCloudinary = (setUrl) => {
    setIsUploading(true);
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dd25naa0y',
        uploadPreset: 'tyseebss',
        sources: ["local", "url", "camera"],
        multiple: false,
        resourceType: "auto"
      },
      (error, result) => {
        if (error) {
          console.error("Upload Widget error:", error);
          setIsUploading(false);
        } else {
          if (result.event === "success") {
            console.log("Upload Widget result:", result);
            setUrl(result.info.secure_url);
            setIsUploading(false);
          }
        }
      }
    );
  };

  const handleClick = async (e) => {
    e.preventDefault();
  
    if (!title || !value || !cat || !videoUrl) {
      alert("Please fill out all fields and upload the required media.");
      return;
    }
  
    const duration = {
      minutes: parseInt(minutes, 10),
      seconds: parseInt(seconds, 10)
    };

    // Debugging logs to verify data

  
    try {
      const postData = {
        title,
        explanation: value, // Ensure value is correctly mapped to explanation
        videoUrl,
        duration,
        adaptedForThirdAge,
        adaptedForChildren,
        cat,
        uid: currentUser._id
      };
  
      let res;
      if (postId) {
        // Update existing post
        res = await axios.put(`${apiUrl}/api/posts/${postId}`, postData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        // Create new post
        res = await axios.post(`${apiUrl}/api/posts`, postData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      navigate(`/?cat=${cat}`);
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <div
      className="flex flex-col items-center p-4 mt-20 min-h-screen bg-cover bg-center" 
      style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="w-full max-w-4xl bg-sky-200 p-6 rounded-lg shadow-lg">
        <div className="p-4 bg-blue-50 rounded-lg shadow-md mb-4">
          <input
            type="text"
            value={title}
            placeholder="כותרת"
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-right bg-blue-50"
          />
        </div>
        <div className="inputText p-4 bg-blue-50 rounded-lg shadow-md mb-10">
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={(content, delta, source, editor) => {
              setValue(editor.getHTML()); // Ensure the value is correctly set
            }}
          />
        </div>
        <div className="mb-10 p-4 bg-blue-50 rounded-lg shadow-md">
          <h1 className="text-lg font-bold mb-2 text-right text-blue-800 border-b-2 pb-2">קטגוריה</h1>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((category) => (
              <div className="flex items-center justify-between" key={category}>
                <label htmlFor={category} className="mx-0 flex-1 text-right">{category.charAt(0).toUpperCase() + category.slice(1)}</label>
                <input
                  type="radio"
                  checked={cat === category}
                  name="cat"
                  value={category}
                  id={category}
                  onChange={(e) => setCat(e.target.value)}
                  className="ml-2"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mb-10 p-4 bg-blue-50 rounded-lg shadow-md">
          <h1 className="text-lg font-bold mb-2 text-right text-blue-800 border-b-2 pb-2">משך</h1>
          <div className="flex justify-center space-x-4">
            <div className="flex-1">
              <label className="block text-center">דקות</label>
              <input
                type="number"
                value={minutes}
                placeholder="דקות"
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-2 shadow-sm text-center"
              />
            </div>
            <div className="flex-1">
              <label className="block text-center">שניות</label>
              <input
                type="number"
                value={seconds}
                placeholder="שניות"
                onChange={(e) => setSeconds(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-2 shadow-sm text-center"
              />
            </div>
          </div>
        </div>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-md">
          <h1 className="text-lg font-bold mb-2 text-right text-blue-800 border-b-2 pb-2">התאמות</h1>
          <div className="flex items-center justify-end mb-2">
            <label className="mr-2">מותאם לגיל השלישי</label>
            <input
              type="checkbox"
              checked={adaptedForThirdAge}
              onChange={(e) => setAdaptedForThirdAge(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
          <div className="flex items-center justify-end">
            <label className="mr-2">מותאם לילדים</label>
            <input
              type="checkbox"
              checked={adaptedForChildren}
              onChange={(e) => setAdaptedForChildren(e.target.checked)}
              className="h-5 w-5"
            />
          </div>
        </div>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow-md">
          <h1 className="text-lg font-bold mb-2 text-right text-blue-800 border-b-2 pb-2">וידאו</h1>
          <button
            onClick={() => uploadWithCloudinary(setVideoUrl)}
            disabled={isUploading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg mb-2 hover:bg-blue-600 transition duration-200 shadow-md"
          >
            {isUploading ? "Uploading..." : "העלאת וידאו"}
          </button>
          {videoUrl && <p className="text-sm text-gray-500 mb-2">וידאו הועלה: {videoUrl}</p>}
        </div>
        <button
          onClick={handleClick}
          className={`w-full py-3 rounded-lg transition duration-200 shadow-md ${postId ? "bg-cyan-500 hover:bg-cyan-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`}
        >
          {postId ? "ערוך" : "פרסם"}
        </button>
      </div>
    </div>
  );
};

export default Write;
